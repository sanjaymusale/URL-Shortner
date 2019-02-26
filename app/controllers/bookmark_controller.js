const mongoose = require('mongoose')
const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()
const { Bookmark } = require('../models/bookmark')
const { User } = require('../models/user')
const { validateID } = require('../middlewares/validate')
const { authenticateUser } = require('../middlewares/authenticate')

router.get('/', authenticateUser, (req, res) => {
    Bookmark.find({ user: req.user._id })
        .then((bookmark) => {
            res.send(bookmark)
        })
        .catch(() => {
            console.log('error')
        })
})

router.post('/', authenticateUser, (req, res) => {
    const body = req.body
    const bookmark = new Bookmark(body)
    bookmark.user = req.user._id
    bookmark.save()
        .then((bookmark) => {
            res.send(bookmark)
        })
        .catch((err) => {
            res.send(err)
        })
})

router.get('/tags', authenticateUser, (req, res) => {
    // console.log(req.query.name.split(','))
    Bookmark.find({ tags: { "$in": req.query.name.split(',') } })
        .then((bookmark) => {
            res.send(bookmark)
        })
        .catch((err) => {
            res.send(err)
        })
})

router.get('/tags/:name', authenticateUser, (req, res) => {
    const name = req.params.name

    Bookmark.find({ tags: name })
        .then((bookmarks) => {
            res.send(bookmarks)
        })
        .catch(() => {
            console.log('error')
        })
})

router.get('/:id', validateID, authenticateUser, (req, res) => {
    const id = req.params.id
    Bookmark.findById(id)
        .then((bookmark) => {
            res.send(bookmark)
        })
        .catch((err) => {
            res.send(err)
        })

})

router.put('/:id', validateID, authenticateUser, (req, res) => {
    const id = req.params.id
    Bookmark.findByIdAndUpdate(id, req.body)
        .then(() => {
            res.send("Update Succesfull")
        })
        .catch((err) => {
            res.send(err)
        })

})

router.delete('/:id', validateID, authenticateUser, (req, res) => {
    const id = req.params.id
    Bookmark.findByIdAndDelete(id)
        .then((bookmark) => {
            res.send(bookmark)
        })
        .catch((err) => {
            res.send(err)
        })

})





module.exports = {
    urlRouter: router
}