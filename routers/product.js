const express = require('express')
const mongoose = require('mongoose')
const Category = require('../models/category')
const router = express.Router()

const Product = require('../models/product')

// API end points
router.get('/count', async (req, res) => {
  try {
    const productCount = await Product.countDocuments()

    if (!productCount) res.status(400).send({ message: 'Result not found!' })

    res.status(200).json({ productCount })
  } catch (e) {
    res.status(500).send({ message: 'something went wrong', error: e })
  }
})

router.get('/feature/:count', async (req, res) => {
  try {
    const count = req.params.count
    const products = await Product.find({ isFeatured: true }).limit(+count)
    if (!products)
      res
        .status(400)
        .json({ success: false, message: 'No feature products available!' })
    res.status(200).send(products)
  } catch (e) {
    res
      .status(500)
      .json({ success: false, message: 'Something went wrong!', error: e })
  }
})

router.get(`/`, (req, res) => {
  let filter = {}

  if (req.query.categories) {
    filter['category'] = req.query.categories.split(',')
  }

  Product.find(filter)
    .populate('category')
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((err) => {
      res.status(500).json({ error: err })
    })
})

router.get('/:id', async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id).populate('category')
    if (!prod)
      res.status(404).send({ success: false, message: 'Product not found!' })
    res.status(200).send(prod)
  } catch (e) {
    res
      .status(400)
      .send({ success: false, message: 'Something went wrong!', error: e })
  }
})

router.post(`/`, async (req, res) => {
  const category = await Category.findById(req.body.category)

  if (!category)
    res.status(400).send({ success: false, message: 'Invalid category!' })

  const product = await new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: req.body.image,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  }).save()

  if (!product) {
    res.status(500).json({
      error: 'Something went wrong!',
      success: false,
    })
  }

  res.status(201).json({
    success: true,
    data: product,
  })
})

router.put('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.body.category)

    if (!category)
      res.status(400).send({ success: false, message: 'Invalid category!' })

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
      },
      { new: true }
    )

    if (!product) {
      res.status(500).send({ success: false, message: 'Product not found' })
    }

    res.status(200).send(product)
  } catch (e) {
    res
      .status(500)
      .send({ success: false, message: 'Something went wrong', error: e })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).send({ success: false, message: 'Invalid product Id!' })
    }

    const product = await Product.findByIdAndRemove(req.params.id)

    if (!product)
      res.status(404).json({ success: false, message: 'Product not found' })

    res
      .status(200)
      .send({ success: true, message: 'Product deleted successfully!' })
  } catch (e) {
    res
      .status(400)
      .send({ success: false, message: 'Something went wrong', error: e })
  }
})

module.exports = router
