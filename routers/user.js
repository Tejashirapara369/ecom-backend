const express = require('express')
const router = express.Router()

const bcrypt = require('bcryptjs')

const User = require('../models/user')

router.get(`/`, async (req, res) => {
  const userList = await User.find()

  if (!userList) {
    res.status(500).json({ success: false })
  }
  res.send(userList)
})

router.post('/', async (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  })

  const createdUser = await user.save()

  if (!createdUser)
    res
      .status(400)
      .json({ success: false, message: 'Not able to register user!' })
  res.status(200).send(createdUser)
})

module.exports = router
