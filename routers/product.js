const express = require('express')
const mongoose = require('mongoose')
const Category = require('../models/category')
const router = express.Router()
const multer = require('multer')

const Product = require('../models/product')

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg',
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype]
    let err = new Error('Invalid file uploaded!')
    if (isValid) {
      err = null
    }
    cb(err, 'public/upload')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = file.originalname.split(' ').join('_')
    const extension = FILE_TYPE_MAP[file.mimetype]
    cb(null, `${uniqueSuffix.split('.')[0]}_${Date.now()}.${extension}`)
  },
})

const uploadOptions = multer({ storage: storage })

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

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
  const category = await Category.findById(req.body.category)

  if (!category)
    res.status(400).send({ success: false, message: 'Invalid category!' })
  if (!req.file)
    res.status(400).send({ success: false, message: 'Please upload file!' })

  const filename = req.file.filename
  const basePath = `${req.protocol}://${req.get('host')}/public/upload/`

  const product = await new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: basePath + filename,
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

router.put('/:id', uploadOptions.single('image'), async (req, res) => {
  try {
    const category = await Category.findById(req.body.category)

    if (!category)
      res.status(400).send({ success: false, message: 'Invalid category!' })

    const prodItem = await Product.findById(req.params.id)
    if(!prodItem) res.status(400).send({ success: false, message: 'Product not found!' })

    const file = req.file
    let fileUrl;

    if(file) {
      fileUrl = `${req.protocol}://${req.get('host')}/public/upload/${req.file.filename}`
    } else {
      fileUrl = prodItem.image
    }

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

router.put(
  '/image-gallary/:id',
  uploadOptions.array('images'),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).send({ success: false, message: 'Invalid product Id!' })
    }

    const images = []
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`
    if(req.files) {
      req.files.map(file => {
        const filename = file.filename
        images.push(basePath+filename)
      })
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: images,
      },
      { new: true }
    )

    
    if (!product) {
      res.status(500).send({ success: false, message: 'Product not found' })
    }

    res.status(200).send(product)
  }
)

module.exports = router
