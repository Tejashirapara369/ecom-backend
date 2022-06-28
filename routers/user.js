const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const mongoose = require('mongoose')

router.get('/count', async (req, res) => {
  try {
    const userCount = await User.countDocuments()

    if (!userCount) res.status(400).send({ message: 'Result not found!' })

    res.status(200).json({ userCount })
  } catch (e) {
    res.status(500).send({ message: 'something went wrong', error: e })
  }
})

router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email })

  if (!user) res.status(400).json({ success: false, message: 'user not found' })

  if (req.body && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const secretKey = process.env.SECRET_KEY
    console.log('user.isAdmin', user.isAdmin)
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secretKey
    )

    res.status(200).json({
      success: true,
      message: 'User authenticated!',
      email: user.email,
      token,
    })
  } else {
    res.status(400).json({ success: false, message: 'Invalid credentials!' })
  }
})

router.post('/register', async (req, res) => {
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

router.get(`/`, async (req, res) => {
  const userList = await User.find().select('-passwordHash')

  if (!userList) {
    res.status(500).json({ success: false })
  }
  res.send(userList)
})

router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    res.status(400).json({ success: false, message: 'Invalid user id!' })

  const user = await User.findById(req.params.id).select('-passwordHash')

  if (!user) res.status(400).json({ success: false, message: 'user not found' })
  res.status(200).send(user)
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
      .json({ success: false, message: 'Not able to create user!' })
  res.status(200).send(createdUser)
})

router.put('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    res.status(400).json({ success: false, message: 'Invalid user id!' })
  const user = await User.findById(req.params.id)
  if (!user)
    res.status(400).json({ success: false, message: 'User not fouund!' })

  console.log(' req.body.password', req.body.password)
  let passwordHash = req.body.password
    ? bcrypt.hashSync(req.body.password, 10)
    : user.passwordHash

  const updatedUser = await User.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    email: req.body.email,
    passwordHash: passwordHash,
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  })

  if (updatedUser) res.status(200).send(updatedUser)
})

router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).send({ success: false, message: 'Invalid user Id!' })
    }

    const user = await User.findByIdAndRemove(req.params.id)

    if (!user)
      res.status(404).json({ success: false, message: 'User not found' })

    res
      .status(200)
      .send({ success: true, message: 'User deleted successfully!' })
  } catch (e) {
    res
      .status(400)
      .send({ success: false, message: 'Something went wrong', error: e })
  }
})


module.exports = router
