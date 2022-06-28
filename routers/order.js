const express = require('express')
const router = express.Router()

const Order = require('../models/order')
const User = require('../models/user')
const OrderItem = require('../models/order-item')

router.get(`/`, async (req, res) => {
  const orderList = await Order.find()
    .populate('user', 'name')
    .sort({ dateOrdered: -1 })

  if (!orderList) {
    res.status(500).json({ success: false })
  }
  res.send(orderList)
})

router.get('/totalSales', async (req, res) => {
    const totalSale = await Order.aggregate([
        {$group: {_id:null, totalSales: {$sum: '$totalPrice'}}}
    ])
    if(!totalSale) res.status(400).send("no sale found")

    res.status(200).send({totalSale: totalSale.pop().totalSales})
})

router.get('/orderCount', async (req, res) => {
    const totalCount = await Order.countDocuments()
    if(!totalCount) res.status(400).send("no sale found")

    res.status(200).send({totalCount: totalCount})
})

router.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name')
    .populate({
      path: 'orderItems',
      populate: {
        path: 'product',
        populate: 'category',
      },
    })
  if (!order) {
    res.status(500).json({ success: false })
  }
  res.send(order)
})

router.post(`/`, async (req, res) => {
  const user = await User.findById(req.body.user)
  if (!user) res.status(400).send({ success: false, message: 'Invalid user!' })
  const orderItemsIds = await Promise.all(
    req.body.orderItems.map(async (item) => {
      const orderItem = new OrderItem({
        quantity: item.quantity,
        product: item.product,
      })
      const savedItem = await orderItem.save()
      return savedItem._id
    })
  )

  const totalPrices = Promise.all(orderItemsIds.map(async (item) => {
    const orderItem = await OrderItem.findById(item).populate('product', 'price')
    return orderItem.quantity * orderItem.product.price
  }))

  const totalPrice = (await totalPrices).reduce((a,b) => a+b, 0)

  const order = await new Order({
    orderItems: orderItemsIds,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
  }).save()

  if (!order) {
    res.status(500).json({
      error: 'Not able to create order!!',
      success: false,
    })
  }

  res.status(201).json({
    success: true,
    data: order,
  })
})

router.put('/:id', async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true }
  )

  if (!order)
    res.status(400).json({ success: false, message: 'Order not found!' })

  res.status(200).send(order)
})

router.delete('/:id', (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async (item) => {
          await OrderItem.findByIdAndRemove(item)
        })

        res.status(200).json({
          success: true,
          message: 'Order found and deleted successfully!',
        })
      } else {
        res.status(404).json({ success: false, message: 'Order not found!' })
      }
    })
    .catch((err) => {
      console.log('err', err)
      res.status(400).json({ success: false, error: err })
    })
})

router.get(`/userOrder/:id`, async (req, res) => {
    const userOrders = await Order.find({user: req.params.id})
      .populate('user', 'name')
      .populate({
        path: 'orderItems',
        populate: {
          path: 'product',
          populate: 'category',
        },
      })
    if (!userOrders) {
      res.status(500).json({ success: false })
    }
    res.send(userOrders)
  })

module.exports = router
