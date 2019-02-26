const mongoose = require('mongoose')
const validator = require('validator')
const useragent = require('useragent');
const sh = require('shorthash')
const Schema = mongoose.Schema

const bookmarkSchema = new Schema({

    title: {
        type: String,
        required: true,
        minlength: 5
    },
    original_url: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                return validator.isURL(value)
            },
            message: function () {
                return 'invalid URL'
            }

        }
    },
    hashed_url: {
        type: String,
        required: true
    },
    tags: {
        type: Array,
        required: true,
        validate: {
            validator: function (array) {
                if (array.length == 0)
                    return false
            },
            message: function () {
                return "Tags not provided"
            }
        }
    },


    createdAt: {
        type: Date,
        default: Date.now
    },
    click: [{
        clicked: {
            type: Date,
            required: true
        },
        ip: {
            type: String,
            required: true
        },
        browser: {
            type: String,
            required: true
        },
        os: {
            type: String,
            required: true
        },
        device: {
            type: String,
            required: true
        }
    }],
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }

})

bookmarkSchema.pre('validate', function (next) {

    this.hashed_url = sh.unique(this.original_url)
    next()


})

bookmarkSchema.statics.redirectUrl = function (hash, req) {
    const Bookmark = this
    var agent = useragent.parse(req.headers['user-agent']);
    const clicked = {
        "clicked": new Date(),
        "ip": req.connection.remoteAddress,
        "browser": agent.toAgent(),
        "os": agent.os.toString(),
        "device": agent.device.toString()
    }
    return Bookmark.findOneAndUpdate({ hashed_url: hash }, { $push: { click: clicked } })
        .then((bookmark) => {
            return Promise.resolve(bookmark)
        })
        .catch((err) => {
            return Promise.reject(err)
        })

}


const Bookmark = mongoose.model('Bookmark', bookmarkSchema)

module.exports = {
    Bookmark
}

