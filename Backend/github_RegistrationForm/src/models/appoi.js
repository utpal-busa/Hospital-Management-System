const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const AppointmentSchema = new mongoose.Schema({
    Doctor: {
        type: String,
        required: true
    },
    Patient: {
        type: String,
        required: true
    },
    AppointmentDate: {
        type: Date,
        required: true
    },
    Phone: {
        type: String,
        required:true 
    },
    AppointmentTime: {
        type:String,
        required: true
    },
})




const Appointment = new mongoose.model("Appointment", AppointmentSchema)

module.exports = Appointment