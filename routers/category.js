const express = require('express')
const router = express.Router()

const Category = require('../models/category')

router.get(`/`, async (req, res) => {
  const categoryList = await Category.find()

  if (!categoryList) {
    res.status(500).json({ success: false })
  }
  res.status(200).send(categoryList)
})

router.get(`/:id`, async (req, res) => {
  const category = await Category.findById(req.params.id)

  if (!category) {
    res.status(500).json({ success: false, message: 'Category not found!' })
  }
  res.status(200).send(category)
})

router.put('/:id', async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
    },
    { new: true }
  )

  if (!category)
    res.status(400).json({ success: false, message: 'Category not found!' })

  res.status(200).send(category)
})

router.post('/', async (req, res) => {
  const category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  })
  const savedCategory = await category.save()
  if (!savedCategory)
    res.status(404).json({ error: 'category not able to save' })
  res.status(200).json(savedCategory)
})

router.delete('/:id', (req, res) => {
  Category.findByIdAndRemove(req.params.id)
    .then((category) => {
      if (category) {
        res
          .status(200)
          .json({
            success: true,
            message: 'Category found and deleted successfully!',
          })
      } else {
        res.status(404).json({ success: false, message: 'Category not found!' })
      }
    })
    .catch((err) => {
      res.status(400).json({ success: false, error: err })
    })
})

module.exports = router
