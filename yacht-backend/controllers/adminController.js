const User = require('../models/User');
const Yacht = require('../models/Yacht');
const Review = require('../models/Review');
const {createNotification} = require("./notificationController");
const sendEmail = require("../helpers/sendmail");

const getPendingUsers = async (req, res) => {
    try {
        const pendingUsers = await User.find({isValidatedByAdmin: false});
        res.status(200).json(pendingUsers);
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des utilisateurs en attente:', error);
        res.status(500).json({message: 'Erreur serveur.'});
    }
};

const getUsers = async (req, res) => {
    console.log('holla')
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error(' Erreur lors de la récupération des utilisateurs en attente:', error);
        res.status(500).json({message: 'Erreur serveur.'});
    }
};

const approveUser = async (req, res) => {
    try {
        const {userId} = req.params;

        // ✅ Update user validation status
        const updatedUser = await User.findByIdAndUpdate(userId, {isValidatedByAdmin: true}, {new: true});

        if (!updatedUser) {
            return res.status(404).json({message: "Utilisateur non trouvé."});
        }

        // ✅ Create a notification for the user
        const notification = {
            user: userId,
            userCreate: req.user._id, // Assuming the admin user is stored in req.user
            type: 'account_approved',
            message: `🎉 Félicitations ! Votre compte a été validé par l'administration.`,
            url: `/dashboard/${updatedUser.role}/list`,
        };
        await createNotification(notification);

        // ✅ Send Email Notification
        await sendEmail({
            email: updatedUser.email,
            subject: "🎉 Validation de votre compte - MASTER YACHT",
            template: "account-approval",
            name: updatedUser.name,
            role: updatedUser.role === 'owner' ? 'Propriétaire' : 'Client'

        });

        res.status(200).json({message: 'Utilisateur validé avec succès et notification envoyée.'});

    } catch (error) {
        console.error('❌ Erreur lors de l\'approbation de l\'utilisateur:', error);
        res.status(500).json({message: 'Erreur serveur.'});
    }
};

const blockUser = async (req, res) => {
    try {
        const {userId} = req.params;

        // Fetch the user first
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({message: "Utilisateur non trouvé."});
        }

        // Toggle isBlockedByAdmin
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {isBlockedByAdmin: !user.isBlockedByAdmin},
            {new: true}
        );

        const statusMessage = updatedUser.isBlockedByAdmin ? "Bloqué" : "Débloqué";

        const notification = {
            user: userId,
            userCreate: req.user._id, // Assuming the admin user is stored in req.user
            type: 'account_status_update',
            message: `Votre compte a été ${statusMessage} par l'administration.`,
            url: '/dashboard',
        };
        await createNotification(notification);

        await sendEmail({
            email: updatedUser.email,
            subject: `Votre compte a été ${statusMessage} - MASTER YACHT`,
            template: "account-status",
            name: updatedUser.name,
            statusMessage
        });


        res.status(200).json({message: `Utilisateur ${statusMessage} avec succès.`});

    } catch (error) {
        console.error("❌ Erreur lors du blocage/déblocage de l'utilisateur:", error);
        res.status(500).json({message: "Erreur serveur."});
    }
};


const getAllYachts = async (req, res) => {
    try {
        const pendingYachts = await Yacht.find({isDeleted: false}).populate('owner', 'name email image');
        res.status(200).json(pendingYachts);
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des yachts en attente:', error);
        res.status(500).json({message: 'Erreur serveur.'});
    }
};

const approveYacht = async (req, res) => {
    try {
        const {yachtId} = req.params;
        const yacht = await Yacht.findById(yachtId);
        if (!yacht) {
            return res.status(404).json({message: "Yacht non trouvé."});
        }
        const isApproved = !yacht.isValidatedByAdmin;
        const yachtUpdate = await Yacht.findByIdAndUpdate(
            yachtId,
            {isValidatedByAdmin: !yacht.isValidatedByAdmin},
            {new: true}
        ).populate('owner', 'name email');
        const statusMessage = isApproved ? "approuvé" : "désapprouvé";

        const notification = {
            user: yacht.owner._id,
            userCreate: req.user._id,
            type: 'yacht_status_update',
            message: `Votre yacht "${yacht.name}" a été ${statusMessage} par l'administration.`,
            url: `/dashboard/owner/list`,
        };
        await createNotification(notification);
        await sendEmail({
            email: yachtUpdate.owner.email,
            subject: `Statut de votre yacht "${yachtUpdate.name}" - MASTER YACHT`,
            template: "yacht-status",
            name: yachtUpdate.owner.name,
            yachtName: yachtUpdate.name,
            statusMessage

        });
        res.status(200).json({message: 'Yacht validé avec succès.'});
    } catch (error) {
        console.error('❌ Erreur lors de l\'approbation du yacht:', error);
        res.status(500).json({message: 'Erreur serveur.'});
    }
};


