const express = require('express')
const router = express.Router()

const { User } = require('../models/user')
const { authenticateUser } = require('../middlewares/authenticate')


router.get('/', authenticateUser, (req, res) => {
    User.find()
        .then((users) => {
            res.send(users)
        })
        .catch((err) => {
            res.send(err)
        })
})

router.post('/register', (req, res) => {
    const body = req.body
    const user = new User(body)
    user.save()
        .then((user) => {
            res.send({
                user,
                notice: "Succesfully Registered"
            })
        })
        .catch((err) => {
            res.send(err)
        })

})

//to login

router.post('/login', (req, res) => {
    const body = req.body
    User.findByEmailandPassword(body.email, body.password)
        .then((user) => {
            return user.generateToken()
        })
        .then((token) => {
            res.header('x-auth', token).send()
        })
        .catch((err) => {
            res.send(err)
        })
})

router.delete('/logout', authenticateUser, (req, res) => {
    if (!req.token) {
        const tokenData = req.token
        const user = req.user
        console.log('inside delete')
        var newTokenData = user.tokens.filter(x => x.token != tokenData)
        user.tokens = newTokenData
        user.save()
            .then((user) => {
                res.send(user)
            })
            .catch((err) => {
                res.send(err)
            })
    }
    else {
        res.send({ notice: 'alrede' })
    }
})

router.delete('/logoutall', authenticateUser, (req, res) => {
    const tokenData = req.token
    const user = req.user
    User.findOneAndUpdate(user._id, { $set: { 'tokens': [] } })
        .then((user) => {
            res.send(user)

        })
        .catch((err) => {
            res.send(err)
        })

})
module.exports = {
    userRouter: router
}