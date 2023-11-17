const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const PrescriptionSchema = new mongoose.Schema({
    ID : {
        type: String,
        required: true
    },
    Doctor:{
        type: String,
        required: true
    },
    AppointmentDate:{
        type: String,
        required: true
    },
    Symptoms: [{
        Symptom: {
            type: String,
            required: 'true'
        }
    }],
    Diagnoses: [{
        Diagnosis: {
            type: String,
            required: 'true'
        }
    }],
    Medicines: [{
        Medicine: {
            type: String,
            required: 'true'
        }
    }],
    Dos: [{
        Do: {
            type: String,
            required: 'true'
        }
    }],
    NotDos: [{
        NotDo: {
            type: String,
            required: 'true'
        }
    }],
    Investigations: [{
        Investigation: {
            type: String,
            required: 'true'
        }
    }],
    FollowUpDate:{
          type:String,
          required:'true'
    },
})




const  Prescription = new mongoose.model("Prescription", PrescriptionSchema)

module.exports = Prescription