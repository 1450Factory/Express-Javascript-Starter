const passport = require('passport')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const config = require('../../config/auth')
const sendMail = require('../services/mailer')
const User = require('../models/user')

require('../../config/passport')(passport)

module.exports.register = function (request, response) {
  const user = new User({
    firstName: request.body.firstName,
    lastName: request.body.lastName,
    type: 'user',
    email: request.body.email,
    password: request.body.password,
    scope: request.body.scope
  })

  user.save(function (err) {
    if (err && err.code === 11000) {
      return response
        .status(400)
        .json({
          status: 'INVALID_INPUT',
          msg: 'Email or email already exists.'
        })
    } else if (err) {
      return response
        .status(500)
        .json({
          status: 'INTERNAL_SERVER_ERROR',
          error: err
        })
    }

    const from = 'noreply@izylabs.com'
    const to = request.body.email
    const subject = 'Welcome to Ecom Fusion'
    const message = `<p>Welcome to Ecom Fusion</p>
      <p>You can login to your personal account: <a href="${process.env.CLIENT_URL}/login">Here</a></p>
      `

    sendMail(from, to, subject, message)
    console.log('mail sent')
    response.json({
      status: 'OK',
      msg: 'Successful created new user.'
    })
  })
}

module.exports.login = function (request, response) {
  if (!request.body.email || !request.body.password) {
    response
      .status(400)
      .json({
        status: 'INVALID_INPUT',
        msg: 'Please pass email and password.'
      })
  } else {
    User.findOne({
      email: request.body.email,
      type: 'user'
    }, function (err, user) {
      if (err) throw err

      if (!user) {
        response
          .status(401)
          .send({
            status: 'UNAUTHORIZED',
            msg: 'Authentication failed. User not found.'
          })
      } else {
        user.comparePassword(request.body.password, function (err, isMatch) {
          if (isMatch && !err) {
            const expiresIn = 604800 // 1 week
            const token = jwt.sign(user.toJSON(), config.secret, { expiresIn: expiresIn })

            response.json({
              status: 'OK',
              access_token: {
                token: token,
                expires_in: expiresIn
              }
            })
          } else {
            response
              .status(401)
              .send({
                status: 'UNAUTHORIZED',
                msg: 'Authentication failed. Wrong password.'
              })
          }
        })
      }
    })
  }
}

module.exports.refreshToken = function (req, res) {
  // TODO: Implement refresh token
}

module.exports.forgetPassword = function (req, res) {
  User.findOne({ email: req.body.email })
    .then(async (user) => {
      const token = crypto
        .createHash('md5')
        .update(Math.random().toString().substring(2))
        .digest('hex')

      user.resetPasswordToken = token
      user.resetPasswordExpires = Date.now() + 7200000 // 2 hour

      await user.save()

      const to = user.email
      const from = 'noreply@izylabs.com'
      const subject = 'Ecom Fusion -- Password Reset'
      const message = `<p>
        You are receiving this because you (or someone else) have requested the reset of the password for your account. <br>
        Please click on the following link, or paste this into your browser to complete the process:<br><br>
        <a href="${process.env.CLIENT_URL}/password/reset?token=${token}">Reset Password Here</a><br><br>
        If you did not request this, please ignore this email and your password will remain unchanged.
        </p>`

      sendMail(from, to, subject, message)
      return res.status(200).json({
        status: 'OK',
        msg: 'An email sent successfully to you mailbox.'
      })
    })
    .catch((err) => {
      return res.status(500).json({
        status: 'ERROR',
        data: err
      })
    })
}

module.exports.resetPassword = function (request, response) {
  User.findOne({
    email: request.body.email,
    resetPasswordToken: request.body.token,
    resetPasswordExpires: { $gt: Date.now() }
  }, function (err, user) {
    if (err) {
      return response
        .status(500)
        .json({
          status: 'ERROR',
          data: err
        })
    }

    if (!user) {
      return response
        .status(500)
        .json({
          status: 'ERROR',
          msg: 'Password reset token is invalid or has expired.'
        })
    }

    user.password = request.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined

    user.save((error, doc) => {
      if (error) {
        return response
          .status(500)
          .json({
            status: 'ERROR',
            data: error
          })
      }

      const to = user.email
      const from = 'noreply@izylabs.com'
      const subject = 'Ecom Fusion -- Your password has been changed'
      const message = `<p>
        Hello,<br><br>
        This is a confirmation that the password for your account ${user.email} has just been changed.
        </p>`

      sendMail(from, to, subject, message)
    })
  })

  return response.json({
    status: 'OK',
    msg: 'Your password updated successfully.'
  })
}

module.exports.logout = function (request, response) {
  request.logout()

  response.json({
    status: 'OK',
    msg: 'Sign out successfully.'
  })
}
