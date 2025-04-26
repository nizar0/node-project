const cron = require('node-cron');
const moment = require('moment');
const Booking = require('../models/Booking');
const { createNotification } = require("../controllers/notificationController");
const sendEmail = require("../helpers/sendmail");

const updateBookingStatuses = async () => {
    try {
        const now = moment().utc();
        const today = now.startOf('day').format();
        const tomorrow = now.add(1, 'days').startOf('day').format();
        const threeDaysAgo = now.subtract(3, 'days').format(); // 72 hours ago

        const remindersForPayment = await Booking.find({
            status: "accepted",
            createdAt: { $lte: threeDaysAgo },
            reminderSent: false
        }).populate('yacht').populate('client');

        for (let booking of remindersForPayment) {
            await Booking.findByIdAndUpdate(booking._id, { reminderSent: true });

            // ✅ **Send Notification & Email**
            await createNotification({
                user: booking.client._id,
                userCreate: booking.yacht.owner._id,
                type: 'payment_reminder',
                message: `Votre réservation pour "${booking.yacht.name}" attend votre paiement depuis 72h.`,
                url: `/dashboard/client/bookings`,
            });

            await sendEmail({
                email: booking.client.email,
                subject: `Rappel : Paiement en attente`,
                template: "booking-reminder-payment",
                name: booking.client.name,
                yachtName: booking.yacht.name
            });
        }
        console.log(` Payment reminders sent: ${remindersForPayment.length}`);

        // ✅ 2️⃣ **Remind Owners for Pending Bookings**
        const remindersForOwners = await Booking.find({
            status: "pending",
            createdAt: { $lte: threeDaysAgo },
            reminderSent: false
        }).populate('yacht').populate('client');

        for (let booking of remindersForOwners) {
            await Booking.findByIdAndUpdate(booking._id, { reminderSent: true });

            await createNotification({
                user: booking.yacht.owner._id,
                userCreate: booking.client._id,
                type: 'owner_reminder',
                message: `Nouvelle réservation pour "${booking.yacht.name}" en attente depuis 72h.`,
                url: `/dashboard/owner/bookings`,
            });

            await sendEmail({
                email: booking.yacht.owner.email,
                subject: `Rappel : Nouvelle réservation en attente`,
                template: "booking-reminder-owner",
                name: booking.yacht.owner.name,
                yachtName: booking.yacht.name
            });
        }
        console.log(` Owner reminders sent: ${remindersForOwners.length}`);

        // ✅ 3️⃣ **Fix Booking Status After System Downtime**
        const outdatedBookings = await Booking.find({
            $or: [
                { status: "payed", startDate: { $lte: today } },  // Change "payed" -> "ongoing"
                { status: "ongoing", endDate: { $lte: today } },  // Change "ongoing" -> "done"
            ]
        }).populate('yacht').populate('client');

        for (let booking of outdatedBookings) {
            let newStatus = booking.status;

            if (booking.status === "payed" && moment(booking.startDate).isSameOrBefore(today)) {
                newStatus = "ongoing";
            } else if (booking.status === "ongoing" && moment(booking.endDate).isSameOrBefore(today)) {
                newStatus = "done";
            }

            if (newStatus !== booking.status) {
                await Booking.findByIdAndUpdate(booking._id, { status: newStatus });

                await createNotification({
                    user: booking.client._id,
                    userCreate: booking.yacht.owner._id,
                    type: 'booking_status_update',
                    message: `Votre réservation pour "${booking.yacht.name}" est maintenant "${newStatus}".`,
                    url: `/dashboard/client/bookings`,
                });

                await sendEmail({
                    email: booking.client.email,
                    subject: `Mise à jour de votre réservation`,
                    template: "booking-status-cron",
                    name: booking.client.name,
                    yachtName: booking.yacht.name,
                    status: newStatus
                });
            }
        }
        console.log(`Status updates done: ${outdatedBookings.length}`);

    } catch (error) {
        console.error(' Erreur lors de la mise à jour des statuts des réservations:', error);
    }
};

const initScheduledJobs = () => {
    console.log("Starting cron job to update booking statuses...");

    cron.schedule("*/1 * * * *", async () => {
        console.log(" Running scheduled booking status updates...");
        await updateBookingStatuses();
    });

    console.log(" Cron job scheduled successfully (Runs every 1 minute).");
};

module.exports = {
    initScheduledJobs,
};
