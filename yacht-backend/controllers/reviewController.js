const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Yacht = require('../models/Yacht');
const User = require('../models/User');
const {createNotification} = require("./notificationController");

// ✅ 1. Add a review (Only if booking is "done")
const addReview = async (req, res) => {
    try {
        const { yacht, rating, comment , bookingId} = req.body;
        const clientId = req.user._id; // Assuming user is authenticated

        // Check if the client has a "done" booking for this yacht
        const booking = await Booking.findOne({
            _id: bookingId,
            status: "done",
        });
        if (!booking) {
            return res.status(403).json({ message: "Vous ne pouvez noter ce yacht que si votre réservation est terminée." });
        }

        // Create a new review
        const newReview = new Review({
            client: clientId,
            yacht: yacht,
            booking: bookingId,
            rating,
            comment,
            isValidatedByAdmin: false,
        });


        await newReview.save();
        const admins = await User.find({ role: 'admin' }).select('_id');
        if (admins.length > 0) {
            const adminNotifications = admins.map(admin => ({
                user: admin._id,
                userCreate: clientId,
                type: 'review_pending',
                message: `Un nouvel avis a été soumis pour validation.`,
                url: `/dashboard/admin/reviews`,
            }));

            // Save all notifications asynchronously
            adminNotifications.map(async notification => await createNotification(notification));
        }
        res.status(201).json({ message: "Votre avis a été soumis pour validation.", review: newReview });

    } catch (error) {
        console.error("❌ Error adding review:", error);
        res.status(500).json({ message: "Erreur serveur lors de l'ajout de l'avis." });
    }
};


const hasReviewed = async (req, res) => {
    try {
        const id = req.params.id;
        const clientId = req.user._id;

        const review = await Review.findOne({ booking: id, client: clientId });

        res.status(200).json({ hasReviewed: !!review });

    } catch (error) {
        console.error('❌ Error checking review:', error);
        res.status(500).json({ message: "Erreur serveur lors de la vérification de l'avis." });
    }
};

const getValidatedReviews = async (req, res) => {
    try {
        const { yachtId } = req.params;
        const reviews = await Review.find({ yacht: yachtId, isValidatedByAdmin: true })
            .populate('client', 'name image');

        res.status(200).json(reviews);

    } catch (error) {
        console.error("❌ Error fetching reviews:", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des avis." });
    }
};

const validateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const review = await Review.findByIdAndUpdate(reviewId, { isValidatedByAdmin: true }, { new: true });

        res.status(200).json({ message: "Avis validé avec succès.", review });

    } catch (error) {
        console.error("❌ Error validating review:", error);
        res.status(500).json({ message: "Erreur serveur lors de la validation de l'avis." });
    }
};

module.exports = { addReview, getValidatedReviews,hasReviewed, validateReview };
