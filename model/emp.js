//employeeSchema for employee's detail - employee name, password and a unique official id
const mongoose = require("mongoose");

const empSchema = mongoose.Schema({
    empName:{
        type : String,
        required : true
    },
    
    password : {
        type: String,
        required :true
    },
    uniqueofficialId : {
        type : String,
        required : true
    },
    createdAt: {
        type : Date,
        default : Date.now()
    }
});

module.exports = mongoose.model("emp",empSchema); //export model with empSchema