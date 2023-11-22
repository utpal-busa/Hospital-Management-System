require('dotenv').config();
const express = require('express')
const jwt = require('jsonwebtoken')
const ShortUniqueId = require('short-unique-id');
const nodemailer = require('nodemailer');
const path = require('path')
const app = new express()
const bcrypt = require('bcryptjs')
const hbs = require('hbs')
const validator = require("email-validator");
const verifier = require('email-verify');
const cookieParser = require('cookie-parser');
const auth = require('./middleware/auth')
const auth_admin = require('./middleware/auth_admin')
const auth_doctor = require('./middleware/auth_doctor')
const auth_patient = require('./middleware/auth_patient')
const auth_recep = require('./middleware/auth_recep')
const auth_login = require('./middleware/auth_login')
const infoCodes = verifier.infoCodes;
// const cheerio = require('cheerio'); 
require("./db/conn")
const Patient = require("./models/register")
const Appointment = require("./models/appoi")
const Leave = require("./models/leaves")
const Prescription = require("./models/prescreption")

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

app.get("/receptionist_base", auth_recep, async (req, res) => {
  res.render('receptionist_base', { user: req.user })
})

app.get("/recep_profile", auth_recep, async (req, res) => {
  const token = req.cookies.jwt;
  const verifyUser = jwt.verify(token, process.env.SECRET_KEY)
  // console.log(verifyUser)
  const user = await Patient.findOne({ _id: verifyUser._id })
  console.log(user.Name)
  res.render("recep_profile", { user })
})
app.get("/rec_notification", auth_recep, async (req, res) => {

  const token = req.cookies.jwt;
  const verifyUser = jwt.verify(token, process.env.SECRET_KEY)
  // console.log(verifyUser)
  const user = await Patient.findOne({ _id: verifyUser._id })

  const leavesForEmployee = await Leave.find({ ID: user.ID });
  res.render('rec_notification', { leavesForEmployee, user })
})
app.get("/recep_register", auth_recep, (req, res) => {
  res.render('recep_register', { user: req.user })
})
app.get("/admin_add_emp", auth_admin, (req, res) => {
  res.render('admin_add_emp', { user: req.user })
})

app.get("/admin_all_admin", auth_admin, (req, res) => {
  // console.log("k")
  res.render('admin_all_admin', { user: req.user })
})

app.get("/admin_all_doctor", auth_admin, (req, res) => {
  res.render('admin_all_doctor', { user: req.user })
})

app.get("/admin_all_emp", auth_admin, (req, res) => {
  res.render('admin_all_emp', { user: req.user })
})

app.get("/admin_all_leaves", auth_admin, async (req, res) => {

  const pendingLeaves = await Leave.find({ Approve: 'Pending' });
  // console.log(pendingLeaves[0].ID)

  res.render('admin_all_leaves', { pendingLeaves, user: req.user })
})

app.get("/admin_all_recep", auth_admin, (req, res) => {
  res.render('admin_all_recep', { user: req.user })
})

app.get("/admin_emp_details", auth_admin, (req, res) => {
  res.render('admin_emp_details', { user: req.user })
})

app.get("/new_doc_patient_det", auth_doctor, (req, res) => {
  res.render('new_doc_patient_det', { user: req.user })
})


app.get("/admin_home", auth_admin, async (req, res) => {


  const countEntries = async (model, role) => {
    try {
      const count = await model.countDocuments({ Role: role });
      return count;
    } catch (error) {
      console.error(`Error counting ${role}s:`, error);
    }
  };

  const patientCount = await countEntries(Patient, 'Patient');
  const doctorCount = await countEntries(Patient, 'Doctor');
  const recepCount = await countEntries(Patient, 'Receptionist');
  const emp = doctorCount + recepCount
  res.render('admin_home', { user: req.user, patientCount, doctorCount, emp })
})

app.get("/admin_search_emp", auth_admin, (req, res) => {
  res.render('admin_search_emp', { user: req.user })
})
app.get("/prescription", auth_patient, (req, res) => {
  res.render('prescription', { user: req.user })
})

app.get("/recep_view_edit_appointment", auth_recep, (req, res) => {
  res.render('recep_view_edit_appointment', { user: req.user })
})

