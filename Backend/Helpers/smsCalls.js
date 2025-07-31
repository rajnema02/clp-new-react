
const userModel = require("../Models/Auth.model");
const messageModel = require("../Models/Message.model");
const createError = require("http-errors");
const mongoose = require("mongoose");
const userModelName = "User";
const url = require('url');
const axios = require('axios')
const smsLink= 'http://mysms.msg24.in/api/mt/SendSMS?user=Cyberlaw&password=123456&senderid=CLPPVT&channel=trans&DCS=0&flashsms=0&number='
module.exports = {
  // 9343649161
  querySubmitted: async (mobile) => {
    const address = `${smsLink}` + `${mobile}` + '&text=Dear Participant, your query has been submitted successfully. Well notify you once your query has been resolved.&route=8&Peid=1401523580000059358&DLTTemplateId=1407172319559836505'
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', address);
    return axios.get(address)
  },
  queryReceived: async (name) => {
    const address = `${smsLink}` + '9343649161&text=Dear admin, you have received a new query from '+ `${name}` + '&route=8&Peid=1401523580000059358&DLTTemplateId=1407172319576158033'
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', address);
    return axios.get(address)
  },
  queryResolved: async (mobile) => {
    const address = `${smsLink}` + `${mobile}` + '&text=Dear Participant, your query has been resolved. Kindly check your online CLP account. Thanks!&route=8&Peid=1401523580000059358&DLTTemplateId=1407172319585181768'
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', address);
    return axios.get(address)
  },
  AssessmentSubmit: async (mobile) => {
    const address = `${smsLink}` + `${mobile}` + '&text=Dear Participant, you have successfully submitted your CSM - Internal Risk Assessment.&route=8&Peid=1401523580000059358&DLTTemplateId=1407172319597004576'
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', address);
    return axios.get(address)
  },
  AssessmentSchedule: async (mobile,fromDate, toDate) => {
    const address = `${smsLink}` + `${mobile}` + '&text=Dear Participant, Your CSM Internal Risk Assessment has been successfully scheduled. You can participate in this internal risk assessment anytime between ' + `${fromDate}` + 'to'  + `${toDate}` + '.&route=8&Peid=1401523580000059358&DLTTemplateId=1407172319611489552'
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', address);
    return axios.get(address)
  },
  AssessmentReSchedule: async (mobile,fromDate, toDate) => {
    const address = `${smsLink}` + `${mobile}` + '&text=Dear Participant, Your CSM Internal Risk Assessment has been Re- successfully scheduled. You can participate in this internal risk assessment anytime between ' + `${fromDate}` + 'to'  + `${toDate}` + '.&route=8&Peid=1401523580000059358&DLTTemplateId=1407172319622827022'
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', address);
    return axios.get(address)
  },
  AssessmentUploaded: async (mobile) => {
    const address = `${smsLink}` + `${mobile}` + '&text=Dear Participant, the result of CSM Internal Risk Assessment given by you has been uploaded. You can check it by login into your online account.&route=8&Peid=1401523580000059358&DLTTemplateId=1407172319635268872'
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', address);
    return axios.get(address)
  },
  
  smsReg: async (data) => {
    // return true
    const user = await userModel.findOne({
      mobile: data,
      is_inactive: false,
    });
    const link = 'https://cyberlawpioneers.org/#/studentlogin'
    const path = encodeURIComponent(link);
    const contact = '9343649161'

    const address = 'http://mysms.msg24.in/api/mt/SendSMS?user=cyberlaw&password=123456&senderid=CLPPVT&channel=trans&DCS=0&flashsms=0&number=' + `${data}` + '&text=Dear Applicant, Greetings from CLP! To complete your application, Please go to ' + `${path}` + ' .For any inquiries feel free to call on this number ' + `${contact}` + '.We look forward to receiving your application.&route=0&Peid=1401523580000059358&DLTTemplateId=1407171577365734365'
    const message = {
      student_id: user._id,
      message_description: 'Dear Applicant, Greetings from CLP! To complete your application, Please go to ' + `${path}` + ' .For any inquiries feel free to call on this number ' + `${contact}` + ' .We look forward to receiving your application.'
    }
    // const address = 'http://mysms.msg24.in/api/mt/SendSMS?user=Cyberlaw&password=123456&senderid=CLPPVT&channel=trans&DCS=0&flashsms=0&number=' + `${data}` + '&text=Dear Applicant, Greetings from MPCON Cyber Excellence Division! To complete your application, Please go to https://mpced.Cyberlawpioneers.org/%23/studentlogin.&route=33&Peid=1401523580000059358&DLTTemplateId=1407168534711179172'
    // const message = {
    //   student_id: user._id,
    //   message_description: 'Dear Applicant, Greetings from MPCON Cyber Excellence Division! To complete your application, Please go to https://mpced.Cyberlawpioneers.org/#/studentlogin.'
    // }
    message.is_inactive = false;
    // message.created_by = req.user._id;
    message.created_on = Date.now();
    try {
      const newMessage = new messageModel(message);
      const result = await newMessage.save();

    } catch (error) {

    }

    console.log(address);
    return axios.get(address)
  },


  // http://182.18.162.128/api/mt/SendSMS?user=Cyberlaw&password=123456&senderid=CLPPVT&channel=Trans&DCS=0&flashsms=0&number=918851037463&text=DO%20NOT%20SHARE:%2012345%20is%20the%20verification%20code%20for%20login%20request.%20Do%20not%20share.&route=08&Peid=1401523580000059358&DLTTemplateId=1407171577395637262

  smsOTP: async (mobile, otp) => {

    const address = `${smsLink}` + `${mobile}` + '&text=DO NOT SHARE: ' + `${otp}` + ' is the verification code for login request. Do not share.&route=8&Peid=1401523580000059358&DLTTemplateId=1407171577395637262'
    console.log('>>>>>>>>>>>>>>>>otp>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', address);
    return axios.get(address)
  },

  smsFormFilled: async (data) => {
    const user = await userModel.findOne({
      mobile: data,
      is_inactive: false,
    });
    var path = user.course_code
    var delimiter = "-";

    path = path.split(delimiter)[1];
    const course = encodeURIComponent(path);
    const address = 'http://mysms.msg24.in/api/mt/SendSMS?user=Cyberlaw&password=123456&senderid=CLPPVT&channel=trans&DCS=0&flashsms=0&number=' + `${data}` + '&text=Thank you for successfully submitting application form for ' + `${course}` + ' training program. We will notify you once your profile approved.&route=8&Peid=1401523580000059358&DLTTemplateId=1407171577404254752'
    const message = {
      student_id: user._id,
      message_description: 'Thank you for successfully submitting application form for' + `${course}` + 'training program. We will notify you once your profile approved.'
    }
    // const address = 'http://mysms.msg24.in/api/mt/SendSMS?user=Cyberlaw&password=123456&senderid=CLPPVT&channel=trans&DCS=0&flashsms=0&number=' + `${data}` + '&text=Thank you for successfully submitting application form for CSCE training program. We will notify you once your profile approved.&route=33&Peid=1401523580000059358&DLTTemplateId=1407168545434746010'
    // const message = {
    //   student_id: user._id,
    //   message_description: 'Thank you for successfully submitting application form for CSCE training program. We will notify you once your profile approved.'
    // }

    message.is_inactive = false;
    // message.created_by = req.user._id;
    message.created_on = Date.now();
    try {
      const newMessage = new messageModel(message);
      const result = await newMessage.save();

    } catch (error) {

    }
    console.log(address);
    return axios.get(address)
  },

  smsReject: async (data) => {
    const user = await userModel.findOne({
      mobile: data,
      is_inactive: false,
    });
    var path = user.course_code
    var delimiter = "-";

    path = path.split(delimiter)[1];
    const course = encodeURIComponent(path);
    const address = 'http://mysms.msg24.in/api/mt/SendSMS?user=Cyberlaw&password=123456&senderid=CLPPVT&channel=trans&DCS=0&flashsms=0&number=' + `${data}` + '&text=Greetings candidate, Due to incomplete details your profile for ' + `${course}` + ' has been rejected. Please fill necessary details again.&route=8&Peid=1401523580000059358&DLTTemplateId=1407171577399660937'
    const message = {
      student_id: user._id,
      message_description: 'Greetings candidate, Due to incomplete details your profile for ' + `${course}` + ' has been rejected. Please fill necessary details again.'
    }
    message.is_inactive = false;
    // message.created_by = req.user._id;
    message.created_on = Date.now();
    try {
      const newMessage = new messageModel(message);
      const result = await newMessage.save();

    } catch (error) {

    }
    console.log(address);
    return axios.get(address)
  },
  smsProfileVerfied: async (data) => {
    const user = await userModel.findOne({
      mobile: data,
      is_inactive: false,
    });

    const course = user.course_type
    const path = encodeURIComponent(course);
    const text = 'Your application for ' + `${path}` + ' has been successfully approved. Instructions on accessing your classes will be shared shortly.'
    const address = 'http://mysms.msg24.in/api/mt/SendSMS?user=Cyberlaw&password=123456&senderid=CLPPVT&channel=trans&DCS=0&flashsms=0&number=' + `${data}` + '&text=' + `${text}` + '&route=8&Peid=1401523580000059358&DLTTemplateId=1407171577412337454'
    const message = {
      student_id: user._id,
      message_description: 'Your application for' + `${course}` + 'has been successfully approved. Instructions on accessing your classes will be shared shortly.'
    }
    message.is_inactive = false;
    // message.created_by = req.user._id;
    message.created_on = Date.now();
    try {
      const newMessage = new messageModel(message);
      const result = await newMessage.save();
      console.log("<<<<<<<MESSAGE SAVED SUCCESFULLY>>>>>>>");
    } catch (error) {

    }
    // console.log(address);
    return axios.get(address)
  },

  smsTeamsInstruction: async (data) => {
    const user = await userModel.findOne({
      mobile: data,
      is_inactive: false,
    });
    const address = 'http://mysms.msg24.in/api/mt/SendSMS?user=Cyberlaw&password=123456&senderid=CLPPVT&channel=trans&DCS=0&flashsms=0&number=' + `${data}` + '&text=	Classes are conducted online using Microsoft Teams App. To get more Information on how you can participate in online lectures check online user account and SMS.&route=8&Peid=1401523580000059358&DLTTemplateId=1407168534743403431'
    const message = {
      student_id: user._id,
      message_description: 'Classes are conducted online using Microsoft Teams App. To get more Information on how you can participate in online lectures check online user account and SMS.'
    }
    message.is_inactive = false;
    // message.created_by = req.user._id;
    message.created_on = Date.now();
    try {
      const newMessage = new messageModel(message);
      const result = await newMessage.save();

    } catch (error) {

    }
    console.log(address);
    return axios.get(address)
  },
  smsOnlineClassInstruction: async (data) => {

    // const user = await userModel.findOne({
    //   mobile: data,
    //   is_inactive: false,
    // });
    // const address = 'http://mysms.msg24.in/api/mt/SendSMS?user=Cyberlaw&password=123456&senderid=CLPPVT&channel=trans&DCS=0&flashsms=0&number=' + `${data}` + '&text=Greetings from MPCON Cyber Excellence Division! Your classes will begin in the coming week and you will be provided with a schedule in advance. Thank You.&route=33&Peid=1401523580000059358&DLTTemplateId=1407168069718298709'
    // const message = {
    //   student_id: user._id,
    //   message_description: 'Greetings from MPCON Cyber Excellence Division! Your classes will begin in the coming week and you will be provided with a schedule in advance. Thank You.'
    // }
    // message.is_inactive = false;
    // // message.created_by = req.user._id;
    // message.created_on = Date.now();
    // try {
    //   const newMessage = new messageModel(message);
    //   const result = await newMessage.save();

    // } catch (error) {

    // }
    // console.log(address);
    // return axios.get(address)
  },
  smsOnlineClass: async (data, from, to) => {

    const user = await userModel.findOne({
      mobile: data,
      is_inactive: false,
    });
    const address = 'http://mysms.msg24.in/api/mt/SendSMS?user=Cyberlaw&password=123456&senderid=CLPPVT&channel=trans&DCS=0&flashsms=0&number=' + `${data}` + '&text=Your lecture will be schedule from  ' + `${from}` + ' to  ' + `${to}` + ' . You can check your WhatsApp and user account for other details.&route=8&Peid=1401523580000059358&DLTTemplateId=1407171577422588044'
    const message = {
      student_id: user._id,
      message_description: 'Your lecture will be schedule from  ' + `${from}` + ' to  ' + `${to}` + ' . You can check your WhatsApp and user account for other details.'
    }
    message.is_inactive = false;
    // message.created_by = req.user._id;
    message.created_on = Date.now();
    try {
      const newMessage = new messageModel(message);
      const result = await newMessage.save();

    } catch (error) {

    }
    console.log(address);
    return axios.get(address)
  },
  smsExamInstruction: async (mobile) => {
    const user = await userModel.findOne({
      mobile: mobile,
      is_inactive: false,
    });
    const address = 'http://mysms.msg24.in/api/mt/SendSMS?user=Cyberlaw&password=123456&senderid=CLPPVT&channel=trans&DCS=0&flashsms=0&number=' + `${mobile}` + '&text=For instructions regarding examination please check your WhatsApp and user account. For any inquiries feel free to call on this number 9343649161, 8770303862.&route=8&Peid=1401523580000059358&DLTTemplateId=1407168534102922975'
    const message = {
      student_id: user._id,
      message_description: 'For instructions regarding examination please check your WhatsApp and user account. For any inquiries feel free to call on this number 9343649161, 8770303862.'
    }
    message.is_inactive = false;
    // message.created_by = req.user._id;
    message.created_on = Date.now();
    try {
      const newMessage = new messageModel(message);
      const result = await newMessage.save();

    } catch (error) {

    }
    console.log(address);
    return axios.get(address)
  },
  smsExam: async (mobile, date, time) => {
    return true
    const user = await userModel.findOne({
      mobile: mobile,
      is_inactive: false,
    });
    // console.log("SMS_OTP", mobile, otp)
    const address = 'http://mysms.msg24.in/api/mt/SendSMS?user=Cyberlaw&password=123456&senderid=CLPPVT&channel=trans&DCS=0&flashsms=0&number=' + `${mobile}` + '&text=Greetings candidates, your 1st attempt for training program is scheduled on ' + `${date}` + ' at ' + `${time}` + '. Best wishes for Your Exam.&route=8&Peid=1401523580000059358&DLTTemplateId=1407170677218347666'
    const message = {
      student_id: user._id,
      message_description: 'Greetings candidates, your 1st attempt for training program is scheduled on ' + `${date}` + ' at ' + `${time}` + '. Best wishes for Your Exam.'
    }
    message.is_inactive = false;
    // message.created_by = req.user._id;
    message.created_on = Date.now();
    try {
      const newMessage = new messageModel(message);
      const result = await newMessage.save();

    } catch (error) {

    }
    console.log(address);
    return axios.get(address)
  },

  sms1stAttempt: async (mobile, date, time) => {
    const user = await userModel.findOne({
      mobile: data,
      is_inactive: false,
    });
    var path = user.course_code
    var delimiter = "-";

    path = path.split(delimiter)[1];
    const course = encodeURIComponent(path);
    // console.log("SMS_OTP", mobile, otp)
    const address = 'http://mysms.msg24.in/api/mt/SendSMS?user=Cyberlaw&password=123456&senderid=CLPPVT&channel=trans&DCS=0&flashsms=0&number=' + `${mobile}` + '&text=Greetings candidates, your 1st attempt for ' + `${course}` + ' is scheduled on ' + `${date}` + '. Best wishes for Your Exam.&route=8&Peid=1401523580000059358&DLTTemplateId=1407171577438054388'
    const message = {
      student_id: user._id,
      message_description: 'Greetings candidates, your 1st attempt for ' + `${course}` + ' is scheduled on ' + `${date}` + '. Best wishes for Your Exam.'
    }
    message.is_inactive = false;
    // message.created_by = req.user._id;
    message.created_on = Date.now();
    try {
      const newMessage = new messageModel(message);
      const result = await newMessage.save();

    } catch (error) {

    }
    console.log(address);
    return axios.get(address)
  },
  sms2ndAttempt: async (mobile, date, time) => {
    
    // console.log("SMS_OTP", mobile, otp)
    const user = await userModel.findOne({
      mobile: mobile,
      is_inactive: false,
    });
    const address = 'http://mysms.msg24.in/api/mt/SendSMS?user=Cyberlaw&password=123456&senderid=CLPPVT&channel=trans&DCS=0&flashsms=0&number=' + `${mobile}` + '&text=Greetings candidates, your 2nd attempt for ' + `${course}` + ' is scheduled on ' + `${date}` + '. Best wishes for Your Exam.&route=8&Peid=1401523580000059358&DLTTemplateId=1407171577438054388'
    const message = {
      student_id: user._id,
      message_description: 'Greetings candidates, your 2nd attempt for ' + `${course}` + ' is scheduled on ' + `${date}` + '. Best wishes for Your Exam.'
    }
    message.is_inactive = false;
    // message.created_by = req.user._id;
    message.created_on = Date.now();
    try {
      const newMessage = new messageModel(message);
      const result = await newMessage.save();

    } catch (error) {

    }
    console.log(address);
    return axios.get(address)
  },
  sms3rdAttempt: async (mobile, date, time) => {
    const user = await userModel.findOne({
      mobile: data,
      is_inactive: false,
    });
    var path = user.course_code
    var delimiter = "-";

    path = path.split(delimiter)[1];
    const course = encodeURIComponent(path);
    // console.log("SMS_OTP", mobile, otp)
    const address = 'http://mysms.msg24.in/api/mt/SendSMS?user=Cyberlaw&password=123456&senderid=CLPPVT&channel=trans&DCS=0&flashsms=0&number=' + `${mobile}` + '&text=Greetings candidates, your 3rd attempt for ' + `${course}` + ' is scheduled on ' + `${date}` + '. Best wishes for Your Exam.&route=8&Peid=1401523580000059358&DLTTemplateId=1407171577449576007'
    const message = {
      student_id: user._id,
      message_description: 'Greetings candidates, your 3rd attempt for ' + `${course}` + ' is scheduled on ' + `${date}` + '. Best wishes for Your Exam.'
    }
    message.is_inactive = false;
    // message.created_by = req.user._id;
    message.created_on = Date.now();
    try {
      const newMessage = new messageModel(message);
      const result = await newMessage.save();

    } catch (error) {

    }
    console.log(address);
    return axios.get(address)
  },

  smsExamSubmit: async (mobile) => {
    // return true
    const user = await userModel.findOne({
      mobile: mobile,
      is_inactive: false,
    });
    const address = "http://mysms.msg24.in/api/mt/SendSMS?user=Cyberlaw&password=123456&senderid=CLPPVT&channel=trans&DCS=0&flashsms=0&number=" + `${mobile}` + "&text=Congratulations! Your exam submission is complete. We'll inform you once your results are generated.&route=8&Peid=1401523580000059358&DLTTemplateId=1407168533982493586"
    const message = {
      student_id: user._id,
      message_description: "Congratulations! Your exam submission is complete. We'll inform you once your results are generated."
    }
    message.is_inactive = false;
    // message.created_by = req.user._id;
    message.created_on = Date.now();
    try {
      const newMessage = new messageModel(message);
      const result = await newMessage.save();

    } catch (error) {

    }
    console.log(address);
    return axios.get(address)
  },
  smsFailStudent: async (id) => {
    // return true
    const user = await userModel.findOne({
      _id: mongoose.Types.ObjectId(id),
      is_inactive: false,
    });
    const mobile = user.mobile
    const address = "http://mysms.msg24.in/api/mt/SendSMS?user=Cyberlaw&password=123456&senderid=CLPPVT&channel=trans&DCS=0&flashsms=0&number=" + `${mobile}` + "&text=You didn't qualify the examination. We'll notify you regarding your next attempt, if any.&route=8&Peid=1401523580000059358&DLTTemplateId=1407168534070934952"
    const message = {
      student_id: id,
      message_description: "You didn't qualify the examination. We'll notify you regarding your next attempt, if any."
    }
    message.is_inactive = false;
    // message.created_by = req.user._id;
    message.created_on = Date.now();
    try {
      const newMessage = new messageModel(message);
      const result = await newMessage.save();

    } catch (error) {

    }
    console.log(address);
    return axios.get(address)
  },
  smsPassStudent: async (id) => {
    // return true
    const user = await userModel.findOne({
      _id: mongoose.Types.ObjectId(id),
      is_inactive: false,
    });
    const mobile = user.mobile
    const address = "http://mysms.msg24.in/api/mt/SendSMS?user=Cyberlaw&password=123456&senderid=CLPPVT&channel=trans&DCS=0&flashsms=0&number=" + `${mobile}` + "&text=	Congrats! You have qualified the examination! We'll notify you once your certificate is ready.&route=8&Peid=1401523580000059358&DLTTemplateId=1407168534068282384"
    const message = {
      student_id: id,
      message_description: "Congrats! You have qualified the examination! We'll notify you once your certificate is ready."
    }
    message.is_inactive = false;
    // message.created_by = req.user._id;
    message.created_on = Date.now();
    try {
      const newMessage = new messageModel(message);
      const result = await newMessage.save();

    } catch (error) {

    }
    console.log(address);
    return axios.get(address)
  },
  smsCertificateCreate: async (mobile) => {
    // return true
    const user = await userModel.findOne({
      mobile: mobile,
      is_inactive: false,
    });
    const address = 'http://mysms.msg24.in/api/mt/SendSMS?user=Cyberlaw&password=123456&senderid=CLPPVT&channel=trans&DCS=0&flashsms=0&number=' + `${mobile}` + '&text=Congrats! Your certificates are ready! You can download them from your user account.&route=8&Peid=1401523580000059358&DLTTemplateId=1407168534073621775'
    const message = {
      student_id: user._id,
      message_description: 'Congrats! Your certificates are ready! You can download them from your user account.'
    }
    message.is_inactive = false;
    // message.created_by = req.user._id;
    message.created_on = Date.now();
    try {
      const newMessage = new messageModel(message);
      const result = await newMessage.save();

    } catch (error) {

    }
    console.log(address);
    return axios.get(address)
  },
}