const jwt = require('jsonwebtoken')
const Patient = require ('../models/register')

const auth_login = async (req,res,next)=>{
    try{
       const token = req.cookies.jwt;
       if(!token)
       {
          next()
       }
       else{
        res.status(200).json({
            message: "You have to do Log Out for further Process"
          });
       }
    }
    catch(err)
    {
      // res.status(401).send(err)
       console.log(err)
       return res.status(401).send('<script>alert("Unauthorized. Please log in."); window.location = "/";</script>');
    }
}

module.exports = auth_login