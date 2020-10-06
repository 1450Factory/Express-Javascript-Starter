require('dotenv').config()

const database = require('../config/database')
const express = require('express')
const passport = require('passport')
const mongoose = require('mongoose')
const path = require('path')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
const compression = require('compression')
const routes = require('../app/routes')

const optionsMongoose = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
}
const optionsBodyParser = {
  limit: '10mb'
}
const app = express()

app.use(passport.initialize())
app.use(passport.session())
app.use(morgan('dev'))
app.use(cors())
app.use(compression())
app.use(express.static(path.join(__dirname, 'public')))

/**
* Routing
*/
app.get('/', function (req, res) {
  res.json({
    status: 'OK',
    version: `v${process.env.API_VERSION}`
  })
})

app.use(`/api/v${process.env.API_VERSION}`, routes)

/*
 * Handle 404 error
 */
app.use('*', (req, res) => {
  return res
    .status(404)
    .json({
      status: 'NOT_FOUND'
    })
})

/*
 * Handle rest of errors
 */
app.use(function (err, req, res, next) {
  console.log('err', err)
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  return res
    .status(err.status || 500)
    .json({
      status: 'INTERNAL_SERVER_ERROR'
    })
})

mongoose
  .connect(database.connect, optionsMongoose)
  .then(() => console.log('connected to db'))
  .catch(err => console.error(err))

module.exports = app
