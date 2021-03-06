//userSchema for user input - firstname, lastname, email, password, unique id and organisation name
const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    firstName:{
        type : String,
        required : true
    },
    lastName:{
        type:String,
        required : true
    },
    email : {
        type:String,
        required:true
    },
    password : {
        type: String,
        required :true
    },
    uniqueId : {
        type : String,
        required : true
    },
    organisationName : {
        type:String,
        required :true
    },
    createdAt: {
        type : Date,
        default : Date.now()
    }
});

module.exports = mongoose.model("user",userSchema); //export model with userSchema