app.get("/view_appointment", auth_patient, async (req, res) => {

  const token = req.cookies.jwt;
  const verifyUser = jwt.verify(token, process.env.SECRET_KEY)
  // console.log(verifyUser)
  const user = await Patient.findOne({ _id: verifyUser._id })

  const patientID = user.ID;
  //console.log(patientName)
  //const user=req.user;
  //console.log(req.user.Email);
  // Use Mongoose to find appointments by patient name
  const appointments = await Appointment.find({ ID: patientID });
  //  console.log(patientID);
  //  console.log(appointments.Doctor)
  res.render('view_appointment', { appointments, user })
})

app.get("/patient_appointment", auth_patient, (req, res) => {
  res.render('patient_appointment', { user: req.user })
})

app.get("/view_prescription", auth_patient, async (req, res) => {

  const token = req.cookies.jwt;
  const verifyUser = jwt.verify(token, process.env.SECRET_KEY)
  // console.log(verifyUser)
  const user = await Patient.findOne({ _id: verifyUser._id })

  const patientID = user.ID;

  Prescription.find({ ID: patientID })
    .exec()
    .then((prescriptions) => {
      res.render('view_prescription', { prescriptions, user })
      // Do something with the found prescriptions
    })
    .catch((err) => {
      console.error(err);
      // Handle the error
    });

})

app.get("/editProfile", auth, (req, res) => {
  res.render('editProfile')
})

app.get("/admin_profile", auth_admin, async (req, res) => {
  const token = req.cookies.jwt;
  const verifyUser = jwt.verify(token, process.env.SECRET_KEY)
  // console.log(verifyUser)
  const user = await Patient.findOne({ _id: verifyUser._id })
  console.log(user.Name)
  res.render("admin_profile", { user })
})

app.get("/doc_profile", auth_doctor, async (req, res) => {
  const token = req.cookies.jwt;
  const verifyUser = jwt.verify(token, process.env.SECRET_KEY)
  // console.log(verifyUser)
  const user = await Patient.findOne({ _id: verifyUser._id })
  console.log(user.Name)
  res.render("doc_profile", { user })

})

app.get("/patient_home", auth_patient, (req, res) => {
  res.render('patient_home', { user: req.user })
})

app.get("/new_doc_home", auth_doctor, (req, res) => {
  res.render('new_doc_home', { user: req.user })
})


app.get("/receptionist_leave", auth_recep, (req, res) => {
  res.render('receptionist_leave', { user: req.user })
})

app.get("/new_me", auth_doctor, (req, res) => {
  res.render('new_me')
})

app.get("/new_doc_visited_pat", auth_doctor, (req, res) => {
  res.render('new_doc_visited_pat', { user: req.user })
})

app.get("/patient_visit", auth_recep, async (req, res) => {
  res.render('patient_visit', { user: req.user })
})

app.get("/new_doc_obs", auth_doctor, (req, res) => {
  res.render('new_doc_obs', { user: req.user })
})

app.get("/doc_pat_vis", auth_doctor, (req, res) => {
  res.render('doc_pat_vis', { user: req.user })
})

app.get("/temp_dashboard", auth, (req, res) => {
  console.log(`this is cookie ${req.cookies.jwt}`);
  res.render('temp_dashboard')
})

app.get("/Register_new", auth_login, (req, res) => {
  res.render('Register_new')
})

app.get("/reset-password/:id/:token", (req, res) => {
  res.render('resetPassword')
})

app.get("/confirm-email/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const user = await Patient.findOne({ _id: id })
  user.confirmed = "True";
  await user.save();
  res.status(400).send('<script>alert("Registered successfully."); window.location = "/login";</script>');
  // console.log(id)
  // console.log(user.confirmed)
})
app.get("/ForgotPassword", (req, res) => {
  res.render('ForgotPassword')
})

app.get("/contact", (req, res) => {
  res.render('contact')
})
app.get("/about", (req, res) => {
  res.render('about')
})

app.get("/service", (req, res) => {
  res.render('service')
})

app.get("/book_slot", auth_patient, (req, res) => {
  res.render('book_slot', { user: req.user })
})
app.get("/receptionist_book_app", auth_recep, (req, res) => {
  res.render('receptionist_book_app', { user: req.user })
})

