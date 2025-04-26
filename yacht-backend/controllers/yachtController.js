const Yacht = require('../models/Yacht');
const {checkAndCreateFolder } = require("../helpers/fileHelpers");
const ErrorResponse = require("../helpers/errorResponse");
const path = require("path");
const Review = require('../models/Review');
const User = require('../models/User');
const {createNotification} = require("./notificationController");
const {existsSync, unlinkSync} = require("node:fs");

// Créer un yacht
exports.createYacht = async (req, res, next) => {
    try {
        let imageUrls = [];

        if (!req.files || !req.files.images) {
            return next(new ErrorResponse("Veuillez fournir au moins une image", 400));
        }

        const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

        const uploadDir = path.join(__dirname, '../uploads/images/yachts');
        checkAndCreateFolder(uploadDir);

        for (let image of images) {
            if (!image.mimetype.startsWith("image")) {
                return next(new ErrorResponse("Veuillez télécharger uniquement des images", 400));
            }

            const uniqueImageName = `${Date.now()}-${image.name}`;
            const imagePath = path.join(uploadDir, uniqueImageName);
            const imageUrl = `/uploads/images/yachts/${uniqueImageName}`;

            await image.mv(imagePath);

            imageUrls.push(imageUrl);
        }

        // ✅ Créer le yacht avec les images
        const yacht = new Yacht({
            ...req.body,
            owner: req.user._id,
            images: imageUrls, // Sauvegarde toutes les images
        });

        await yacht.save();

        // ✅ Envoyer une notification aux administrateurs
        const admins = await User.find({ role: 'admin' }).select('_id');
        if (admins.length > 0) {
            const adminNotifications = admins.map(admin => ({
                user: admin._id,
                userCreate: req.user._id,
                type: 'new_yacht',
                message: `Un nouveau yacht "${yacht.name}" a été ajouté et attend votre validation.`,
                url: `/dashboard/admin/yachts`,
            }));

            adminNotifications.forEach(async (notification) => await createNotification(notification));
        }

        res.status(201).json({ success: true, data: yacht });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Erreur lors de la création du yacht" });
    }
};


exports.updateYacht = async (req, res) => {
    try {
        const yacht = await Yacht.findById(req.params.id);

        if (!yacht) {
            return res.status(404).json({ message: 'Yacht non trouvé' });
        }

        if (yacht.owner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Non autorisé à modifier ce yacht' });
        }

        let imageUrls = yacht.images || []; // Keep existing images if none provided

        // 🔹 If new images are uploaded
        if (req.files && req.files.images) {
            const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
            const uploadDir = path.join(__dirname, '../uploads/images/yachts');
            checkAndCreateFolder(uploadDir);

            // ✅ (Optional) Delete old images if replacing
            if (imageUrls.length > 0) {
                imageUrls.forEach(img => {
                    const oldImagePath = path.join(__dirname, '..', img);
                    if (existsSync(oldImagePath)) {
                        unlinkSync(oldImagePath);
                    }
                });
            }

            imageUrls = []; // Reset and store new images

            // ✅ Process and save new images
            for (let image of images) {
                if (!image.mimetype.startsWith("image")) {
                    return res.status(400).json({ message: "Veuillez télécharger uniquement des images" });
                }

                const uniqueImageName = `${Date.now()}-${image.name}`;
                const imagePath = path.join(uploadDir, uniqueImageName);
                const imageUrl = `/uploads/images/yachts/${uniqueImageName}`;

                await image.mv(imagePath); // Save file
                imageUrls.push(imageUrl);
            }
        }

        // 🚨 Reset validation when modifying
        req.body.isValidatedByAdmin = false;
        req.body.isPublic = false;
        req.body.images = imageUrls; // Save new images

        Object.assign(yacht, req.body); // Update yacht fields
        await yacht.save(); // Save changes

        // 🔔 Notify admins
        const admins = await User.find({ role: 'admin' }).select('_id');
        if (admins.length > 0) {
            const adminNotifications = admins.map(admin => ({
                user: admin._id,
                userCreate: yacht.owner,
                type: 'yacht_updated',
                message: `Le yacht "${yacht.name}" a été mis à jour.`,
                url: `/dashboard/admin/yachts`,
            }));

            adminNotifications.map(async notification => (
                await createNotification(notification)
            ));
        }

        res.status(200).json({
            success: true,
            data: yacht,
            message: 'Yacht mis à jour avec succès',
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du yacht :", error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du yacht' });
    }
};

exports.getAllYachts = async (req, res) => {
    try {
        const yachts = await Yacht.find({ isDeleted : false });
        res.status(200).json( yachts );
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des yachts" });
    }
};
exports.getPublicYachts = async (req, res) => {
    try {
        // 1️⃣ Récupérer les yachts publics validés
        const yachts = await Yacht.find({ isPublic: true, isValidatedByAdmin: true, isDeleted: false });

        if (!yachts.length) {
            return res.status(200).json([]);
        }

        // 2️⃣ Extraire les IDs des yachts
        const yachtIds = yachts.map(yacht => yacht._id);

        // 3️⃣ Récupérer les avis (avec le client qui a posté)
        const reviews = await Review.find({
            yacht: { $in: yachtIds },
            isValidatedByAdmin: true
        })
            .populate('client', 'name image') // Ajoute les infos du client
            .select('yacht rating comment client');

        // 4️⃣ Associer les avis aux yachts correspondants
        const yachtsWithReviews = yachts.map(yacht => {
            const yachtReviews = reviews.filter(review => review.yacht.toString() === yacht._id.toString());
            const averageRating = yachtReviews.length > 0
                ? yachtReviews.reduce((acc, review) => acc + review.rating, 0) / yachtReviews.length
                : null;

            return {
                ...yacht.toObject(),
                averageRating,
                reviews: yachtReviews // Inclure les commentaires et infos clients
            };
        });

        res.json(yachtsWithReviews);
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des yachts publics:', error);
        res.status(500).json({ message: "Erreur lors de la récupération des yachts" });
    }
};
exports.getMyYachts = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Non autorisé, utilisateur non authentifié" });
        }

        // 🔍 Récupérer les yachts appartenant à l'utilisateur
        const yachts = await Yacht.find({ owner: req.user.id, isDeleted: false });

        if (yachts.length === 0) {
            return res.status(200).json([]);
        }

        const yachtIds = yachts.map(yacht => yacht._id);

        // 🔍 Récupérer les avis validés avec les clients associés
        const reviews = await Review.find({
            yacht: { $in: yachtIds },
            isValidatedByAdmin: true
        })
            .select('yacht rating comment createdAt client')
            .populate('client', 'name image email'); // ✅ Inclure les clients ayant laissé un avis

        // 🔄 Associer les avis et la note moyenne à chaque yacht
        const yachtsWithRatings = yachts.map(yacht => {
            const yachtReviews = reviews.filter(review => review.yacht.toString() === yacht._id.toString());

            const averageRating = yachtReviews.length > 0
                ? yachtReviews.reduce((acc, review) => acc + review.rating, 0) / yachtReviews.length
                : null;

            return {
                ...yacht.toObject(),
                averageRating,
                reviews: yachtReviews // ✅ Ajouter les avis du yacht avec le client
            };
        });

        res.json(yachtsWithRatings);

    } catch (error) {
        console.error("❌ Erreur lors de la récupération des yachts :", error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des yachts.' });
    }
};



