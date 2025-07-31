const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    remark: {
        type: String
    },
    unitPrice: {
        type: Number
    },
    warranty: {
        type: String
    },
    image: {
        type: String
    },
    topCategory: {
        type: mongoose.Types.ObjectId
    },
    userid: {
        type: mongoose.Types.ObjectId
    },
    base_properties: {
        type: Array,
        default: []
    },
    attributes: {
        type: Array,
        default: []
    },
    commission: {
        type: JSON,
        default: {}
    },
    priority: {
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

const Category = mongoose.model('category',CategorySchema)

module.exports = Category