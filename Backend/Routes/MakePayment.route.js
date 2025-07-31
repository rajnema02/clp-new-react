const router = require('express').Router()
const mongoose = require('mongoose')
const CourseModel = require('../Models/Course.model')
const UserModel = require('../Models/User.model')
const PaymentModel = require('../Models/Payment.model')
const RegistrationRefInfoModel = require('../Models/RegistrationRefInfo.model')
const ResMsgDTO = require('../Helpers/ResMsgDTO');
var ReqMsgDTO = require('../Helpers/ReqMsgDTO.js');
var VtransactSecurity = require('../Helpers/VtransactSecurity.js');
var AWLMEAPI = require('../Helpers/AWLMEAPI.js');
const { generateOrderID } = require('../Helpers/helper_functions');


var reqMsgDTO = new ReqMsgDTO();
var resMsgDTO = new ResMsgDTO();

var transactMeAPI = new AWLMEAPI();
var vTransactSecurity = new VtransactSecurity();

router.post('/preTrnReq/:uId/:courseType/:courseName', async function (req, res) {

  try {
    console.log(">>>>ROUTE CALL FOR PAYMENT>>>>>");
    const { uId, courseType, courseName } = req.params
    const formData = req.body
    console.log("FORM DATA", formData);
    const course_name = courseName.split("-")[0]
    const userDetail = await UserModel.findOne({ _id: uId })
    // console.log(resData);
    const query = {};
    if (courseType) {
      console.log(courseType);
      query.course_type = new RegExp(courseType, 'i')
    }
    if (course_name) {
      console.log(course_name);
      query.course_name = new RegExp(course_name, 'i')
    }
    var orderID = generateOrderID()
    const result = await CourseModel.findOne(query)
    var feesPaid = 0
    // console.log("FEES", result[0].fees);
    console.log(result.fees);
    console.log(result.course_type);
    if (result.course_type == "Special Training Program") {
      console.log("COUSE CALLED>>>>>>>>>>>>>>");
      feesPaid = result.fees * 100
    }
    if (result.course_type != "Special Training Program") {
      var feesReg = result.fees + 200
      feesPaid = (feesReg + ((feesReg * 18) / 100)) * 100
    }
    console.log("feesPaid", feesPaid);
    // const resData = {
    //   user: uId, cType: courseType, cName: course_name, webUrl: process.env.WEBSITE_URL,
    //   enyckey: process.env.ENYC_KEY, mid: process.env.M_ID, feesPaid: feesPaid, orderID: orderID
    // }
    // const saveData = {
    //   userId: uId, orderId: orderID, trnAmt: feesPaid, trnCurrency: "INR", trnRemarks: "", meTransReqType: "S", recurrPeriod: "", recurrDay: "", noOfRecurring: "", responseUrl: process.env.WEBSITE_URL, addField1: userDetail.full_name, addField2: userDetail.mobile, addField3: courseType, addField4: course_name
    // }
    const refInfoData = {
      userId: uId,
      orderId: orderID,
      userData: formData,
      transData: {
        trnAmt: feesPaid, trnCurrency: "INR", trnRemarks: "", meTransReqType: "S", recurrPeriod: "", recurrDay: "", noOfRecurring: "", responseUrl: process.env.WEBSITE_URL, addField1: userDetail.full_name, addField2: userDetail.mobile, addField3: courseType, addField4: course_name
      }
    }
    // console.log("saveData", saveData);

    const RegistrationRefInfoData = new RegistrationRefInfoModel(refInfoData)
    const RegistrationRefInfoSave = await RegistrationRefInfoData.save()
    console.log("refInfoData", RegistrationRefInfoSave);
    // const newData = new PaymentModel(saveData)
    // const resultSave = await newData.save()
    if (RegistrationRefInfoSave) {
      console.log("Registration Ref Info Save MODEL SAVED SUCCESSFULLY");
      res.send({ success: true, orderId: orderID })
    }
  } catch (error) {

  }

});




