require('dotenv').config();
const express = require('express')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');
const path = require('path')
const app = new express()
const bcrypt = require('bcryptjs')
const hbs = require('hbs')
const validator = require("email-validator");
const verifier = require('email-verify');
const cookieParser = require('cookie-parser');
const auth = require('./middleware/auth')
const infoCodes = verifier.infoCodes;
// const cheerio = require('cheerio'); 
require("./db/conn")
const Patient = require("./models/register")
const { error, log } = require('console')
const port = process.env.PORT || 3000

const templatePath = path.join(__dirname, "../templates/views")
app.use(express.static(path.join(__dirname, '../public')))
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))

app.set('view engine', 'hbs')
app.set('views', templatePath)

//console.log(process.env.SECRET_KEY)

app.get("/", (req, res) => {
  //console.log(__dirname/..)
  res.render('index')
})

app.get("/admin_all_emp", (req, res) => {
  res.render('admin_all_emp')
})

app.get("/temp_dashboard", auth, (req, res) => {
  console.log(`this is cookie ${req.cookies.jwt}`);
  res.render('temp_dashboard')
})

app.get("/register", (req, res) => {
  res.render('register')
})

app.get("/reset-password/:id/:token", (req, res) => {
  res.render('resetPassword')
})

app.get("/ForgotPassword", (req, res) => {
  res.render('ForgotPassword')
})

app.get("/login", (req, res) => {
  res.render('login')
})

app.get("/logout", auth, async (req, res) => {
  try {
    //  console.log(req.user)

    //for single device
    // req.user.tokens = req.user.tokens.filter((currElement)=>{
    //    return currElement.token != req.token
    // })


    //for multiple device

    req.user.tokens = []
    res.clearCookie("jwt");
    console.log('logout successfully')

    await req.user.save();
    res.render('index')
  } catch (error) {
    res.status(500).send(error)
  }
})



//Isme error catch nahi ki hai boht jagah jarur ho to dal dena
app.post("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const password = req.body.password;
  // console.log(token)
  // console.log(id)
  jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
    if (err) {
      console.log(err)
      return res.json({ Status: "Error with token" })
    }
    else {
      // console.log(password)
      await bcrypt.hash(password, 10)
      // console.log(password)
      const user = await Patient.findOne({ _id: id })
      if (!user) {
        console.log("heheh");
      }
      else {
        // console.log(useremail.Email)
        user.Password = password
        // console.log(useremail.Password)

        await user.save();

        res.status(400).send('<script>alert("Password updated successfully."); window.location = "/login";</script>'); 
       }


    }
  })
})

app.post("/ForgotPassword", (req, res) => {
  const email = req.body.email
  Patient.findOne({ Email: email })
    .then(user => {
      if (!user) {
        return res.send({ Status: "User not existed" })
      }

      const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY)
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'pradipatarsingh82@gmail.com',
          pass: 'voma dsnw ufqn kwvb'
        }
      });

      var mailOptions = {
        from: 'pradipatarsingh82@gmail.com',
        to: req.body.email,
        subject: 'Reset Password',
        text: `http://localhost:3000/reset-password/${user._id}/${token}`
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
          res.status(400).send('<script>alert("Email has sent for reset password."); window.location = "/login";</script>');

        }
      });
    })

})


app.post("/register", async (req, res) => {
  try {



    if (!(validator.validate(req.body.Email))) {
      return res.status(400).send('<script>alert("Please enter a valid email adress"); window.location = "/register";</script>');
      // res.render('register')
    }

    const phoneNumber = req.body.Phone; // Assuming 'phone' is the field name in your form

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
    if (req.body.password == req.body.confirmPassword) {

      const registeredPatient = new Patient({
        FullName: req.body.fullname,
        Email: req.body.Email,
        Phone: req.body.Phone,
        Password: req.body.password,
        BirthDate: req.body.birthdate,
        AddressLine1: req.body.AddressLine1,
        AddressLine2: req.body.AddressLine2,
        AddressPostalCode: req.body.AddressPostalCode,
        Gender: req.body.gender,
        Role: req.body.role
      })


      const token = await registeredPatient.generateAuthToken();

      //res.cookie("jwt", token, { expires: new Date(Date.now() + 300000), httponly: true })
      ///console.log(cookie) --> Ye karna ho to chatgpt kar lo

      const finalNakho = await registeredPatient.save();
      res.status(400).send('<script>alert("Registered successfully"); window.location = "/"</script>');
      //res.status(201).render('login')
    }
    else {
      //res.send("<h1> Passwords are not matching </h1>")
      res.status(400).send('<script>alert("Passwords do not match. Please try again."); window.location = "/register";</script>');

    }


  } catch (err) {
    res.status(400).send(err)
  }
})

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const useremail = await Patient.findOne({ Email: email })
    if (!useremail) {
      // User with the specified email was not found
      return res.status(400).send('<script>alert("Invalid login details."); window.location = "/login";</script>');
    }
    const isMatch = await bcrypt.compare(password, useremail.Password)
    const token = await useremail.generateAuthToken();
    res.cookie("jwt", token, { expires: new Date(Date.now() + 30000), httponly: true })
    //console.log(token)
   
    if (isMatch) {

      if (useremail.Role == "Admin") {
        res.render('admin_home')
      }
      else {
        res.render('new_doc_home')
      }

      // console.log(`this is cookie ${req.cookies.jwt}`);
    }
    else {
      console.log('ok')
      res.status(400).send('<script>alert("Invalid login details"); window.location = "/login";</script>');
    }

  }
  catch (err) {
    res.status(400).send("Ivalid Login Details")
    console.log(err)
  }
})

app.listen(port, () => {
  console.log(`Listening to port number ${port}`)
})
