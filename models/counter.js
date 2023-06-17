const mongoose = require('mongoose')  
const counterSchema = new mongoose.Schema({
	 attribute:String , 
	 count:Number
})

module.exports = mongoose.model('Counter' , counterSchema)  