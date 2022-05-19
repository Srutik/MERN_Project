require('dotenv').config();
const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
require("./db/conn");

const Register = require("./models/registers");

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

// console.log(process.env.SECRET_KEY);

app.get("/", (req , res) => {
    res.render("home");
});

app.get("/register", (req , res) => {
    res.render("register");
});

app.post("/register", async (req , res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.cpassword;
        // const email = req.body.email;
        // const userEmail = await Register.findOne({ email: email });

        if (password === cpassword) {
            const registerEmployee = new Register({
                firstname: req.body.firstname,
                email: req.body.email,
                password: req.body.password,
                cpassword: req.body.cpassword
            })

            console.log("the sucess part : " + registerEmployee);

            const token = await registerEmployee.generateAuthToken();
            console.log("the token part : " + token);

            res.cookie("jwt" , token , {
                expires:new Date(Dsate.now() + 50000),
                httpOnly:true
            });

            console.log(cookie);

            const registered = await registerEmployee.save();
            res.status(201).render("home");
        }
        else {
            res.send("Invalid password.")
        }
    } catch (error) {
        res.status(400).send(error);
    }
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userEmail = await Register.findOne({ email: email });

        const isMatch = await bcrypt.compare(password , userEmail.password);

        const token = await userEmail.generateAuthToken();
        console.log("the token part : " + token);

        if(isMatch) {
            res.status(201).render("home")
        }else {
            res.send("Invalid login Details.")
        }
    } catch (error) {
        res.status(400).send("Invalid login Details.")
    }
});

app.listen(port, (req, res) => {
    console.log(`server is running at port no ${port}`);
});