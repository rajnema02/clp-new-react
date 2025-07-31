const mongoose = require('mongoose');

const ServiceOfferSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    file: {
        type: String,
    },
    disabled: {
        type: Boolean,
        default: false
    },
    is_inactive: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    created_by: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    updated_at: {
        type: Date
    },
    deleted_at: {
        type: Date
    },
    restored_at: {
        type: Date
    }
});

const ServiceOffer = mongoose.model('ServiceOffer', ServiceOfferSchema);

module.exports = ServiceOffer;
