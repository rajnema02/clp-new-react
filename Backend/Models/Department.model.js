const mongoose = require('mongoose')

const DepartmentSchema =  new mongoose.Schema({
    name: {
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
const Department = mongoose.model('department', DepartmentSchema)

module.exports = Department