const router = require('express').Router()
const Course = require('../models/CourseModel.js')

router.get('/', async (req, res) => {
    res.status(200).send({
        status: 'success',
        message: 'Testing admin api route.'
    })
})

router.post('/add-course', async (req, res) => {
    const { courseName, courseTitle, uploadDate, duration, instructors, department, numChapters } = req.body

    try {
        // checking if a course with same name exists or not?
        const result = await Course.findOne({ courseTitle })
        if (result) return res.status(500).send({
            status: 'failure',
            message: 'This title is already assigned to another course!'
        })

        let course = new Course({
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
            courseId: course._id
        })


    } catch (error) {
        console.log({ error })
        return res.status(400).send({
            status: 'failure',
            message: 'An error occured during course addition! Please try again later.'
        })
    }
})

router.put('/edit-course' , async(req,res) => {

})

router.delete('/remove-course' , async(req,res) => {

})

router.get('/list-courses' , async(req,res) => {
	const courses = await Course.find({})  
	return res.status(200).send({
		status:'success',
		courses
	})
})


module.exports = router