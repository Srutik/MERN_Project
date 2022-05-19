const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const employeeSchema = new mongoose.Schema({
    firstname : {
        type:String,
        required:true,
        trim:true
    },
    email : {
        type:String,
        required:true,
        unique:true
    },
    password : {
        type:String,
        required:true,
    },
    cpassword : {
        type:String,
        required:true,
    },
    tokens: [{
        token:{
            type:String,
            required:true,  
        }
    }]
});

employeeSchema.methods.generateAuthToken = async function() {
    try {
        const token = jwt.sign({_id:this._id.toString()} , process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token;
    }
    catch(error) {
        res.send(`the error part` + error);
        console.log(`the error part` + error);
    }
}

employeeSchema.pre('save' , async function(next) {
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password , 10);
        this.cpassword = await bcrypt.hash(this.cpassword , 10);
    }
    next();
});

const Register = new mongoose.model("Register" , employeeSchema);

module.exports = Register;