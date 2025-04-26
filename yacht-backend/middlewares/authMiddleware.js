const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require("../helpers/errorResponse");

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Vérifier le token avec la clé secrète
            const decoded = jwt.verify(token, 'ThmIngsagetR');

            // Attacher l'utilisateur à req.user
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error('Erreur lors de la vérification du token :', error.message);
            return res.status(401).json({ message: 'Non autorisé, token invalide' });
        }
    } else {
        return res.status(401).json({ message: 'Non autorisé, aucun token' });
    }
};

// Middleware pour vérifier les rôles
const areAuthorized = (roles) => {
    return async (req, res, next) => {
        if (roles.includes(req.user.role)) {
            return next();
        }
        return next(new ErrorResponse(`User is not authorized to access this route`, 403));
    };
};

// Générer un token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, 'ThmIngsagetR', {
        expiresIn: '7d',
    });
};

module.exports = { protect, areAuthorized, generateToken };
