const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const LeaveSchema = new mongoose.Schema({
  
    Employee: {
        type: String,
        required: true
    },
    ID:{
            type:String,
            required:true
    },
    StartDate: {
        type: String,
        required: true
    },
    EndDate: {
        type: String,
        required:true 
    },
    Reason: {
        type:String,
        required: true
    },
    Approve: {
        type:String,
        required:true
    }
})




const Leave = new mongoose.model("Leave", LeaveSchema)

module.exports = Leave