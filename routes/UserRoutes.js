const express = require('express')
const router = express.Router()

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
            password,
            confirmPassword,
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
        else if (user.password !== password) return res.status(403).send({
            status: 'failure',
            message: 'Incorrect password!'
        })
        // case of correct password 
        else if (user.password === password) {
            // token generation 
            const token = 'token'
            res.status(200).send({
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