app.get("/login", auth_login, (req, res) => {
  res.render('Login_new')
})

app.get("/index", (req, res) => {
  res.render('index')
})
app.get("/patient_profile", auth_patient, async (req, res) => {
  const token = req.cookies.jwt;
  const verifyUser = jwt.verify(token, process.env.SECRET_KEY)
  // console.log(verifyUser)
  const user = await Patient.findOne({ _id: verifyUser._id })
  console.log(user.Name)
  res.render("patient_profile", { user })
})

app.get("/Bill", auth_recep, (req, res) => {
  res.render("Bill",)
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


    // Redirect to another page (optional)
    res.redirect('/index');


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


app.post("/recep_register", async (req, res) => {
  try {



    if (!(validator.validate(req.body.Email))) {
      return res.status(400).send('<script>alert("Please enter a valid email adress"); window.location = "/recep_register";</script>');
      // res.render('register')
    }

    const phoneNumber = req.body.Phone; // Assuming 'phone' is the field name in your form

    // Use a regular expression to validate the phone number format
    const phoneNumberRegex = /^\d{10}$/; // This regex assumes a 10-digit phone number

    if (!phoneNumberRegex.test(phoneNumber)) {
      return res.status(400).send('<script>alert("Invalid phone number format. Please enter a 10-digit number.");window.location = "/recep_register";</script>');
    }
    // const strongPasswordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    // const password  = req.body.password;
    // if (!strongPasswordRegex.test(password)) {
    //   return res.status(400).json({
    //     error: 'Password does not meet the strength requirements',
    //     requirements: {
    //       length: 'At least 8 characters',
    //       uppercase: 'At least one uppercase letter',
    //       lowercase: 'At least one lowercase letter',
    //       digit: 'At least one digit',
    //       specialChar: 'At least one special character (@$!%*?&)',
    //     },
    //   });
    // }


    const existingUser = await Patient.findOne({ Email: req.body.Email, confirmed: "True" });

    if (existingUser) {
      // If a user with the same email exists, display an error message
      return res.status(400).send('<script>alert("This Email address already exists"); window.location = "/recep_register";</script>');
    }
    if (req.body.password == req.body.confirmPassword) {

      const uid = new ShortUniqueId();
      const uidWithTimestamp = uid.stamp(10);
      //  console.log(uidWithTimestamp);
      const registeredPatient = new Patient({
        Name: req.body.Name,
        Email: req.body.Email,
        Phone: req.body.Phone,
        Password: req.body.password,
        BirthDate: req.body.birthdate,
        AddressLine1: req.body.AddressLine1,
        AddressLine2: req.body.AddressLine2,
        AddressPostalCode: req.body.AddressPostalCode,
        Gender: req.body.Gender,
        BloodGroup: req.body.blood_group,
        Role: "Patient",
        ID: uidWithTimestamp,
        confirmed: "False"
      })

      // console.log(req.body.password);
      const token = await registeredPatient.generateAuthToken();

      //res.cookie("jwt", token, { expires: new Date(Date.now() + 300000), httponly: true })
      ///console.log(cookie) --> Ye karna ho to chatgpt kar lo
      try {
        await registeredPatient.save();

        const email = req.body.Email
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
              to: req.body.Email,
              subject: 'Email Confirmation',
              text: `http://localhost:3000/confirm-email/${user._id}/${token}`
            };

            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
                res.status(400).send('<script>alert("Email has sent for confirmation.Click the link for confirmation"); window.location = "/recep_register";</script>');

              }
            });
          })


      }
      catch (err) {
        console.log(err);
      }
      //const finalNakho = await registeredPatient.save();
      //    res.status(400).send('<script>alert("Registered successfully"); window.location = "/"</script>');
      //res.status(201).render('login')
    }
    else {
      //res.send("<h1> Passwords are not matching </h1>")
      res.status(400).send('<script>alert("Passwords do not match. Please try again."); window.location = "/recep_register";</script>');

    }


  } catch (err) {
    res.status(400).send(err)
  }
})
app.post("/deleteAppointment", async (req, res) => {

  const token = req.cookies.jwt;
  const verifyUser = jwt.verify(token, process.env.SECRET_KEY)
  // console.log(verifyUser)
  const user = await Patient.findOne({ _id: verifyUser._id })

  const id = user.ID;

  const result = await Appointment.deleteOne({
    Doctor: req.body.doctor,
    ID: id,
    AppointmentDate: req.body.appointmentDate,
    AppointmentTime: req.body.appointmentTime,
  });
  res.status(400).send('<script>alert("Deleted successfully."); window.location = "/view_appointment";</script>')

})

