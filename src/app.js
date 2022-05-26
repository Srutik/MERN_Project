require('dotenv').config();
const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");
require("./db/conn");

const Register = require("./models/registers");

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

// console.log(process.env.SECRET_KEY);

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/secret", auth, (req, res) => {
    // console.log(`this is the cookie ${req.cookies.jwt}`)
    res.render("secret");
});

app.get("/logout", auth, async (req, res) => {
    try {


        // For single logout.
        // req.user.tokens = req.user.tokens.filter((currentElement) => {
        //     return currentElement.token != req.token
        // })

        // logout from all devices.
        req.user.tokens = [];
        
        res.clearCookie("jwt");
        console.log("logout sucessfull");

        await req.user.save();
        res.render("login");
    } catch (error) {
        res.status(401).send(error);
    }
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", async (req, res) => {
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

            // res.cookie("jwt", token , {
            //     expires: new Date(Date.now() + 60000),
            //     httpOnly: true,
            //     // secure:true
            // });
            // console.log(cookie);

            const registered = await registerEmployee.save();
            res.status(201).render("home");
        }
        else {
            res.send("Invalid password.");
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

        const userEmail = await Register.findOne({ email:email });

        const isMatch = await bcrypt.compare(password, userEmail.password);

        const token = await userEmail.generateAuthToken();
        console.log("the token part : " + token);       

        res.cookie("jwt", token , {
            expires: new Date(Date.now() + 60000),
            httpOnly: true,
            secure:true
        });

        if (isMatch) {
            res.status(201).render("home")
        } else {
            res.send("Invalid login Details.")
        }
    } catch (error) {
        res.status(400).send("Invalid login Details.")
    }
});

app.listen(port, (req, res) => {
    console.log(`server is running at port no ${port}`);
});