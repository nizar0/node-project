const Order = require('../models/Order');
const Booking = require('../models/Booking');
const Yacht = require('../models/Yacht');
const User = require('../models/User');


// Obtenir toutes les commandes
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({user : req.user._id})
            .populate({
            path: 'booking',
            populate: { path: 'yacht', select: 'name images' }})
            .populate('user');
        res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des commandes' });
    }
};

const getOwnerEarnings = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Non autorisé, utilisateur non authentifié" });
        }

        const yachts = await Yacht.find({ owner: req.user.id, isDeleted: false }).select('_id name');

        if (yachts.length === 0) {
            return res.status(200).json({ totalEarnings: 0, yachts: [] });
        }

        const yachtIds = yachts.map(yacht => yacht._id);
        const payments = await Order.find({ status: 'paid' }).populate({
            path: 'booking',
            match: { yacht: { $in: yachtIds } },
            populate: { path: 'yacht', select: 'name images' }
        });

        let totalEarnings = 0;
        const yachtEarnings = {};

        payments.forEach(order => {
            if (order.booking && order.booking.yacht) {
                const yachtName = order.booking.yacht.name;
                if (!yachtEarnings[yachtName]) {
                    yachtEarnings[yachtName] = { totalRevenue: 0, reservations: 0 };
                }
                yachtEarnings[yachtName].totalRevenue += order.totalPrice;
                yachtEarnings[yachtName].reservations += 1;
                yachtEarnings[yachtName].images = order.booking.yacht.images ;
                totalEarnings += order.totalPrice;
            }
        });

        res.status(200).json({ totalEarnings, yachts: yachtEarnings });
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des bénéfices:", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};


const  createOrder = async (req, res) => {
    try {
        const { bookingId, stripePaymentId, totalPrice, client } = req.body;

        // Validate required fields
        if (!bookingId || !stripePaymentId || !totalPrice || !client) {
            return res.status(400).json({ message: "Tous les champs sont requis." });
        }

        // Create new Order
        const newOrder = new Order({
            booking: bookingId,
            stripePaymentId: stripePaymentId,
            totalPrice: totalPrice,
            user: client,
            status: 'paid' // Order marked as paid
        });

        await newOrder.save();

        await Booking.findByIdAndUpdate(bookingId, { status: 'payed' });

        res.status(201).json({ message: "Commande créée avec succès et réservation mise à jour.", order: newOrder });
    } catch (error) {
        console.error("❌ Error creating order:", error);
        res.status(500).json({ message: "Erreur serveur lors de la création de la commande." });
    }
};
const getOrderStatistics = async (req, res) => {
    try {
        const orders = await Order.find({ status: "paid" })
            .populate({
                path: 'booking',
                populate: { path: 'yacht', select: 'name owner images' }
            })
            .populate('user', 'name email image');

        if (!orders.length) {
            return res.status(200).json({ message: "Aucune commande payée trouvée." });
        }

        let revenueByOwner = {};  // Stocke les revenus des propriétaires
        let yachtEarnings = {};   // Stocke les revenus des yachts
        let clientPayments = {};  // Stocke les paiements des clients sous forme d'objet

        for (let order of orders) {
            if (order.booking && order.booking.yacht) {
                const { yacht } = order.booking;
                const user = order.user;
                const ownerId = yacht.owner.toString();

                revenueByOwner[ownerId] = (revenueByOwner[ownerId] || 0) + order.totalPrice;

                yachtEarnings[yacht.name] = {
                    revenue: (yachtEarnings[yacht.name]?.revenue || 0) + order.totalPrice,
                    image: yacht.image
                };

                if (!clientPayments[user._id]) {
                    clientPayments[user._id] = {
                        clientName: user.name,
                        clientEmail: user.email,
                        totalPrice: 0,
                        yachtDetails: []
                    };
                }

                clientPayments[user._id].totalPrice += order.totalPrice;
                clientPayments[user._id].yachtDetails.push({
                    yachtName: yacht.name,
                    yachtImage: yacht.image,
                    date: order.createdAt
                });
            }
        }

        const owners = await User.find({ _id: { $in: Object.keys(revenueByOwner) } }).select('name');

        const ownerRevenueArray = owners.map(owner => ({
            ownerName: owner.name,
            revenue: revenueByOwner[owner._id.toString()]
        }));

        res.status(200).json({
            ownerRevenue: ownerRevenueArray,
            yachtEarnings: Object.entries(yachtEarnings).map(([name, data]) => ({
                yachtName: name,
                revenue: data.revenue,
                image: data.image
            })),
            clientPayments: Object.values(clientPayments)
        });

    } catch (error) {
        console.error("❌ Erreur lors de la récupération des statistiques :", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des statistiques." });
    }
};


module.exports = { createOrder, getOrders,getOwnerEarnings ,getOrderStatistics };