app.post("/approve", async (req, res) => {
  let leavesForEmployee = await Leave.findOne({ ID: req.body.ID, StartDate: req.body.StartDate, EndDate: req.body.EndDate, Approve: "Pending" });
  leavesForEmployee.Approve = "Approved";

  leavesForEmployee.save();

  //console.log(leavesForEmployee)
  res.redirect('admin_all_leaves')


})

app.post("/disapprove", async (req, res) => {
  let leavesForEmployee = await Leave.findOne({ ID: req.body.ID, StartDate: req.body.StartDate, EndDate: req.body.EndDate, Approve: "Pending" });
  leavesForEmployee.Approve = "Disapproved";

  leavesForEmployee.save();

  res.redirect('admin_all_leaves')


})
app.post("/rece_deleteAppointment", async (req, res) => {


  const result = await Appointment.deleteOne({
    Doctor: req.body.doctor,
    ID: req.body.ID,
    AppointmentDate: req.body.appointmentDate,
    AppointmentTime: req.body.appointmentTime,
  });
  res.status(400).send('<script>alert("Deleted successfully."); window.location = "/recep_view_edit_appointment";</script>')

})
app.post("/ForgotPassword", (req, res) => {
  const email = req.body.email
  Patient.findOne({ Email: email, confirmed: "True" })
    .then(user => {
      if (!user) {
        res.status(400).send('<script>alert("User not exists"); window.location = "/ForgotPassword";</script>');
        return
      }
      console.log(user.Email)
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
      return res.status(400).send('<script>alert("Please enter a valid email adress"); window.location = "/Register_new";</script>');
      // res.render('register')
    }

    const phoneNumber = req.body.Phone; // Assuming 'phone' is the field name in your form

    // Use a regular expression to validate the phone number format
    const phoneNumberRegex = /^\d{10}$/; // This regex assumes a 10-digit phone number

    if (!phoneNumberRegex.test(phoneNumber)) {
      return res.status(400).send('<script>alert("Invalid phone number format. Please enter a 10-digit number.");window.location = "/Register_new";</script>');
    }
    // const strongPasswordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    // const password  = req.body.password;
    // if (!strongPasswordRegex.test(password)) {
    //   return res.status(400).json({
    //     error: 'Password does not meet the strength requirements',
    //     requirements: {
    //       length: 'At least 8 characters',
    //       uppercase: 'At least one uppercase letter',
    //       lowercase: 'At least one lowercase letter',
    //       digit: 'At least one digit',
    //       specialChar: 'At least one special character (@$!%*?&)',
    //     },
    //   });
    // }


    const existingUser = await Patient.findOne({ Email: req.body.Email, confirmed: "True" });

    if (existingUser) {
      // If a user with the same email exists, display an error message
      return res.status(400).send('<script>alert("This Email address already exists"); window.location = "/Register_new";</script>');
    }
    if (req.body.password == req.body.confirmPassword) {

      const uid = new ShortUniqueId();
      const uidWithTimestamp = uid.stamp(10);
      //  console.log(uidWithTimestamp);
      const registeredPatient = new Patient({
        Name: req.body.Name,
        Email: req.body.Email,
        Phone: req.body.Phone,
        Password: req.body.password,
        BirthDate: req.body.birthdate,
        AddressLine1: req.body.AddressLine1,
        AddressLine2: req.body.AddressLine2,
        AddressPostalCode: req.body.AddressPostalCode,
        Gender: req.body.Gender,
        BloodGroup: req.body.blood_group,
        Role: "Patient",
        ID: uidWithTimestamp,
        confirmed: "False"
      })

      // console.log(req.body.password);
      const token = await registeredPatient.generateAuthToken();

      //res.cookie("jwt", token, { expires: new Date(Date.now() + 300000), httponly: true })
      ///console.log(cookie) --> Ye karna ho to chatgpt kar lo
      try {
        await registeredPatient.save();

        const email = req.body.Email
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
              to: req.body.Email,
              subject: 'Email Confirmation',
              text: `http://localhost:3000/confirm-email/${user._id}/${token}`
            };

            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
                res.status(400).send('<script>alert("Email has sent for confirmation.Click the link for confirmation"); window.location = "/login";</script>');

              }
            });
          })


      }
      catch (err) {
        console.log(err);
      }
      //const finalNakho = await registeredPatient.save();
      //    res.status(400).send('<script>alert("Registered successfully"); window.location = "/"</script>');
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

