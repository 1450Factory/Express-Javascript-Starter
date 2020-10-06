require('dotenv').config()

const express = require('express')
const { isAuthenticated } = require('../middlewares/authenticate') // middleware for doing authentication

const router = express.Router()

router.use('/', require('./auth'))
router.use('/users', isAuthenticated, require('./users'))

module.exports = router
