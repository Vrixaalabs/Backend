const express = require('express')
const router = express.Router()
const crypt = require('crypto')  
const jwt = require('jsonwebtoken')
const User = require('../models/UserModel.js')
const settings = process.env.jwt_secret;

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

router.get('/user-profile', async (req, res) => {
    try {
        // Retrieve the user ID from the request's authenticated user (e.g., from the JWT)
        const userId = req.user.userId;

        // Find the user in the database using the user ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send({
                status: "failure",
                message: "User not found"
            });
        }

        // Return the user profile
        return res.status(200).send({
            status: "success",
            data: user
        });
    } catch (error) {
        console.log({ error });
        return res.status(500).send({
            status: "failure",
            message: "An error occurred while retrieving the user profile"
        });
    }
});

router.put('/profile/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { first_name, last_name, email,job_title,address,date_of_birth,gender,biography,social_media_links,profile_picture,skills,education_history,work_experience,certifications,languages_spoken } = req.body;

        // Find the user in the database using the user ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send({
                status: "failure",
                message: "User not found"
            });
        }

        // Update the user profile
        user.firstName = first_name;
        user.lastName = last_name;
        user.email = email;
        user.job_title = job_title;
        user.address = address;
        user.date_of_birth = date_of_birth;
        user.gender = gender;
        user.biography = biography;
        user.social_media_links = social_media_links;
        user.profile_picture = profile_picture;
        user.skills = skills;
        user.education_history = education_history;
        user.work_experience = work_experience;
        user.certifications = certifications;
        user.languages_spoken = languages_spoken;

        const updatedUser = await user.save();

        return res.status(200).send({
            status: "success",
            message: "Profile updated successfully",
            data: updatedUser
        });
    } catch (error) {
        console.log({ error });
        return res.status(500).send({
            status: "failure",
            message: "An error occurred while updating the user profile"
        });
    }
});

router.put('/change-password', async (req, res) => {
    try {
        const userId = req.user.userId; // Assuming the authenticated user ID is stored in req.user.userId
        const { current_password, new_password , confirm_new_password } = req.body;

        // Find the user in the database using the user ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send({
                status: "failure",
                message: "User not found"
            });
        }

        // Check if the current password matches
        if (user.password !== getHash(current_password)) {
            return res.status(400).send({
                status: "failure",
                message: "Current password is incorrect"
            });
        }

        // Update the user's password
        user.password = getHash(new_password);
        await user.save();

        return res.status(200).send({
            status: "success",
            message: "Password changed successfully"
        });
    } catch (error) {
        console.log({ error });
        return res.status(500).send({
            status: "failure",
            message: "An error occurred while changing the password"
        });
    }
});

router.put('/reset-password', async (req, res) => {
    try {
        const userId = req.user.userId; // Assuming the authenticated user ID is stored in req.user.userId
        const { email } = req.body;

        // Find the user in the database using the user ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send({
                status: "failure",
                message: "User not found"
            });
        }

        // send reset link to the email 
  

        return res.status(200).send({
            status: "success",
            message: "Password reset link sent to the provided email"
        });
    } catch (error) {
        console.log({ error });
        return res.status(500).send({
            status: "failure",
            message: "An error occurred while resetting the password"
        });
    }
});

router.post('/buy-course', async (req, res) => {
    try {
        const { course_id, course_name, course_instructor } = req.body;
        const userId = req.user.userId; // Assuming the authenticated user ID is stored in req.user.userId

        // Find the user in the database using the user ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send({
                status: "failure",
                message: "User not found"
            });
        }

        // Check if the course is already purchased by the user
        if (user.courses.some(course => course.courseId === course_id)) {
            return res.status(400).send({
                status: "failure",
                message: "Course already purchased"
            });
        }

        // Add the course to the user's purchased courses
        const purchasedCourse = {
            course_id,
            course_name,
            course_instructor
        };
        user.courses.push(purchasedCourse);
        await user.save();

        return res.status(200).send({
            status: "success",
            message: "Course purchased successfully",
            data:user
        });
    } catch (error) {
        console.log({ error });
        return res.status(500).send({
            status: "failure",
            message: "An error occurred while purchasing the course"
        });
    }
});


router.delete('/remove-course', async (req, res) => {
    try {
        const { course_id } = req.body;
        const userId = req.user.userId; // Assuming the authenticated user ID is stored in req.user.userId

        // Find the user in the database using the user ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send({
                status: "failure",
                message: "User not found"
            });
        }

        // Check if the course exists in the user's purchased courses
        const courseIndex = user.courses.findIndex(course => course.courseId === course_id);

        if (courseIndex === -1) {
            return res.status(400).send({
                status: "failure",
                message: "Course not found in purchased courses"
            });
        }

        // Remove the course from the user's purchased courses
        user.courses.splice(courseIndex, 1);
        await user.save();

        return res.status(200).send({
            status: "success",
            message: "Course removed successfully",
            data:user
        });
    } catch (error) {
        console.log({ error });
        return res.status(500).send({
            status: "failure",
            message: "An error occurred while removing the course"
        });
    }
});







module.exports = router