router.get('/meTrnReq/:uId/:courseType/:courseName/:orderId', async function (req, res) {
  try {


    console.log(">>>>ROUTE CALL FOR PAYMENT>>>>>");
    const { uId, courseType, courseName, orderId } = req.params
    // const formData =req.body
    // console.log("FORM DATA", formData);
    const course_name = courseName.split("-")[0]
    const userDetail = await UserModel.findOne({ _id: uId })
    // console.log(resData);
    const query = {};
    if (courseType) {
      console.log(courseType);
      query.course_type = new RegExp(courseType, 'i')
    }
    if (course_name) {
      console.log(course_name);
      query.course_name = new RegExp(course_name, 'i')
    }
    var orderID = orderId
    // var orderID = generateOrderID()
    const result = await CourseModel.findOne(query)
    var feesPaid = 0
    // console.log("FEES", result[0].fees);
    console.log(result.fees);
    console.log(result.course_type);
    if (result.course_type == "Special Training Program") {
      console.log("COUSE CALLED>>>>>>>>>>>>>>");
      feesPaid = result.fees * 100
    }
    if (result.course_type != "Special Training Program") {
      var feesReg = result.fees + 200
      feesPaid = (feesReg + ((feesReg * 18) / 100)) * 100
    }
    console.log("feesPaid", feesPaid);
    const resData = {
      user: uId, cType: courseType, cName: course_name, webUrl: process.env.WEBSITE_URL,
      enyckey: process.env.ENYC_KEY, mid: process.env.M_ID, feesPaid: feesPaid, orderID: orderID
    }
    const saveData = {
      userId: uId, orderId: orderID, trnAmt: feesPaid, trnCurrency: "INR", trnRemarks: "", meTransReqType: "S", recurrPeriod: "", recurrDay: "", noOfRecurring: "", responseUrl: process.env.WEBSITE_URL, addField1: userDetail.full_name, addField2: userDetail.mobile, addField3: courseType, addField4: course_name
    }
    // const refInfoData = {
    //   userId: uId,
    //   orderId: orderID,
    //   userData:formData,
    //   transData: {
    //     trnAmt: feesPaid, trnCurrency: "INR", trnRemarks: "", meTransReqType: "S", recurrPeriod: "", recurrDay: "", noOfRecurring: "", responseUrl: process.env.WEBSITE_URL, addField1: userDetail.full_name, addField2: userDetail.mobile, addField3: courseType, addField4: course_name
    //   }
    // }
    // console.log("refInfoData", refInfoData);
    // console.log("saveData", saveData);

    // const RegistrationRefInfoData = new RegistrationRefInfoModel(refInfoData)
    // const RegistrationRefInfoSave = await RegistrationRefInfoData.save()
    const newData = new PaymentModel(saveData)
    const resultSave = await newData.save()
    if (resultSave) {
      console.log("PAYMENT MODEL SAVED SUCCESSFULLY");
      res.render('meTrnReq', { resData: resData })
    }

  } catch (error) {

  }
});


