const mongoose = require('mongoose')

mongoose.Promise = global.Promise

mongoose.connect('mongodb://localhost:27017/url_shortner', { useNewUrlParser: true })
    .then(() => {
        console.log('connected to db')
    })
    .catch(() => {
        console.log('Error connecting to db')
    })

module.exports = {
    mongoose
}