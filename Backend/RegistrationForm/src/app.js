const express = require ('express')
const path = require ('path')
const app= new express()
const bcrypt = require ('bcryptjs')
const hbs= require ('hbs')
const  validator = require("email-validator");

 // const cheerio = require('cheerio'); 
require("./db/conn")
const Patient=require("./models/register")
const { error } = require('console')
const port = process.env.PORT || 3000

const templatePath = path.join(__dirname,"../templates/views")
app.use(express.static(path.join(__dirname,'../public')))
app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.set('view engine','hbs')
app.set('views',templatePath)

app.get("/",(req,res)=>{
    //console.log(__dirname/..)
    res.render('index')
})

app.get("/register",(req,res)=>{
    res.render('register')
})

app.get("/login",(req,res)=>{
    res.render('login')
})


app.post("/register",async (req,res)=>{
    try{
         

      if (!(validator.validate(req.body.Email))) {
       return  res.status(400).send('<script>alert("Please enter a valid email adress"); window.location = "/register";</script>');
       // res.render('register')
    } 

    const phoneNumber = req.body.phone; // Assuming 'phone' is the field name in your form

    // Use a regular expression to validate the phone number format
    const phoneNumberRegex = /^\d{10}$/; // This regex assumes a 10-digit phone number

    if (!phoneNumberRegex.test(phoneNumber)) {
        return res.status(400).send('<script>alert("Invalid phone number format. Please enter a 10-digit number.");window.location = "/register";</script>');
    }


    const existingUser = await Patient.findOne({ Email: req.body.Email });

        if (existingUser) {
            // If a user with the same email exists, display an error message
            return res.status(400).send('<script>alert("This Email address already exists"); window.location = "/register";</script>');
        }
          if(req.body.password == req.body.confirmPassword)
          {
                 
                   const registeredPatient = new Patient({
                    FullName : req.body.fullname,
                    Email : req.body.Email,
                    Phone : req.body.Phone,
                    Password : req.body.password,
                    BirthDate : req.body.birthdate,
                    AddressLine1 : req.body.AddressLine1,
                    AddressLine2 : req.body.AddressLine2,
                    AddressPostalCode: req.body.AddressPostalCode,
                    Gender : req.body.gender
             })
            
              try{
                const token = await registeredPatient.generateAuthToken();
              }
              catch(err)
              {
                console.log(err)
              }
             
              const finalNakho =await registeredPatient.save();
              res.status(400).send('<script>alert("Registered successfully"); window.location = "/login"</script>');
            //res.status(201).render('login')
           }
          else{
                //res.send("<h1> Passwords are not matching </h1>")
                res.status(400).send('<script>alert("Passwords do not match. Please try again."); window.location = "/register";</script>');
              
          }
     
  
    }catch(err){
        res.status(400).send(err)
    }
})

app.post("/login",async (req,res)=>{
    try{
          const email = req.body.email;
          const password = req.body.password;
        
          const useremail =  await Patient.findOne({Email:email})
          const isMatch = await bcrypt.compare(password,useremail.Password)
          if(isMatch)
          { 
            res.render('dashboardfinal')
          }
          else
          {
            res.send("<h2>Invalid Login Details</h2>")
          }
         
    }
    catch(err){
        res.status(400).send("Invalid Login Details")
    }
})

app.listen(port,()=>{
    console.log(`Listening to port number ${port}`)
})