router.post('/meTrnPay', function (req, res) {
  // console.log(req.body);

  var mid = "";
  if (req.body.mid != null) {
    mid = req.body.mid;
    reqMsgDTO.setMid(mid);
  } else {
    mid = PaytmConfig.mid;
    reqMsgDTO.setMid(mid);
  }

  // Merchant Encryption key 
  var enckey = "";
  if (req.body.encKey != null) {
    enckey = req.body.encKey;
    reqMsgDTO.setEnckey(enckey);
  } else {
    enckey = PaytmConfig.enckey;
    reqMsgDTO.setEnckey(enckey);
  }
  //Merchant unique order id 
  var orderId = "";
  if (req.body.hdnOrderID != null) {
    orderId = req.body.hdnOrderID;
    reqMsgDTO.setOrderId(orderId);
  }
  // Transaction amount in paisa format
  var amt = null;
  reqMsgDTO.setTrnAmt(req.body.trnAmt);
  // Merchant transaction currency 
  reqMsgDTO.setTrnCurrency(req.body.currency);
  // Transaction remarks 
  var trnRemarks = null;
  if (req.body.trnRemarks != null) {
    trnRemarks = req.body.trnRemarks;
    reqMsgDTO.setTrnRemarks(trnRemarks);
  }
  // Merchant request type S/P/R 
  var meTransReqType = null;
  if (req.body.meTransReqType != null) {
    meTransReqType = req.body.meTransReqType;
    reqMsgDTO.setMeTransReqType(meTransReqType);
  }
  // Recurring period (M/W))if merchant request type is R
  var recurPeriod = null;
  if (req.body.recPeriod != null) {
    recurPeriod = req.body.recPeriod;
    reqMsgDTO.setRecurrPeriod(recurPeriod);
  }
  //Recurring day if merchant request type is R: Recurring Payment 
  var recurDay = null;
  if (req.body.recDay != null) {
    recurDay = req.body.recDay;
    reqMsgDTO.setRecurrDay(recurDay);
  }
  //No of recurring if merchant request type is R 
  var numberRecurring = null;
  if (req.body.noOfRec != null) {
    numberRecurring = req.body.noOfRec;
    reqMsgDTO.setNoOfRecurring(numberRecurring);
  }
  //Merchant response URL 
  var ResponseUrl = null;

  if (req.body.resUrl != null) {
    ResponseUrl = req.body.resUrl;
    reqMsgDTO.setResponseUrl(ResponseUrl);
  } else {
    ResponseUrl = PaytmConfig.website;
    reqMsgDTO.setResponseUrl(ResponseUrl);
  }

  //Optional Addition fields for Merchant use 
  reqMsgDTO.setAddField1(req.body.addField1);
  reqMsgDTO.setAddField2(req.body.addField2);
  reqMsgDTO.setAddField3(req.body.addField3);
  reqMsgDTO.setAddField4(req.body.addField4);
  reqMsgDTO.setAddField5(req.body.addField5);
  reqMsgDTO.setAddField6(req.body.addField6);
  reqMsgDTO.setAddField7(req.body.addField7);
  reqMsgDTO.setAddField8(req.body.addField8);
  reqMsgDTO.setAddField9("");
  reqMsgDTO.setAddField10("");
  reqMsgDTO.setStatusDesc("")
  console.log('test');
  // console.log('test reqMsgDTO', reqMsgDTO);

  var merchantRequest = null;
  try {
    // Initialise object to generate transaction request message AWLMEAPI 
    // var transactMeAPI = new AWLMEAPI();
    reqMsgDTO = transactMeAPI.generateTrnReqMsg(reqMsgDTO);
    // Check status desciption for message generation 
    if (reqMsgDTO.getStatusDesc() == "Success") {
      merchantRequest = reqMsgDTO.getReqMsg();
      // console.log("merchantRequest", merchantRequest);
      // var txn_url = "https://cgt.in.worldline.com/ipg/doMEPayRequest"; // for staging
      var txn_url = process.env.STD_PAY;
      var form_fields = ''
      form_fields += "<input type='hidden' name='merchantRequest'  value='" + merchantRequest + "' >";
      form_fields += "<input type='hidden' name='MID' id = 'MID' value = '" + mid + "'/>";

      res.writeHead(200, { 'Content-Type': 'text/html' });
      var htmlResponse = `
                <html>
                <head>
                    <title>Merchant Checkout Page</title>
                </head>
                <body>
                    <center>
                        <h1>Please do not refresh this page...</h1>
                    </center>
                    <form method="post" action="${txn_url}" name="f1">
                        ${form_fields}
                    </form>
                    <script type="text/javascript">
                        document.f1.submit();
                    </script>
                </body>
                </html>
                  `;

      // Send the HTML response to the client
      res.write(htmlResponse);
      // res.write('<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' + txn_url + '" name="f1">' + form_fields + '</form><script type="text/javascript">document.f1.submit();</script></body></html>');
      res.end();
    }
    // merchantRequest = reqMsgDTO.getReqMsg();
    // res.send(merchantRequest + ' Submitted Successfully!');
  } catch (ex) {
    reqMsgDTO.setStatusDesc("Error Occurred during processing" + ex);
    console.log(ex)
    // throw new Exception(ex.getMessage());
  } // If request message generate
});



