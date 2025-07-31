const mongoose = require('mongoose')

const AnprSchema = new mongoose.Schema({
    source: {
        type: String,
        trim: true,
        required: true
    },
    path: {
        type: String,
    },
    input_file: {
        type: String,
    },
    result: {
        type: JSON,
        default: {}
    },
    userid: {
        type: mongoose.Types.ObjectId
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
        type: Date
    },
    created_by: {
        type: mongoose.Types.ObjectId
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
})

const Anpr = mongoose.model('anpr', AnprSchema)

module.exports = Anpr