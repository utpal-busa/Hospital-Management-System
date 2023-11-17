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
<<<<<<< HEAD
        type: String,
        required: true
    },
    ID: {
=======
        type: Date,
        required: true
    },
    Phone: {
>>>>>>> 26559a845747222170b74c3f68bf84294f057fb9
        type: String,
        required:true 
    },
    AppointmentTime: {
        type:String,
        required: true
    },
<<<<<<< HEAD
    Visited: {
        type:String,
        required:true
    }
=======
>>>>>>> 26559a845747222170b74c3f68bf84294f057fb9
})




const Appointment = new mongoose.model("Appointment", AppointmentSchema)

module.exports = Appointment