router.post('/meTrnSuccess', async function (req, res) {

  // Parse Merchant encryption to parse PG response message 
  var merchantResponse = null;

  resMsgDTO = null;
  if (req.body.merchantResponse != null) {
    // Merchant Encryption Key var 
    // console.log(req.body.merchantResponse);
    // var enc_key = "3699a6289277c23e8efa6ba12c3bb517";
    var enc_key = process.env.enyckey;
    // console.error('enc_key ' + enc_key)
    // Get PG transaction response 
    merchantResponse = req.body.merchantResponse;
    // Initialise object to parse response message
    //AWLMEAPI transactMeAPI = new AWLMEAPI();
    // Call method to parse PG transaction response 

    // console.log(merchantResponse);
    resMsgDTO = await transactMeAPI.parseTrnResMsg(merchantResponse, enc_key);
    console.log("resMsgDTO>>>>", resMsgDTO);
    if (resMsgDTO && resMsgDTO.getResponseCode() == '00') {
      console.log("orderId:", resMsgDTO.getOrderId());
      await PaymentModel.updateOne({ orderId: resMsgDTO.getOrderId() }, { $set: { gatewayResponse: resMsgDTO, transactionStatus: resMsgDTO.getStatusCode() } })
      const paymentInfo = await RegistrationRefInfoModel.findOne({ orderId: resMsgDTO.getOrderId() }).lean()
      console.log("PAYMENT INFO>>>>>>>>>>====>>>>>>", paymentInfo);
      if (paymentInfo) {
        paymentInfo.userData.paymentStatus = "success"
        await UserModel.findByIdAndUpdate(
          { _id: mongoose.Types.ObjectId(paymentInfo.userId) },
          { $set: paymentInfo.userData }
        );

      }
    }

    // console.log('resMsgDTO.getRrn()');
    var varAddField1 = resMsgDTO.getAddField1();
    var varAddField2 = resMsgDTO.getAddField2();
    var varAddField3 = resMsgDTO.getAddField3();
    var varAddField4 = resMsgDTO.getAddField4();
    var varAddField5 = resMsgDTO.getAddField5();
    var varAddField6 = resMsgDTO.getAddField6();
    var varAddField7 = resMsgDTO.getAddField7();
    var varAddField8 = resMsgDTO.getAddField8();
    var varAddField9 = resMsgDTO.getAddField9();
    var varAddField10 = resMsgDTO.getAddField10();
    var varAuthZCode = resMsgDTO.getAuthZCode();
    var varOrderId = resMsgDTO.getOrderId();
    var varResponseCode = resMsgDTO.getResponseCode();
    var varRrn = resMsgDTO.getRrn();
    var varStatusDesc = resMsgDTO.getStatusDesc();
    var varTrnAmt = resMsgDTO.getTrnAmt();
    var varTrnRefNo = resMsgDTO.getPgMeTrnRefNo();
    var varTrnReqDate = resMsgDTO.getTrnReqDate();
    const pgResponse =
    {
      // addField1: varAddField1,
      // addField2: varAddField2,
      // addField3: varAddField3,
      // addField4: varAddField4,
      // addField5: varAddField5,
      // addField6: varAddField6,
      addField7: varAddField7,
      addField8: varAddField8,
      addField9: varAddField9,
      addField10: varAddField10,
      authZCode: varAuthZCode,
      orderId: varOrderId,
      responseCode: varResponseCode,
      rrn: varRrn,
      statusDesc: varStatusDesc,
      trnAmt: varTrnAmt ,
      trnRefNo: varTrnRefNo,
      trnReqDate: varTrnReqDate
    }
    const paymentResponse = await PaymentModel.updateOne({ orderId: pgResponse.orderId }, { $set: pgResponse })
    console.log("PAYMENT RESPOPNSE INFO>>>>>>>>>>====>>>>>>", paymentResponse);
  } else {
    merchantResponse = "No response";
  }


  // res.sendFile('meTrnSuccess.html', { root: '.' })
  // res.render('meTrnSuccess', { resMsgDTO: resMsgDTO })
  const queryString = new URLSearchParams(resMsgDTO).toString();
  const url = `https://mpced.mpconsultancy.org/#/payment-status?${queryString}`;

  res.redirect(url);
  // res.redirect('')
  // res.render('meTrnSuccess', {
  //   AddField1: varAddField1,
  //   AddField2: varAddField2,
  //   AddField3: varAddField3,
  //   AddField4: varAddField4,
  //   AddField5: varAddField5,
  //   AddField6: varAddField6,
  //   AddField7: varAddField7,
  //   AddField8: varAddField8,
  //   AddField9: varAddField9,
  //   AddField10: varAddField10,
  //   AuthZCode: varAuthZCode,
  //   OrderId: varOrderId,
  //   ResponseCode: varResponseCode,
  //   Rrn: varRrn,
  //   StatusDesc: varStatusDesc,
  //   TrnAmt: varTrnAmt / 100.0,
  //   TrnRefNo: varTrnRefNo,
  //   TrnReqDate: varTrnReqDate

  // });
});



