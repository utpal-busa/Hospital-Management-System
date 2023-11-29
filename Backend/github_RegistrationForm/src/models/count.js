const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const CountSchema = new mongoose.Schema({
    Doctor: {
        type: String,
        required: true
    },
   Date:{
    type: String,
    required:true
   }
})




const Count = new mongoose.model("Count", CountSchema)

module.exports = Count