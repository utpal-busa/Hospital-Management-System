const jwt = require('jsonwebtoken')
const Patient = require ('../models/register')

const auth = async (req,res,next)=>{
    try{
       const token = req.cookies.jwt;
       const verifyUser = jwt.verify(token,process.env.SECRET_KEY)
      // console.log(verifyUser)
       const user = await Patient.findOne({_id:verifyUser._id})
       //console.log(user);

       req.user=user;
       req.token=token
       next();
    }
    catch(err)
    {
       res.status(401).send(err)
       console.log(err)
    }
}

module.exports = auth