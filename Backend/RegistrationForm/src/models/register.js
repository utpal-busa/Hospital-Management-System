const mongoose = require ('mongoose')

const patientSchema = new mongoose.Schema({
    firstname : {
        type : String,
        required : true
    },

    lastname : {
        type : String,
        required : true
    }
})

const Patient = new mongoose.model("Patient",patientSchema)

module.exports= Patient