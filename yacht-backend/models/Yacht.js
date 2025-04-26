const mongoose = require('mongoose');

const yachtSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    pricePerDay: { type: Number, required: true },
    capacity: { type: Number, required: true },
    isValidatedByAdmin: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    images: [{type: String}]
}, { timestamps: true });

module.exports = mongoose.model('Yacht', yachtSchema);
