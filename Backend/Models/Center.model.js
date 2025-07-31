const mongoose = require('mongoose');

const CenterSchema = mongoose.Schema({

    center_type: {
        type: String,
        trim: true
    },
    center_name: {
        type: String,
        trim: true
    },
    center_address: {
        type: String,
        trim: true
    },
    center_year: {
        type: String,
        trim: true
    },
    center_regNo: {
        type: String,
        trim: true
    },
    center_regAuthority: {
        type: String,
        trim: true
    },
    center_phone: {
        type: String,
        trim: true
    },
    center_email: {
        type: String,
        trim: true
    },
    center_gst: {
        type: String,
        trim: true
    },
    center_pan: {
        type: String,
        trim: true
    },
    gstFileUpload: {
        type: String
        // data: Buffer, 
        // contentType: String, 
        // fileName: String, 
    },
    panFileUpload: {
        type: String
    },

    chairman_name: {
        type: String,
        trim: true
    },
    chairman_phone: {
        type: String,
        trim: true
    },
    chairman_address: {
        type: String,
        trim: true
    },

    head_name: {
        type: String,
        trim: true
    },
    head_phone: {
        type: String,
        trim: true
    },
    head_address: {
        type: String,
        trim: true
    },


    location_address: {
        type: String,
        trim: true
    },
    state: {
        type: String,
        trim: true
    },
    district: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    pincode: {
        type: String,
        trim: true
    },

    photoFileUpload: {
        type: String
    },
    singatureFileUpload: {
        type: String
    },

    mobile: {
        type: String,
        trim: true
    },
    tel_number: {
        type: String,
        trim: true
    },
    course_type: {
        type: Array,
        trim: true
    },
    course_name: {
        type: Array,
        trim: true
    },
    is_inactive: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date
    }
});



const Center = mongoose.model('Center', CenterSchema);
module.exports = Center;