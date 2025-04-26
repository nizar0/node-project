const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    yacht: { type: mongoose.Schema.Types.ObjectId, ref: 'Yacht', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'ongoing', 'done', 'canceled'], default: 'pending' },
    reminderSent: { type: Boolean, default: false }

}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