app.post("/login", auth_login, async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const useremail = await Patient.findOne({ Email: email, confirmed: "True" })
    if (!useremail) {
      // User with the specified email was not found
      return res.status(400).send('<script>alert("Invalid login details."); window.location = "/login";</script>');
    }
    const isMatch = await bcrypt.compare(password, useremail.Password)


    //console.log(token)

    if (isMatch) {

      const isMatch = await bcrypt.compare(password, useremail.Password)
      const token = await useremail.generateAuthToken();
      res.cookie("jwt", token, { expires: new Date(Date.now() + 30000000), httponly: true })

      if (useremail.Role == "Admin") {
        res.redirect('admin_home');
      }

      else if (useremail.Role == "Doctor") {
        res.redirect('new_doc_home')
        // res.render('new_doc_home')
      }
      else if (useremail.Role == "Receptionist")
        res.redirect('receptionist_base')
      else
        res.redirect('patient_home')
      //  console.log(`this is cookie ${req.cookies.jwt}`);
    }
    else {
      console.log('ok')
      res.status(400).send('<script>alert("Invalid login details"); window.location = "/login";</script>');
    }

  }
  catch (err) {
    res.status(400).send('<script>alert("Invalid login details"); window.location = "/login";</script>');
    console.log(err)
  }
})

app.post("/appointment", async (req, res) => {

  const doctor = req.body.doctor;
  const date = req.body.date;
  const existingAppointments = await Appointment.find({ Doctor: doctor, AppointmentDate: date });
  const allSlots = ['9:00-9:30 AM', '9:30-10:00 AM', '10:00-10:30 AM', '10:30-11:00 AM', '11:00-11:30 AM', '11:30-12:00 AM',
    '3:00-3:30 PM', '3:30-4:00 PM', '4:00-4:30 PM', '4:30-5:00 PM', '5:00-5:30 PM', '5:30-6:00 PM'];

  const slotCounts = {};
  existingAppointments.forEach(appointment => {
    const slot = appointment.AppointmentTime;
    slotCounts[slot] = (slotCounts[slot] || 0) + 1;
  });

  const availableSlots = allSlots.filter(slot => {
    return (slotCounts[slot] || 0) < 5;
  });

  // console.log(availableSlots.length)
  if (!(availableSlots.includes(req.body.time))) {
    res.status(400).send('<script>alert("This slot is not available"); window.location = "/patient_appointment"</script>');
  }
  else {
    const newAppointment = new Appointment({
      Doctor: req.body.doctor,
      Patient: req.body.name,
      AppointmentDate: req.body.date,
      ID: req.body.ID,
      AppointmentTime: req.body.time,
      Visited: "False"
    })

    try {
      await newAppointment.save();
    }
    catch (err) {
      console.log(err);
    }

    res.status(400).send('<script>alert("Booked successfully"); window.location = "/patient_appointment"</script>');
  }




})

