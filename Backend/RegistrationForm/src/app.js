const express = require ('express')
const path = require ('path')
const app= new express()
const hbs= require ('hbs')

require("./db/conn")
const Patient=require("./models/register")
const { error } = require('console')
const port = process.env.PORT || 3000

const template_Path =path.join(__dirname,"../templates/views")
const partial_Path =path.join(__dirname,"../templates/partials")

app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.set("views",template_Path)
hbs.registerPartials(partial_Path)
app.set("view engine","hbs")


app.get("/",(req,res)=>{
    res.render("index")
})

app.post("/register",async (req,res)=>{
    try{
         const nakho = new Patient({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
         })

         const finalNakho =await nakho.save();
         res.status(201).render(index)
         //console.log("hi")
        // res.send("Kam puru")
    }catch(err){
        res.status(400).send(err)
    }
})

app.listen(port,()=>{
    console.log(`Listening to port number ${port}`)
})
