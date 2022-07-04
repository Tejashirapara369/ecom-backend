const express = require('express')
const app = express()
const morgan = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')

const productsRouter = require('./routers/product')
const categoriesRoutes = require('./routers/category')
const usersRoutes = require('./routers/user')
const ordersRoutes = require('./routers/order')
const authJwt = require('./helpers/jwt')
const errorHandler = require('./helpers/error-handlers')

require('dotenv/config')

const api = process.env.API_URL

// middleware
app.use(express.json())
app.use(morgan('tiny'))
app.use(cors())
app.use(authJwt())
app.use('/public/upload', express.static(__dirname+'/public/upload'))
app.options('*', cors())
app.use(errorHandler)

app.use(`${api}/products`, productsRouter)
app.use(`${api}/categories`, categoriesRoutes)
app.use(`${api}/users`, usersRoutes)
app.use(`${api}/orders`, ordersRoutes)

// database connection
mongoose
  .connect(process.env.CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'ecom-shop',
  })
  .then(() => {
    console.log('database connected successfuly!')
  })
  .catch((e) => console.log('error', e))

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log('Server is running on port 3000')
})
