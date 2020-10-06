const jwt = require('jsonwebtoken')
const User = require('../models/user')
const config = require('../../config/auth')

module.exports.isAuthenticated = function (req, res, next) {
  const token = getToken(req.headers)

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Auth Error' })
  }

  try {
    const { _id: userId } = jwt.verify(token, config.secret)

    User
      .findById(userId)
      .then((user) => {
        delete user.password
        req.user = user

        return next()
      })
  } catch (e) {
    console.error(e)

    return res.status(500).send({ message: 'Invalid Token' })
  }
}

function getToken(headers) {
  if (headers && headers.authorization) {
    let parted = headers.authorization.split(' ')

    if (parted.length === 2) {
      return parted[1]
    } else {
      return null
    }
  } else {
    return null
  }
};
