const express = require('express')
const router = express.Router()
const crypt = require('crypto')  
const jwt = require('jsonwebtoken')
const User = require('../models/UserModel.js')
const settings = require('../config/settings.js')

// calculating the hash
const getHash = (text) => {
    const hash = crypt.createHash('sha512')
    hash.update(text) 
    return hash.digest('hex')
}
// console.log({settings})
// console.log(getHash('thisisjwtsecret'))

const time = 7 * 24 * 60 * 60 * 1000
const createToken = async(userId) => {
    return jwt.sign({userId} , settings.jwt_secret , {
        expiresIn:time
    })
}

router.get('/', async (req, res) => {
    res.status(200).send('this is api route testing.')
})


router.post('/signup', async (req, res) => {

    const { firstName, lastName, email, password, confirmPassword, department, phoneNumber } = req.body
    try {
        let user = await User.findOne({ email })
        if (user) return res.status(400).send({
            status: "failure",
            message: "This email is already registered!"
        })
        // before registering the user we need to encrypt the password 
        user = new User({
            firstName,
            lastName,
            email,
            password:getHash(password),
            confirmPassword:getHash(confirmPassword),
            department,
            phoneNumber
        })

        user = await user.save()

        if (!user) return res.status(500).send({
            status: "failure",
            message: "There was a problem during registration! Please try again later."
        })
        return res.status(200).send({
            status: "success",
            message: "User registered successfully"
        })
    } catch (error) {
        console.log({ error })
        return res.status(500).send({
            status: "failure",
            message: 'An error occured!'
        })
    }

})

router.post('/login', async (req, res) => {

    try {
        const { email, password } = req.body
        const user = await User.findOne({ email }) // getting user credentials 
        // checking if the user exists or not 
        if (!user) return res.status(400).send({
            status: "failure",
            message: 'No user is registered with this email!'
        })
        // if incorrect password 
        else if (user.password !== getHash(password)) return res.status(403).send({
            status: 'failure',
            message: 'Incorrect password!'
        })
        // case of correct password 
        else if (user.password === getHash(password)) {
            // token generation and setting the cookie
            const token = await createToken(user._id)
            res.cookie('accessToken', token, {
                withCredentials: true,
                httpOnly: true,
                maxAge: time,
                secure: false
            })

            return res.status(200).send({
                status: 'success',
                message: 'User logged in successfully',
                token
            })
        }

    } catch (error) {
        console.log({ error })
        return res.status(500).send({
            status: 'failure',
            message: 'An error occured!'
        })
    }

})






module.exports = router