exports.deleteYacht = async (req, res) => {
    try {
        const yacht = await Yacht.findById(req.params.id);

        if (!yacht) {
            return res.status(404).json({ message: 'Yacht non trouvé' });
        }

        if (yacht.owner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Non autorisé à supprimer ce yacht' });
        }

        await  Yacht.findByIdAndUpdate( req.params.id , {isDeleted: true} ,{ new: true })
        res.status(200).json({ message: 'Yacht supprimé avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la suppression du yacht' });
    }
};

exports.togglePublicStatus = async (req, res) => {
    try {
        const yacht = await Yacht.findById(req.params.id);

        if (!yacht) {
            return res.status(404).json({ message: 'Yacht non trouvé' });
        }

        // Vérifiez si l'utilisateur est le propriétaire du yacht
        if (yacht.owner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Non autorisé à modifier ce yacht' });
        }

        // Inverser le statut isPublic
        yacht.isPublic = !yacht.isPublic;
        await yacht.save();

        res.status(200).json({
            message: 'Statut public modifié avec succès',
            isPublic: yacht.isPublic,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la modification du statut' });
    }
};


exports.getYachtById = async (req, res) => {
    try {
        const yacht = await Yacht.findById(req.params.id);

        if (!yacht) {
            return res.status(404).json({ message: 'Yacht non trouvé' });
        }

        if (yacht.owner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Non autorisé à accéder à ce yacht' });
        }

        res.status(200).json(yacht);
    } catch (error) {
        console.error("Erreur lors de la récupération du yacht :", error);
        res.status(500).json({ message: 'Erreur lors de la récupération du yacht' });
    }
};
exports.getYachtByIdToClient = async (req, res) => {
    try {
        const yacht = await Yacht.findById(req.params.id).populate({
            path: 'owner',
            select: 'name image email' // Fetch owner details
        });

        if (!yacht) {
            return res.status(404).json({ message: 'Yacht non trouvé' });
        }

        if (!yacht.isValidatedByAdmin ) {
            return res.status(401).json({ message: 'Non autorisé à accéder à ce yacht' });
        }

        const reviews = await Review.find({ yacht: yacht._id, isValidatedByAdmin: true })
            .select('rating comment client createdAt')
            .populate({
                path: 'client',
                select: 'name image'
            });

        let averageRating = null;
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            averageRating = totalRating / reviews.length;
        }

        res.status(200).json({
            ...yacht.toObject(),
            averageRating,
            reviews
        });

    } catch (error) {
        console.error("❌ Erreur lors de la récupération du yacht :", error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération du yacht' });
    }
};


