const mongoose = require('mongoose')
mongoose.connect("mongodb+srv://dipakbaghel82:iUUSrJguWfWEFqab@cluster0.i31dsqp.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true }, { useUnifiedTopology: true }, { useCreateIndex: true })
    .then(() => { console.log("connection success") })
    .catch((err) => { console.log(err) })