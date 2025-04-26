// require('dotenv').config();
//
// const stripe = require('stripe')(process.env.STRIPE_KEY);
//
// exports.createPaymentIntent = async (req, res) => {
//     try {
//         const { amount, currency } = req.body;
//
//         if (!amount || !currency) {
//             return res.status(400).json({ error: 'Missing amount or currency' });
//         }
//         console.log('holllllllaa',process.env.NODE_ENV);
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: amount, // Amount in cents
//             currency: currency,
//             payment_method_types: ['card'], // Specify the valid payment methods
//         });
//
//         res.json({ clientSecret: paymentIntent.client_secret });
//     } catch (error) {
//         console.error('❌ Error creating PaymentIntent:', error);
//         res.status(500).json({ error: error.message });
//     }
// };
