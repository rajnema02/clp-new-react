const mongoose = require('mongoose')

const AuditQuesCategorySchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: true
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
},
    { timestamps: true }
)

const AuditQuesCategory = mongoose.model('auditQuesCategory', AuditQuesCategorySchema)

module.exports = AuditQuesCategory