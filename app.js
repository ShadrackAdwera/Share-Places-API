const express = require('express')
const bodyParser = require('body-parser')

const placesRoutes = require('./routes/places-routes')
const userRoutes = require('./routes/users-routes')

const app = express()

app.use('/api/places',placesRoutes)
app.use('/api/users', userRoutes)


app.listen(5000)
