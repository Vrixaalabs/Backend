const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser') 
const cors = require('cors')
const userRouter = require('./routes/UserRoutes.js')
const adminRouter = require('./routes/AdminRoutes.js')
const User = require('./models/UserModel.js')

const app = express()
app.use(cookieParser())
app.use(cors({ origin: true, credentials: true }))
app.use(express.urlencoded({ extended: true })) //for using json format and sending messages and data in json format
app.use(express.json()) // for using json format and other stuff related to idk


mongoose.set('strictQuery', false)
mongoose.connect('mongodb://0.0.0.0:27017/internDB', { useNewUrlParser: true })
    .then(() => console.log(`Connected to the database successfully!`))
    .catch((error) => {
        console.log(`There was an error connecting to the database. ${error}`) // printing the error
    })
app.use('/api', userRouter)
app.use('/api/admin', adminRouter)


const server = app.listen(5000, () => console.log(`Server is running on the PORT: ${5000}`))