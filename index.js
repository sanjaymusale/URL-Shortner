const express = require('express')
const mongoose = require('mongoose')
const useragent = require('useragent');
const port = 3000
var date = new Date

const { Bookmark } = require('./app/models/bookmark')
const app = express()
// app.use(useragent.express());
app.use(express.json())
require('./config/database')


const { urlRouter } = require('./app/controllers/bookmark_controller')
const { userRouter } = require('./app/controllers/user_controller')

app.listen(port, function () {
    console.log('Connected to port 3000')
})
app.use('/bookmark', urlRouter)
app.use('/user', userRouter)

app.get('/:hash', (req, res) => {
    const hash = req.params.hash

    Bookmark.redirectUrl(hash, req)
        .then((bookmark) => {
            res.redirect('http://' + bookmark.original_url)
        })
        .catch((err) => {
            res.send(err)
        })

})


app.get('/', (req, res) => {
    res.send('WELCOME TO URL SHORTNER')
})




