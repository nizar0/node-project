const User = require('../models/User');
const {generateToken} = require('../middlewares/authMiddleware')
const sendEmail = require('../helpers/sendmail');
const ErrorResponse = require("../helpers/errorResponse");
const {checkAndCreateFolder} = require("../helpers/fileHelpers");

const path = require('path');
const fs = require('fs');
const {createNotification} = require("./notificationController");




exports.registerUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // Vérification si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "L'utilisateur existe déjà" });
        }

        // Gestion de l'image
        let imageUrl = null;

        // Vérifier si un fichier a été envoyé
        if (!req.files || !req.files.image) {
            return next(new ErrorResponse("Veuillez fournir une image", 400));
        }
        const image = req.files.image;

        // Vérifier le type du fichier
        if (!image.mimetype.startsWith("image")) {
            return next(new ErrorResponse("Veuillez télécharger une image valide", 400));
        }

        // Créer le dossier d'upload
        const uploadDir = path.join(__dirname, '../uploads/images/users');
        checkAndCreateFolder(uploadDir);

        // Générer un nom unique pour l'image
        const uniqueImageName = `${Date.now()}-${image.name}`;
        const imagePath = path.join(uploadDir, uniqueImageName);
        imageUrl = `/uploads/images/users/${uniqueImageName}`;

        // Déplacer l'image dans le dossier
        await image.mv(imagePath);

        // Création de l'utilisateur
        const user = new User({
            name,
            email,
            password,
            role,
            image: imageUrl, // Stocker le chemin relatif
        });

        await user.save();

        const admins = await User.find({ role: 'admin' });

        if (admins.length > 0) {
            const adminNotifications = admins.map(admin => ({
                user: admin._id,
                userCreate: user._id,
                type: 'new_user',
                message: `Un nouvel utilisateur "${user.name}" vient de s'inscrire.`,
                url: `/dashboard/admin/users`,
            }));

            // Créer les notifications pour chaque admin
            await Promise.all(adminNotifications.map(notification => createNotification(notification)));
        }
        // Envoi d'un email de bienvenue
        const mailNotif = {
            template: "welcom",
            email: user.email,
            name: user.name,
            subject: "Merci d'avoir choisi la plateforme MASTER YACHT",
        };
        await sendEmail(mailNotif);

        // Réponse réussie
        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
            token: generateToken(user._id),
        });

    } catch (error) {
        console.error("Erreur :", error);

        // Supprimer l'image en cas d'erreur
        if (imageUrl) {
            const imagePath = path.join(__dirname, '..', imageUrl);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        res.status(500).json({ message: "Erreur lors de l'inscription" });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(401).json({ message: "Identifiants incorrects. Veuillez vérifier votre email et mot de passe." });
        }

        if (user.isBlockedByAdmin) {
            return res.status(403).json({ message: "Votre compte a été bloqué par l'administrateur. Contactez le support pour plus d'informations." });
        }

        if (!user.isValidatedByAdmin) {
            return res.status(403).json({ message: "Votre compte n'a pas encore été validé par l'administration. Veuillez patienter." });
        }

        if (await user.matchPassword(password)) {
            return res.status(200).json({
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    image: user.image,
                },
                token: generateToken(user._id),
            });
        } else {
            return res.status(401).json({ message: "Mot de passe incorrect. Veuillez réessayer." });
        }
    } catch (error) {
        console.error("❌ Erreur lors de la connexion :", error);
        res.status(500).json({ message: "Une erreur est survenue. Veuillez réessayer plus tard." });
    }
};


exports.updateUserProfile = async (req, res) => {
    try {
        const { name, email, currentPassword, newPassword } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) return res.status(400).json({ message: "Cet email est déjà utilisé." });
        }

        if (currentPassword && newPassword) {
            user.password = newPassword
        }
        let imageUrl = null;
        if (req.files || req.files?.image) {
            console.log('here')

        const image = req.files.image;

        if (!image.mimetype.startsWith("image")) {
            return next(new ErrorResponse("Veuillez télécharger une image valide", 400));
        }

        const uploadDir = path.join(__dirname, '../uploads/images/users');
        checkAndCreateFolder(uploadDir);

        const uniqueImageName = `${Date.now()}-${image.name}`;
        const imagePath = path.join(uploadDir, uniqueImageName);
        imageUrl = `/uploads/images/users/${uniqueImageName}`;

        await image.mv(imagePath);
            user.image = imageUrl
        }

        if (name) user.name = name;
        if (email) user.email = email;

        await user.save();

        res.status(200).json({ message: "Profil mis à jour avec succès.", user });

    } catch (error) {
        console.error("❌ Erreur mise à jour du profil:", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};
