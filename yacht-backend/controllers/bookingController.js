const Yacht = require('../models/Yacht');
const Booking = require('../models/Booking');
const sendEmail = require("../helpers/sendmail");
const {createNotification} = require("./notificationController");

exports.checkAvailability = async (req, res) => {
    try {
        const {startDate, endDate} = req.body;
        const yachtId = req.params.id;

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end <= start) {
            return res.status(400).json({
                available: false,
                message: 'La date de fin doit être postérieure à la date de début.'
            });
        }

        const conflictingBooking = await Booking.findOne({
            yacht: yachtId,
            status: {$in: ['accepted', 'payed', 'ongoing']}, // Exclude canceled/pending
            $or: [
                {startDate: {$lte: end}, endDate: {$gte: start}},
            ],
        });

        if (conflictingBooking) {
            return res.status(200).json({
                available: false,
                message: `Dates indisponibles. Une autre réservation (${conflictingBooking.status}) est active sur ces dates.`,
            });
        }

        return res.status(200).json({available: true});

    } catch (error) {
        console.error('❌ Erreur lors de la vérification de disponibilité:', error);
        res.status(500).json({message: 'Erreur serveur lors de la vérification de disponibilité.'});
    }
};


exports.createBooking = async (req, res) => {
    try {
        const {yacht, startDate, endDate} = req.body;

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end <= start) {
            return res.status(400).json({message: 'La date de fin doit être postérieure à la date de début.'});
        }

        const conflictingBooking = await Booking.findOne({
            yacht,
            status: {$in: ['accepted', 'payed', 'ongoing']},
            $or: [
                {startDate: {$lte: end}, endDate: {$gte: start}},
            ],
        });

        if (conflictingBooking) {
            return res.status(400).json({message: 'Les dates sélectionnées ne sont pas disponibles.'});
        }

        const yachtDetails = await Yacht.findById(yacht).populate('owner', 'name email');
        if (!yachtDetails) {
            return res.status(404).json({message: 'Yacht non trouvé.'});
        }

        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const totalPrice = days * yachtDetails.pricePerDay;

        const booking = new Booking({
            client: req.user._id,
            yacht,
            startDate,
            endDate,
            totalPrice,
        });

        await booking.save();

        const notification = {
            user: yachtDetails.owner._id,
            userCreate: req.user._id,
            type: 'new_booking',
            message: `Nouvelle réservation pour le yacht "${yachtDetails.name}".`,
            url: `/dashboard/owner/bookings`,
        };
        await createNotification(notification);

        await sendEmail({
            template: 'booking-confirmation',
            email: req.user.email,
            name: req.user.name,
            subject: 'Confirmation de Réservation - MASTER YACHT',
            yachtName: yachtDetails.name,
            startDate,
            endDate,
            totalPrice,
        });

        await sendEmail({
            template: 'booking-notification-owner',
            email: yachtDetails.owner.email,
            name: yachtDetails.owner.name,
            subject: 'Nouvelle Réservation - MASTER YACHT',
            yachtName: yachtDetails.name,
            clientName: req.user.name,
            startDate,
            endDate,
            totalPrice,
        });

        res.status(201).json({message: 'Réservation effectuée avec succès.', booking});

    } catch (error) {
        console.error('❌ Erreur lors de la création de la réservation:', error);
        res.status(500).json({message: 'Erreur serveur.'});
    }
};
exports.getClientBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({client: req.user._id})
            .populate('yacht', 'name images pricePerDay')
            .sort({createdAt: -1});

        res.status(200).json(bookings);
    } catch (error) {
        console.error('Erreur lors de la récupération des réservations:', error);
        res.status(500).json({message: 'Erreur serveur.'});
    }
};
exports.getClientBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({client: req.user._id})
            .populate('yacht', 'name images pricePerDay')
            .sort({createdAt: -1});

        res.status(200).json(bookings);
    } catch (error) {
        console.error('Erreur lors de la récupération des réservations:', error);
        res.status(500).json({message: 'Erreur serveur.'});
    }
};
exports.getBookingsById = async (req, res) => {
    try {
        const {id} = req.params;
        const booking = await Booking.findById(id)
            .populate({
                path: 'yacht',
                select: 'name images',
            })
            .populate('client', 'name email image')

        console.log('booking', booking)
        if (!booking) {
            return res.status(404).json({message: 'Booking non trouvé.'});
        }
        res.status(200).json(booking);
    } catch (error) {
        console.error('Erreur lors de la récupération des réservations:', error);
        res.status(500).json({message: 'Erreur serveur.'});
    }
};


exports.getOwnerBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate({
                path: 'yacht',
                match: {owner: req.user._id}, // Filter by owner
                select: 'name images',
            })
            .populate('client', 'name email image')
            .sort({createdAt: -1});
        const ownerBookings = bookings.filter((booking) => booking.yacht !== null);
        res.status(200).json(ownerBookings);
    } catch (error) {
        console.error('Erreur lors de la récupération des réservations:', error);
        res.status(500).json({message: 'Erreur serveur.'});
    }
};


exports.updateBookingStatus = async (req, res) => {
    console.log('req.params:', req.params);

    try {
        const { id } = req.params;
        const { status } = req.body;
        const validStatuses = ['pending', 'accepted', 'canceled', 'ongoing', 'done'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Statut non valide.' });
        }

        const updatedBooking = await Booking.findById(id)
            .populate('client', 'name email')
            .populate('yacht', 'name owner')
            .populate({
                path: 'yacht',
                populate: { path: 'owner', select: 'name email' }
            });

        if (!updatedBooking) {
            return res.status(404).json({ message: 'Réservation introuvable.' });
        }

        const client = updatedBooking.client;
        const yacht = updatedBooking.yacht;


        if (req.user._id.toString() !== yacht.owner._id.toString() && status === 'accepted') {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à accepter cette réservation." });
        }

        if (status === 'accepted') {
            await Booking.updateMany(
                {
                    yacht: yacht._id,
                    status: 'pending',
                    _id: { $ne: id },
                    $or: [
                        { startDate: { $lte: updatedBooking.endDate }, endDate: { $gte: updatedBooking.startDate } }
                    ]
                },
                { $set: { status: 'canceled' } }
            );

            console.log(`✅ Autres réservations en attente annulées pour "${yacht.name}"`);

            // 📢 Create Notification for the Client
            const notification = {
                user: client._id,
                userCreate: req.user._id,
                type: 'booking_status_update',
                message: `Le statut de votre réservation pour le yacht "${yacht.name}" est maintenant "${status === 'pending' ? 'En attente' : status === 'accepted' ? 'Accepté' : 'Annulé'}".`,
                url: `dashboard/client/bookings`,
            };
            await createNotification(notification);

            await sendEmail({
                template: 'booking-status-update',
                email: client.email,
                name: client.name,
                subject: 'Mise à jour de votre réservation - MASTER YACHT',
                yachtName: yacht.name,
                status: status,
                startDate: updatedBooking.startDate,
                endDate: updatedBooking.endDate,
                totalPrice: updatedBooking.totalPrice,
            });

        }


        const finalUpdatedBooking = await Booking.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );


        res.status(200).json({
            message: 'Statut de la réservation mis à jour avec succès.',
            booking: finalUpdatedBooking,
        });

    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour du statut de la réservation:', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
};