router.post('/meTrnStausSuccess', async function (req, res) {

  var mid = req.body.mid;
  var encKey = req.body.encKey;
  var hdnOrderID = req.body.hdnOrderID
  var trnRefNo = req.body.trnRefNo;
  // AWLMEAPI transactMeAPI = new AWLMEAPI();
  resMsgDTO = await transactMeAPI.getTransactionStatus(mid, hdnOrderID, trnRefNo, encKey);
  // console.log('resMsgDTO.getTrnAmt()')

  if (resMsgDTO != null) {
    console.log(resMsgDTO.getRrn());
    var varAddField1 = resMsgDTO.getAddField1();
    var varAddField2 = resMsgDTO.getAddField2();
    var varAddField3 = resMsgDTO.getAddField3();
    var varAddField4 = resMsgDTO.getAddField4();
    var varAddField5 = resMsgDTO.getAddField5();
    var varAddField6 = resMsgDTO.getAddField6();
    var varAddField7 = resMsgDTO.getAddField7();
    var varAddField8 = resMsgDTO.getAddField8();
    var varAddField9 = resMsgDTO.getAddField9();
    var varAddField10 = resMsgDTO.getAddField10();
    var varAuthZCode = resMsgDTO.getAuthZCode();
    var varOrderId = resMsgDTO.getOrderId();
    var varResponseCode = resMsgDTO.getResponseCode();
    var varRrn = resMsgDTO.getRrn();
    var varStatusDesc = resMsgDTO.getStatusDesc();
    var varTrnAmt = resMsgDTO.getTrnAmt();
    var varTrnRefNo = resMsgDTO.getPgMeTrnRefNo();
    var varTrnReqDate = resMsgDTO.getTrnReqDate();
  } else {
    var merchantResponse = "No response";
  }

  // res.sendFile('meTrnSuccess.html', { root: '.' })
  res.render('meTrnStausSuccess', {
    AddField1: varAddField1,
    AddField2: varAddField2,
    AddField3: varAddField3,
    AddField4: varAddField4,
    AddField5: varAddField5,
    AddField6: varAddField6,
    AddField7: varAddField7,
    AddField8: varAddField8,
    AddField9: varAddField9,
    AddField10: varAddField10,
    AuthZCode: varAuthZCode,
    OrderId: varOrderId,
    ResponseCode: varResponseCode,
    Rrn: varRrn,
    StatusDesc: varStatusDesc,
    TrnAmt: varTrnAmt / 100.0,
    TrnRefNo: varTrnRefNo,
    TrnReqDate: varTrnReqDate

  });
});


module.exports = router
