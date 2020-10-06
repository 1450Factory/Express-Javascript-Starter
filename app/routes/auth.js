const express = require('express')
const authController = require('../controllers/authController.js')

const router = express.Router()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/token/refresh', authController.refreshToken)
router.post('/logout', authController.logout)
router.post('/password/forget', authController.forgetPassword)
router.post('/password/reset', authController.resetPassword)

module.exports = router
