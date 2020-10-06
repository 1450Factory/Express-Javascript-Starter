const User = require("../models/user");

let usersController = {};

usersController.getAll = function (req, res) {
  const options = req.query

  const page = parseInt(options.page) || 1
  const limit = parseInt(options.limit) || 10
  const sort = { createdAt: (options.createdAt === 'asc') ? 'asc' : -1 }
  const payload = { type: 'user' }
  if (options.status) {
    payload['status'] = options.status
  }

  User.paginate(payload, { limit, page, sort })
    .then((users) => {
      return res
        .status(200)
        .json({
          status: 'OK',
          totalPages: users.totalPages,
          limit: users.limit,
          page: users.page,
          data: users.docs
        })
    })
    .catch((error) => {
      return res
        .status(500)
        .json({
          status: 'ERROR',
          error: error
        })
    })
}

usersController.get = function (req, res) {
  User
    .findById(req.params.id)
    .then((doc) => {
      return res
        .status(200)
        .json({
          status: 'OK',
          data: doc
        })
    })
    .catch((err) => {
      return res
        .status(500)
        .json({
          status: 'ERROR',
          data: err
        })
    })
}

usersController.find = function (req, res) {
  const key = req.params.key
  const value = req.params.value
  const payload = {}

  payload[key] = value

  User
    .findOne(payload)
    .then((doc) => {
      return res
        .status(200)
        .json({
          status: 'OK',
          data: doc
        })
    })
    .catch((err) => {
      return res
        .status(500)
        .json({
          status: 'ERROR',
          data: err
        })
    })
}

usersController.create = function (req, res) {
  const user = new User(req.body)

  user
    .save()
    .then(async (createdUser) => {
      createdUser.stripeCustomerId = await initStripeCustomer(createdUser)
      createdUser.save().catch((err) => console.error(err))

      return res
        .status(201)
        .json({
          status: 'OK',
        })
    })
    .catch((err) => {
      return res.status(500).json({
        status: 'ERROR',
        data: err
      })
    })
}

usersController.update = function (req, res) {
  const { id } = req.params

  User
    .findByIdAndUpdate(
      { _id: id },
      { $set: req.body },
      { runValidators: true, new: true }
    )
    .then((doc) => {
      res
        .status(200)
        .json({
          status: 'OK',
          data: doc
        })
    })
    .catch((err) => {
      res
        .status(500)
        .json({
          status: 'ERROR',
          data: err
        })
    })
}

usersController.delete = function (req, res) {
  const { id } = req.params

  User
    .findByIdAndRemove(id)
    .then((doc) => {
      res
        .status(204)
        .json({})
    })
    .catch((err) => {
      res
        .status(500)
        .json({
          status: 'ERROR',
          data: err
        })
    })
}

module.exports = usersController;