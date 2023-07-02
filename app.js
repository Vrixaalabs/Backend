const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser') 
const cors = require('cors')

require('dotenv').config();

const userRouter = require('./routes/UserRoutes.js')
const adminRouter = require('./routes/AdminRoutes.js')
const User = require('./models/UserModel.js')


const app = express()
app.use(cookieParser())
app.use(cors({ origin: true, credentials: true }))
app.use(express.urlencoded({ extended: true })) //for using json format and sending messages and data in json format
app.use(express.json()) // for using json format and other stuff related to idk


mongoose.set('strictQuery', false)

app.use('/api', userRouter)
app.use('/api/admin', adminRouter)


const server = async ()=>{

    try {
        mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })
    .then(() => console.log(`Connected to the database successfully!`))
    .catch((error) => {
        console.log(`There was an error connecting to the database. ${error}`) // printing the error
    })

    app.listen(process.env.PORT, () => console.log(`Server is running on the PORT: ${process.env.PORT}`))


    } catch (error) {
        console.log(error);
    }
    
}