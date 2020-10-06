const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')
const Schema = mongoose.Schema
const mongoosePaginate = require('mongoose-paginate-v2')

const userSchema = new Schema({
  _someId: Schema.Types.ObjectId,
  firstName: String,
  lastName: String,
  email: {
    type: String,
    lowercase: true,
    index: true,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  phoneNumber: String,
  avatar: {
    type: Object,
    default: {
      filename: 'avatar.png',
      path: 'http://www.gravatar.com/avatar/?d=mp'
    }
  },
  status: {
    type: String,
    default: "pending"
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
},
  {
    timestamps: true
  })

userSchema.pre('save', function (next) {
  const user = this

  if (this.isModified('password') || this.isNew) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        return next(err)
      }

      bcrypt.hash(user.password, salt, null, function (err, hash) {
        if (err) {
          return next(err)
        }

        user.password = hash
        return next()
      })
    })
  } else {
    return next()
  }
})

userSchema.pre('findOneAndUpdate', async function (next) {
  let _self = this._update
  const { password } = _self
  try {

    if (password) {
      bcrypt.genSalt(10, function (err, salt) {
        if (err) {
          return next(err)
        }
        bcrypt.hash(password, salt, null, function (err, hash) {
          if (err) {
            return next(err)
          }
          _self.password = hash
          return next()
        })

      })
    } else {
      return next()
    }
  } catch (error) {
    console.log('error', error)
    return next(error)
  }
})

userSchema.methods.comparePassword = function (passw, cb) {
  bcrypt.compare(passw, this.password, function (err, isMatch) {
    if (err) {
      return cb(err)
    }

    cb(null, isMatch)
  })
}

userSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('users', userSchema)
