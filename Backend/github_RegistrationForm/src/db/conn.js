const mongoose = require('mongoose')
mongoose.connect("contact dipak478", { useNewUrlParser: true }, { useUnifiedTopology: true }, { useCreateIndex: true })
    .then(() => { console.log("connection success") })
    .catch((err) => { console.log(err) })
