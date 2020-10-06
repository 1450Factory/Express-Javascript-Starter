const nodemailer = require('nodemailer')
const mailerOptions = require('../../config/mail')
const transport = nodemailer.createTransport(mailerOptions)

module.exports = function (from, to, subject, message, attachments, options) {
  const mailOptions = {
    from: from,
    to: to,
    subject: subject,
    html: message,
    attachments: attachments
  }

  transport.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log('services.mailer => err')

      return false
    } else {
      console.log('services.mailer => info', info)

      return true
    }
  })
}
