const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const User = require('../app/models/user') // load up the user model
const config = require('./auth') // get db config file

module.exports = function (passport) {
  const optionsJwtStrategy = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
    secretOrKey: config.secret
  }

  // FIXME: DON'T RETURN THE FULL USER OBJECT, IT CONTAINS SENSETIVE DATA
  passport.use(new JwtStrategy(optionsJwtStrategy, function (payload, done) {
    User.findOne({ id: payload.id }, function (err, user) {
      if (err) {
        return done(err, false)
      }

      if (user) {
        done(null, user)
      } else {
        done(null, false)
      }
    })
  }))
}
