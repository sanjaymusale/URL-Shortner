const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const { Schema } = mongoose

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 5
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (value) {
                return validator.isEmail(value)
            },
            message: function () {
                return 'invalid Email'
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 128
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tokens: [
        {
            token: {
                type: String
            }
        }
    ]


})

// pre/post hooks - mongoose Middleware
userSchema.pre('save', function (next) {
    if (this.isNew) {
        bcryptjs.genSalt(10).then((salt) => {
            bcryptjs.hash(this.password, salt).then((hashedPassword) => {
                this.password = hashedPassword
                next()
            })
        })
    }
    else {
        next()
    }

})

userSchema.statics.findByEmailandPassword = function (email, password) {
    const User = this
    return User.findOne({ email })
        .then((user) => {
            if (user) {
                return bcryptjs.compare(password, user.password)
                    .then((result) => {
                        if (result) {
                            return new Promise((resolve, reject) => {
                                resolve(user)
                            })
                        }
                        else {
                            return new Promise((resolve, reject) => {
                                const err = 'invalid Password'
                                reject(err)
                            })
                        }
                    })
            } else {
                return Promise.reject('invalid Email and Password')
            }

        })
        .catch((err) => {
            return Promise.reject(err)
        })
}
userSchema.statics.findByToken = function (token) {
    const User = this
    let tokenData
    try {
        tokenData = jwt.verify(token, 'dct@welt123')
    } catch (err) {
        return Promise.reject(err)
    }
    // console.log(tokenData)
    return User.findOne({
        '_id': tokenData.userid,
        'tokens.token': token
    })
        .then((user) => {
            if (user) {
                return Promise.resolve(user)
            }
            else {
                return Promise.reject({ loggedIn: false })
            }
        })
        .catch((err) => {
            return Promise.reject({ loggedIn: false })
        })

}
// userSchema.statics.logout = function (token) {
//     const User = this
//     return User.findOne({ 'tokens.token': token })
//         .then((user) => {
//             var tokenData = user.tokens.filter(x => x.token !== token)
//             user.tokens = tokenData
//             return user.save()
//                 .then((user) => {
//                     return user
//                 })
//                 .catch((err) => {
//                     return err
//                 })
//         })
//         .catch((err) => {
//             return err
//         })
// }

userSchema.methods.generateToken = function () {
    const user = this
    const tokenData = {
        userid: user._id
    }

    const token = jwt.sign(tokenData, 'dct@welt123')
    user.tokens.push({ token })
    return user.save()
        .then((user) => {
            return token
        })
        .catch((err) => {
            return err
        })


}


const User = mongoose.model('User', userSchema)

module.exports = {
    User
}