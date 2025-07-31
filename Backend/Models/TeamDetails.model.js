const mongoose = require('mongoose');

const TeamDetailsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
    },
    post: {
        type: String,
    },
    description: {
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

const TeamDetails = mongoose.model('TeamDetails', TeamDetailsSchema);

module.exports = TeamDetails;