const getPendingReviews = async (req, res) => {
    console.log('hereee')
    try {
        const reviews = await Review.find({isValidatedByAdmin: false}).populate('client', 'name email image').populate('yacht', 'name image');
        res.status(200).json(reviews);
    } catch (error) {
        console.error("❌ Error fetching pending reviews:", error);
        res.status(500).json({message: "Erreur serveur lors de la récupération des avis."});
    }
};

const approveReview = async (req, res) => {
    try {
        const {reviewId} = req.params;

        // Retrieve review details along with client and yacht owner info
        const review = await Review.findById(reviewId)
            .populate('client', 'name image email')
            .populate({
                path: 'yacht',
                select: 'name owner',
                populate: {path: 'owner', select: 'name email'}
            });

        if (!review) {
            return res.status(404).json({message: "Avis non trouvé."});
        }

        // ✅ Approve the review
        await Review.findByIdAndUpdate(reviewId, {isValidatedByAdmin: true});
        console.log('review.client',review.client)
        const clientNotification = {
            user: review.client._id,
            userCreate: req.user._id,
            type: 'review_approval',
            message: `Votre avis sur le yacht "${review.yacht.name}" a été approuvé par l'administration.`,
            url: `/dashboard/client/add-review/${review.booking}`,
        };
        await createNotification(clientNotification);

        const ownerNotification = {
            user: review.yacht.owner._id,
            userCreate: review.client._id,
            type: 'new_review',
            message: `Un nouveau avis a été ajouté pour votre yacht "${review.yacht.name}".`,
            url: `/dashboard/owner/yacht-reviews/${review.yacht._id}`,
        };
        await createNotification(ownerNotification);

        await sendEmail({
            email: review.client.email,
            subject: `Votre avis a été approuvé - MASTER YACHT`,
            template: "review-approved",

            name: review.client.name,
            yachtName: review.yacht.name,
            reviewComment: review.comment

        });

        await sendEmail({
            email: review.yacht.owner.email,
            subject: `Nouveau avis sur votre yacht - MASTER YACHT`,
            template: "new-review-owner",

            ownerName: review.yacht.owner.name,
            yachtName: review.yacht.name,
            clientName: review.client.name,
            reviewComment: review.comment,
            reviewRating: review.rating

        });

        res.status(200).json({message: "Avis validé avec succès et notifications envoyées."});

    } catch (error) {
        console.error("❌ Erreur lors de l'approbation de l'avis:", error);
        res.status(500).json({message: "Erreur serveur lors de l'approbation de l'avis."});
    }
};

const deleteReview = async (req, res) => {
    try {
        const {reviewId} = req.params;
        const review = await Review.findById(reviewId).populate('client', 'name email').populate('yacht', 'name');
        if (!review) {
            return res.status(404).json({message: "Avis non trouvé."});
        }

        await Review.findByIdAndDelete(reviewId);

        const notification = {
            user: review.client._id,
            userCreate: req.user._id,
            type: 'review_deletion',
            message: `Votre avis sur le yacht "${review.yacht.name}" a été supprimé par l'administration.`,
            url: `/dashboard/client/reviews`,
        };
        await createNotification(notification);

        await sendEmail({
            email: review.client.email,
            subject: `Votre avis a été supprimé - MASTER YACHT`,
            template: "review-deleted",

            name: review.client.name,
            yachtName: review.yacht.name,
            reviewComment: review.comment

        });
        res.status(200).json({message: "Avis supprimé avec succès."});
    } catch (error) {
        console.error("❌ Error deleting review:", error);
        res.status(500).json({message: "Erreur serveur lors de la suppression de l'avis."});
    }
};

module.exports = {
    getPendingUsers,
    approveUser,
    blockUser,
    getAllYachts,
    approveYacht,
    getUsers,
    deleteReview,
    approveReview,
    getPendingReviews
};