app.post("/recep_appointment", async (req, res) => {

  const doctor = req.body.doctor;
  const date = req.body.date;
  const existingAppointments = await Appointment.find({ Doctor: doctor, AppointmentDate: date });
  const allSlots = ['9:00-9:30 AM', '9:30-10:00 AM', '10:00-10:30 AM', '10:30-11:00 AM', '11:00-11:30 AM', '11:30-12:00 AM',
    '3:00-3:30 PM', '3:30-4:00 PM', '4:00-4:30 PM', '4:30-5:00 PM', '5:00-5:30 PM', '5:30-6:00 PM'];

  const slotCounts = {};
  existingAppointments.forEach(appointment => {
    const slot = appointment.AppointmentTime;
    slotCounts[slot] = (slotCounts[slot] || 0) + 1;
  });

  const availableSlots = allSlots.filter(slot => {
    return (slotCounts[slot] || 0) < 5;
  });

  // console.log(availableSlots.length)
  if (!(availableSlots.includes(req.body.time))) {
    res.status(400).send('<script>alert("This slot is not available"); window.location = "/receptionist_book_app"</script>');
  }




  else {

    const newAppointment = new Appointment({
      Doctor: req.body.doctor,
      Patient: req.body.name,
      AppointmentDate: req.body.date,
      ID: req.body.ID,
      AppointmentTime: req.body.time,
      Visited: "False"
    })

    try {
      await newAppointment.save();
    }
    catch (err) {
      console.log(err);
    }

    res.status(400).send('<script>alert("Booked successfully"); window.location = "/receptionist_book_app"</script>');
  }

})


