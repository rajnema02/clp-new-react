const mongoose = require('mongoose');

const RegistrationRefInfoSchema = mongoose.Schema({
    transData: {
        type: JSON
    },
    userData: {
        type: JSON
    },
    userId: {
        type: mongoose.Types.ObjectId
    },
    orderId: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date
    }

});


const RegistrationRefInfo = mongoose.model('RegistrationRefInfo', RegistrationRefInfoSchema);
module.exports = RegistrationRefInfo

