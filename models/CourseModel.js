const mongoose = require('mongoose')
const courseSchema = new mongoose.Schema({
    courseName: {
        type: String,
        required: true
    },
    courseTitle: {
        type: String,
        required: true
    },
    uploadDate: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    instructors: [],
    department: {
        type: String,
        required: true
    },
    numChapters: {
        type: Number,
        required: true
    }
})


module.exports = mongoose.model('Course' , courseSchema)