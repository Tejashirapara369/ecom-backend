const express = require('express')
const app = express()
const morgan = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')

const productsRouter = require('./routers/product')
const categoriesRoutes = require('./routers/category')
const usersRoutes = require('./routers/user')
const ordersRoutes = require('./routers/order')

require('dotenv/config')

const api = process.env.API_URL

// middleware
app.use(express.json())
app.use(morgan('tiny'))
app.use(cors())
app.options('*', cors())

app.use(`${api}/product`, productsRouter)
app.use(`${api}/categories`, categoriesRoutes)
app.use(`${api}/users`, usersRoutes)
app.use(`${api}/orders`, ordersRoutes)

// database connection
mongoose
  .connect(process.env.CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'ecom-shop'
  })
  .then(() => {
    console.log('database connected successfuly!')
  })
  .catch((e) => console.log('error', e))

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})
