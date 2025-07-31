const axios = require("axios");
const BaseUrl = "http://sms.hspsms.com/sendSMS?"
const username = "deshkidiwaliindia"
const password = process.env.password
const sender = 'DLFELL'

module.exports = async (mobile, message) => {
  let ResponseData = await axios.post(
    `${BaseUrl}username=${username}&message=${message}&sendername=${sender}&smstype=TRANS&numbers=${mobile}&apikey=3f656127-c85d-43be-8a3f-e677c37455cb`
  )
  console.log(ResponseData.data)
  return ResponseData.data
}
