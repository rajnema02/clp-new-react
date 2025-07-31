const mongoose = require('mongoose')

const KnowledgeSchema =  new mongoose.Schema({
    file: {
        type: String,
    },
    title: {
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
const Knowledge = mongoose.model('knowledge', KnowledgeSchema)

module.exports = Knowledge