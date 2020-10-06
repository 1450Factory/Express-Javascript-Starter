const express = require('express')
const usersController = require('../controllers/usersController')

const router = express.Router()

router.get('/', usersController.getAll)
router.get('/:id', usersController.get)
router.get('/find/:key/:value', usersController.find)
router.post('/', usersController.create)
router.put('/:id', usersController.update)
router.delete('/:id', usersController.delete)

module.exports = router