app.post('/submitPrescription', async (req, res) => {
  const {
    ID,
    Doctor,
    AppointmentDate,
    Symptoms,
    Diagnoses,
    Medicines,
    Dos,
    NotDos,
    Investigations,
    FollowUpDate
  } = req.body;
  console.log(req.body.ID);
  console.log(req.body.Diagnoses);
  const symptomsArray = Symptoms.split(',').map(symptom => ({ Symptom: symptom.trim() }));
  const diagnosesArray = Diagnoses.split(',').map(diagnosis => ({ Diagnosis: diagnosis.trim() }));
  const medicinesArray = Medicines.split(',').map(medicine => ({ Medicine: medicine.trim() }));
  const dosArray = Dos.split(',').map(doItem => ({ Do: doItem.trim() }));
  const notDosArray = NotDos.split(',').map(notDoItem => ({ NotDo: notDoItem.trim() }));
  const investigationsArray = Investigations.split(',').map(investigation => ({ Investigation: investigation.trim() }));

  try {
    const prescription = new Prescription({
      ID,
      Doctor,
      AppointmentDate,
      Symptoms: symptomsArray,
      Diagnoses: diagnosesArray,
      Medicines: medicinesArray,
      Dos: dosArray,
      NotDos: notDosArray,
      Investigations: investigationsArray,
      FollowUpDate
    });
    // console.log("hi");
    const savedPrescription = await prescription.save();
    res.status(400).send('<script>alert("Done successfully"); window.location = "/new_doc_obs"</script>');
    // res.status(201).json(savedPrescription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/view_prescription", async (req, res) => {


  const token = req.cookies.jwt;
  const verifyUser = jwt.verify(token, process.env.SECRET_KEY)
  // console.log(verifyUser)
  const user = await Patient.findOne({ _id: verifyUser._id })

  const prescription = await Prescription.findOne({
    ID: req.body.ID,
    AppointmentDate: req.body.appointmentDate,
    Doctor: req.body.doctor
  });

  //.log(prescription.ID)

  res.render('prescription', { prescription, user })
})
app.post("/showslots", async (req, res) => {


  const token = req.cookies.jwt;
  const verifyUser = jwt.verify(token, process.env.SECRET_KEY)
  // console.log(verifyUser)
  const user = await Patient.findOne({ _id: verifyUser._id })
  const date = req.body.date;
  //  date=date.toDateString();
  //  console.log(date);
  const doctor = req.body.doctor;

  const existingAppointments = await Appointment.find({ Doctor: doctor, AppointmentDate: date });
  const allSlots = ['9:00-9:30 AM', '9:30-10:00 AM', '10:00-10:30 AM', '10:30-11:00 AM', '11:00-11:30 AM', '11:30-12:00 AM',
    '3:00-3:30 PM', '3:30-4:00 PM', '4:00-4:30 PM', '4:30-5:00 PM', '5:00-5:30 PM', '5:30-6:00 PM'];

  const slotCounts = {};
  existingAppointments.forEach(appointment => {
    const slot = appointment.AppointmentTime;
    slotCounts[slot] = (slotCounts[slot] || 0) + 1;
  });

  const availableSlots = allSlots.filter(slot => {
    return (slotCounts[slot] || 0) < 5;
  });

  // console.log(availableSlots)
  // console.log(availableSlots.length);
  if (availableSlots.length == 0) {
    res.status(400).send('<script>alert("No Slots are available on this date"); window.location = "/patient_appointment"</script>');
  }
  else {
    res.render('book_slot', { availableSlots, date, doctor, user })
  }

})





app.post("/recep_showslots", async (req, res) => {


  //  date=date.toDateString();
  const token = req.cookies.jwt;
  const verifyUser = jwt.verify(token, process.env.SECRET_KEY)
  // console.log(verifyUser)
  const user = await Patient.findOne({ _id: verifyUser._id })
  //  console.log(date);
  const doctor = req.body.doctor;
  const date = req.body.date;
  const existingAppointments = await Appointment.find({ Doctor: doctor, AppointmentDate: date });
  const allSlots = ['9:00-9:30 AM', '9:30-10:00 AM', '10:00-10:30 AM', '10:30-11:00 AM', '11:00-11:30 AM', '11:30-12:00 AM',
    '3:00-3:30 PM', '3:30-4:00 PM', '4:00-4:30 PM', '4:30-5:00 PM', '5:00-5:30 PM', '5:30-6:00 PM'];

  const slotCounts = {};
  existingAppointments.forEach(appointment => {
    const slot = appointment.AppointmentTime;
    slotCounts[slot] = (slotCounts[slot] || 0) + 1;
  });

  const availableSlots = allSlots.filter(slot => {
    return (slotCounts[slot] || 0) < 5;
  });

  // console.log(availableSlots)
  // console.log(availableSlots.length);
  if (availableSlots.length == 0) {
    res.status(400).send('<script>alert("No Slots are available on this date"); window.location = "/receptionist_book_app"</script>');
  }
  else {
    res.render('recep_book_slot', { availableSlots, date, doctor, user })
  }

})


app.post("/patient_visit", async (req, res) => {
  const filter = {
    Doctor: req.body.doctor,
    AppointmentDate: req.body.date,
    ID: req.body.ID,
    AppointmentTime: req.body.time
  };

  const update = {
    Visited: "True"
  };

  Appointment.updateOne(filter, update)
    .exec()
    .then((result) => {
      console.log(result);
      // Check the result object for information about the update
      if (result.nModified > 0) {
        // console.log("Visited field updated successfully");
      } else {
        console.log("No matching appointment found");
      }
      // Do something else if needed
    })
    .catch((err) => {
      console.error(err);
      // Handle the error, e.g., return an error response
    });



  res.status(400).send('<script>alert("Updated successfully"); window.location = "/patient_visit"</script>');



});

app.post("/doc_pat_vis", async (req, res) => {

  const token = req.cookies.jwt;
  const verifyUser = jwt.verify(token, process.env.SECRET_KEY)
  // console.log(verifyUser)
  const user = await Patient.findOne({ _id: verifyUser._id })
  Appointment.find({ Doctor: req.body.doctorName, AppointmentDate: req.body.appointmentDate })
    .exec()
    .then((appointments) => {
      // Do something with the found appointments
      console.log(appointments);
      res.render('new_doc_visited_pat', { appointments, user })
    })
    .catch((err) => {
      console.error(err);
      // Handle the error, e.g., return an error response
    });
  //const x=req.body.appointmentDate


})

app.post("/admin_all_emp", async (req, res) => {
  // console.log(req.bod y.role)

  const token = req.cookies.jwt;
  const verifyUser = jwt.verify(token, process.env.SECRET_KEY)
  // console.log(verifyUser)
  const user = await Patient.findOne({ _id: verifyUser._id })
  await Patient.find({ Role: req.body.role })
    .exec()
    .then((patients) => {
      // Do something with the found patients
      // console.log(patients);
      res.render('admin_all_admin', { role: req.body.role, patients, user })
    })
    .catch((error) => {
      console.error(error);
      // Handle the error, e.g., return an error response
    });
})

app.post("/admin_view_profile", async (req, res) => {
  const ID = req.body.ID;
  const user = await Patient.findOne({ ID: ID })


  const token = req.cookies.jwt;
  const verifyUser = jwt.verify(token, process.env.SECRET_KEY)
  // console.log(verifyUser)
  const user2 = await Patient.findOne({ _id: verifyUser._id })
  res.render('admin_view_profile', { user, user2 })
})
app.post("/editProfile", async (req, res) => {
  // console.log(req.body.role)


  const token = req.cookies.jwt;
  const verifyUser = jwt.verify(token, process.env.SECRET_KEY)
  // console.log(verifyUser)
  let user = await Patient.findOne({ _id: verifyUser._id })


  const phoneNumber = req.body.Phone; // Assuming 'phone' is the field name in your form

  // Use a regular expression to validate the phone number format
  const phoneNumberRegex = /^\d{10}$/; // This regex assumes a 10-digit phone number

  if (!phoneNumberRegex.test(phoneNumber)) {
    return res.status(400).send('<script>alert("Invalid phone number format. Please enter a 10-digit number.");window.location = "/editProfile";</script>');
  }
  // const strongPasswordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  // const password  = req.body.password;
  // if (!strongPasswordRegex.test(password)) {
  //   return res.status(400).json({
  //     error: 'Password does not meet the strength requirements',
  //     requirements: {
  //       length: 'At least 8 characters',
  //       uppercase: 'At least one uppercase letter',
  //       lowercase: 'At least one lowercase letter',
  //       digit: 'At least one digit',
  //       specialChar: 'At least one special character (@$!%*?&)',
  //     },
  //   });
  // }
  if (req.body.password == req.body.confirmPassword) {


    user.Name = req.body.Name,
      user.Email = user.Email,
      user.Phone = req.body.Phone,
      user.Password = req.body.password,
      user.BirthDate = req.body.birthdate,
      user.AddressLine1 = req.body.AddressLine1,
      user.AddressLine2 = req.body.AddressLine2,
      user.AddressPostalCode = req.body.AddressPostalCode,
      user.Gender = req.body.Gender,
      user.BloodGroup = req.body.blood_group,
      user.Role = "Patient",
      user.ID = user.ID,
      user.confirmed = "True"



    await user.save();
    res.status(400).send('<script>alert("Updated successfully."); window.location = "/editProfile";</script>');
  }

  else {
    res.status(400).send('<script>alert("Passwords do not match. Please try again."); window.location = "/editProfile";</script>');
  }

})

app.post("/viewPatientDetails", async (req, res) => {

  const user = await Patient.findOne({ ID: req.body.ID })

  const token = req.cookies.jwt;
  const verifyUser = jwt.verify(token, process.env.SECRET_KEY)
  // console.log(verifyUser)
  const user2 = await Patient.findOne({ _id: verifyUser._id })
  const prescription = await Prescription.findOne({
    ID: req.body.ID,
    AppointmentDate: req.body.AppointmentDate,
    Doctor: req.body.Doctor
  });
  console.log(prescription.ID)
  res.render('new_doc_patient_det', { user, prescription, user2 })


})


app.post("/recep_view_edit_appointment", async (req, res) => {
  const date = req.body.Date;
  const allAppointmentsForDate = await Appointment.find({ AppointmentDate: date });
  const token = req.cookies.jwt;
  const verifyUser = jwt.verify(token, process.env.SECRET_KEY)
  // console.log(verifyUser)
  const user = await Patient.findOne({ _id: verifyUser._id })

  res.render('recep_view_table', { allAppointmentsForDate, user })
})

app.post("/receptionist_leave", async (req, res) => {

  const token = req.cookies.jwt;
  const verifyUser = jwt.verify(token, process.env.SECRET_KEY)
  // console.log(verifyUser)
  const user = await Patient.findOne({ _id: verifyUser._id })

   if(req.body.endDate>=req.body.startDate) 
   {
    const newLeaveEntry = new Leave({
    Employee: user.Name, // Replace with the actual employee name
    ID: user.ID, // Replace with the actual employee ID
    StartDate: req.body.startDate, // Replace with the actual start date
    EndDate: req.body.endDate, // Replace with the actual end date
    Reason: req.body.reason, // Replace with the actual reason
    Approve: "Pending" // Replace with the initial approval status
  });

  newLeaveEntry.save();
  res.status(400).send('<script>alert("Applied successfully."); window.location = "/receptionist_leave";</script>');
}
else
{
  res.status(400).send('<script>alert("Please Enter Valid Date."); window.location = "/receptionist_leave";</script>');
}})


app.listen(port, () => {
  console.log(`Listening to port number ${port}`)
})
