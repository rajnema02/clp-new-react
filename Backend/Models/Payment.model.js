const mongoose = require('mongoose')

const PaymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId
  },
  orderId: {
    type: String
  },
  trnAmt: {
    type: String
  },
  trnRefNo: {
    type: String
  },
  trnReqDate: {
    type: String
  },
  responseCode: {
    type: String
  },
  authZCode: {
    type: String
  },
  rrn: {
    type: String
  },
  trnCurrency: {
    type: String,
    default: 'INR'
  },
  trnRemarks: {
    type: String
  },
  meTransReqType: {
    type: String,
    defafult: 'S'
  },
  recurrPeriod: {
    type: String
  },
  recurrDay: {
    type: String
  },
  noOfRecurring: {
    type: String
  },
  responseUrl: {
    type: String
  },
  addField1: {
    type: String
  },
  addField2: {
    type: String
  },
  addField3: {
    type: String
  },
  addField4: {
    type: String
  },
  addField5: {
    type: String
  },
  addField6: {
    type: String
  },
  addField7: {
    type: String
  },
  addField8: {
    type: String
  },
  addField9: {
    type: String
  },
  addField10: {
    type: String
  },
  reqMsg: {
    type: String
  },
  statusDesc: {
    type: String
  },
  created_at: {
    type: Date
  },
  transactionStatus: {
    type: String,
    default: 'pending'
  },
  gatewayResponse: {
    type: JSON,
    default: {}
  },

  created_by: {
    type: mongoose.Types.ObjectId
  },

  updated_at: {
    type: Date
  },


})

const Payment = mongoose.model('Payment', PaymentSchema);
module.exports = Payment