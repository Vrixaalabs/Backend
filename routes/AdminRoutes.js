const router = require('express').Router()
const Course = require('../models/CourseModel.js')
const Counter = require('../models/counter.js')
const User = require('../models/UserModel.js')

router.get('/', async (req, res) => {
    res.status(200).send({
        status: 'success',
        message: 'Testing admin api route.'
    })
})


router.post('/add-course', async (req, res) => {
    const {
        courseName,
        courseTitle,
        uploadDate,
        duration,
        instructors,
        department,
        numChapters
    } = req.body


    try {
        // checking if a course with same name exists or not?
        let result = await Course.findOne({ courseTitle })
        if (result) return res.status(500).send({
            status: 'failure',
            message: 'This title is already assigned to another course!'
        })

        let courseCounter = await Counter.findOne({ attribute: 'course' })
        // this means we haven't added any courses yet otherwise there would be counter for the courses
        if (!courseCounter) {
            courseCounter = new Counter({
                attribute: 'course',
                count: 0
            })
        }
        courseCounter.count += 1 // increasing the course counter number 
        result = await courseCounter.save() // saving the changes 
        if (!result) return res.status(400).send({
            status: 'failure',
            message: 'There was an error adding the course! Please try again later.'
        })

        //creating course-id 
        let code = courseCounter.count.toString()
        for (let i = code.length; i < 4; i++) code += '0'
        code = code.split('').reverse().join('')


        let course = new Course({
            courseId: "COURSE-" + code,
            courseName,
            courseTitle,
            uploadDate,
            duration,
            instructors,
            department,
            numChapters
        })

        course = await course.save()
        if (!course) return res.status(400).send({
            status: 'failure',
            message: 'There was an error adding the course! Please try again later.'
        })
        return res.status(200).send({
            status: 'success',
            message: 'Course added successfully',
            courseId: course.courseId
        })


    } catch (error) {
        console.log({ error })
        return res.status(400).send({
            status: 'failure',
            message: 'An error occured during course addition! Please try again later.'
        })
    }
})

router.put('/edit-course', async (req, res) => {
    const {
        courseId,
        courseName,
        courseTitle,
        uploadDate,
        duration,
        instructors,
        department,
        numChapters
    } = req.body

    try {

        let course = await Course.findOne({ courseId })

        if (!course) return res.status(400).send({
            status: 'failure',
            message: 'No course found'
        })
        course.courseName = courseName 
        course.courseTitle = courseTitle 
        course.uploadDate = uploadDate 
        course.duration = duration 
        course.instructors = instructors 
        course.department = department 
        course.numChapters = numChapters 

        course  = await course.save() 

        if (!course) return res.status(400).send({
            status: 'failure',
            message: 'An error occured during course updation! Please try again later.'
        })
        return res.status(200).send({
            status:'success',
            message:'Course edited successfully',
            course
        })

    } catch (error) {
        console.log({ error })
        return res.status(500).send({
            status: 'failure',
            message: 'There was an error during course updation! Please try again later.',
            courseId: 'courseId'
        })
    }
})

router.delete('/remove-course', async (req, res) => {
    const { courseId, courseName } = req.body
    try {
        // deleting the course requested
        const course = await Course.deleteOne({ _id: courseId })
        if (course.deletedCount) return res.status(200).send({
            status: 'success',
            message: 'Course removed successfully'
        })
        else return res.status(404).send({
            status: 'failure',
            message: 'Course not found!'
        })
    } catch (error) {
        console.log({ error })
        return res.status(500).send({
            status: 'failure',
            message: 'An error occured!'
        })
    }
})

router.get('/list-courses', async (req, res) => {
    const courses = await Course.find({})
    return res.status(200).send({
        status: 'success',
        courses
    })
})


router.get('/users/:userId', async (req, res) => {
    try {
        const user_id = req.params.userId;

        // Find the user in the database using the user ID
        const user = await User.findById(user_id);

        if (!user) {
            return res.status(404).send({
                status: "failure",
                message: "User not found"
            });
        }

        // Exclude sensitive fields from the response, if any
        const userProfile = {
            id:user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            department: user.department,
            phoneNumber: user.phoneNumber,
            address:user.address,
            date_of_birth:user.date_of_birth,
            gender:user.gender,
            bio:user.biography,
            social_media:user.social_media_links,
            profile_picture:user.profile_picture,
            skills:user.skills,
            education:user.education,
            work_experience:user.work_experience,
            certifications:user.certifications,
            languages:user.languages_spoken
            // Add other fields as needed
        };

        return res.status(200).send({
            status: "success",
            userProfile
        });
    } catch (error) {
        console.log({ error });
        return res.status(500).send({
            status: "failure",
            message: "An error occurred while fetching the user profile"
        });
    }
});



module.exports = router