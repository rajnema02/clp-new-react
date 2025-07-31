const mongoose = require('mongoose')

const PageSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
    },
    seo_title: {
        type: String,
    },
    seo_description: {
        type: String,
    },
    header: {
        type: JSON,
        default: {}
    },
    content: {
        type: Array,
        default: []
    },
    footer: {
        type: JSON,
        default: {}
    },
    slug: {
        type: String
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

const Page = mongoose.model('page', PageSchema)

module.exports = Page