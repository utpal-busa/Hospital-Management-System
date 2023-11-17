const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const patientSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true
    },
    Phone: {
        type: String,
        required: true
    },
    Password: {
        type: String,
        required: true
    },
    Gender: {
        type: String,
        required: true
    },
    BloodGroup: {
        type: String,
        required: true
    },
    BirthDate: {
        type: String,
        required: true
    },
    AddressLine1: {
        type: String,
        required: true
    },
    AddressLine2: {
        type: String,
        required: true
    },
    AddressPostalCode: {
        type: String,
        required: true
    },
    Role: {
        type: String,
        required: true
    },
    ID: {
        type:String,
        required: true
    },
    confirmed:{
        type: String,
        required:true
        
    },
    // leaveRequest:[{
    //     reason: {
    //         type: String,
    //         required: 'true'
    //     },
    //     startDate: {
    //         type: String,
    //         required: 'true'
    //     },
    //     endDate: {
    //         type: String,
    //         required: 'true'
    //     },
    //     status: {
    //         type: String,
    //         required: 'true'
    //     },
    //     ID: {
    //         type: String,
    //         required: 'true'
    //     }  
    // }],
    tokens: [{
        token: {
            type: String,
            required: 'true'
        }
    }]
})

patientSchema.methods.generateAuthToken = async function () {
    try {
        const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY)
        this.tokens = this.tokens.concat({ token: token })
        await this.save()
        return token
    }
    catch (error) {
        res.send(error)
        console.log('dipak' + error)
    }
}
patientSchema.pre("save", async function (next) {
    if (this.isModified("Password")) {
        this.Password = await bcrypt.hash(this.Password, 10)
    }
    next()
})


const Patient = new mongoose.model("Patient", patientSchema)

module.exports = Patient