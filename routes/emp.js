// Endpoints for employee registration, signing in, and to get list of all registerd usrs with filtration,sorting and pagination by emploee

const express = require("express");
const {check, validationResult} = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require('../middleware/auth');
const User = require("../model/user");
const Emp = require("../model/emp");

//enpoint for employee registration
//method - Post

router.post("/register",[
    check("empName","it's mandatory").not().isEmpty(),            //validating employee name
    check("password", "it's too short").isLength({min:5}),        //validating entered password
    check ("uniqueofficialId","it's mandatory").not().isEmpty()   //validating official Id
],
async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors:errors.array()}); 
    }
    const {empName,password,uniqueofficialId} = req.body;
    try{
        let emp = await Emp.findOne({uniqueofficialId}) ; //checking for any same official Id
        if(emp)
        {
            return res.status(400).json({ message:"oops! you are an existing employee.Please contact admin for credentials"});
        }

        emp = new Emp({empName,password,uniqueofficialId}); 

        const salt = await bcrypt.genSalt(10);            //encrypting password with cost factor 10
        emp.password = await bcrypt.hash(password,salt);  //storing hash password in db

        await emp.save();
        const payload = {
            emp: {id:emp.id}
        };

        jwt.sign(
            payload,"randomString",{expiresIn:20000}, //first parameter is payload id as a string, second parameter: secret key"randomString",third-expiry time for token
            (err, token) => {
                if(err) 
                throw err;
                res.status(200).json({token, message : "sucessfully registerd"});
            }
        );
    }
    catch(err)
    {
        console.log(err.message);
        res.status(500).send("oops! something went worng");
    }
});


//login for employee 
//method - Post

router.post("/login",[
    check("uniqueofficialId", "enter id").not().isEmpty(),      //validating entered official Id
    check("password","enter pasword").isLength({min:5})],       //validating entered password
async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors : errors.array()});
    }
    const {uniqueofficialId,password} = req.body;
try{
    let emp = await Emp.findOne({uniqueofficialId});            //searching entered officialId
    
    if(!emp)
    return res.status(400).json({message: "oops! employee does not exist"});

    const isMatch = await bcrypt.compare(password,emp.password);   //comparing entered password with hashed password
    
    if(!isMatch)
    return res.status(400).json({message: " oops! incorrect password!"});

    const payload = {emp: {id: emp.id}};

    jwt.sign(payload,"randomString",{expiresIn : 10000 },(err,token)=>{
        if(err) throw err;
        res.status(200).json({message:"verify the generated token to see user profile",token});  //responding with jwt token upon sucessful 
    });
}
catch(err){
    console.log(err);
    res.status(500).json({message :"oops! something went worng"});
}
});
 
//endpoint to get user details upon sucessfull token verification
//options for searching, sorting pagination
//methos-Get

router.get("/userList", auth ,async(req,res)=>{
    
        try {
            const searchFname = req.query.fname;     //getting first name 
            const searchLName = req.query.lname;     //getting last name
            const searchEid = req.query.empid;       //getting employee Id or unique Id
            const sorting = req.query.sortBy;        //getiing details for sorting by ascending or descening order
            const page = parseInt(req.query.page);   //getting page for pagination 
            const limit = parseInt(req.query.limit); //getting page limit for pagination  i.e result per page
    
    
            if (searchFname) 
            {
                const userD = await User.find({ firstName: { $regex: searchFname, $options: '$i' } });
                res.json(userD); // responding searched result by first name
            }

            else

            if (searchEid) 
            {
                const userD = await User.find({ uniqueId: { $regex: searchEid, $options: '$i' } });
                res.json(userD); // responding searched result by employeeId
            }

            else

            if (searchLName) 
            {
                const userD = await User.find({ lastName: { $regex: searchLName, $options: '$i' } });
                res.json(userD); // responding searched result by last name
            }
            
            else
    
            if (sorting) 
            {
                const str = sorting.split(':');  //getting array of string which contains sortBy and OrderBy
                let order = '';
                    if (str[1] == "asc") 
                    {
                        order = 1;               //1 refers to ascending order
                    } 

                    else 

                    if(str[1]=='dsc')
                    {
                        order = -1               //-1 referes to descending order
                    }

                    else 
                    {
                        res.send({message:"oops!please enter orderBy"});
                    }
    
                    if (str[0] == 'firstName')    //sorting by firstname
                    {
                        const dosort = { firstName: order };
                        const userD = await User.find({}).sort(dosort); 
                        res.json(userD);
                    }

                    else

                    if (str[0] == 'lastName')      //sorting by lastname
                    {
                        const dosort = { lastName: order };
                        const userD = await User.find({}).sort(dosort);
                        res.json(userD);
                    }
                          
                    else
                                
                    if (str[0] == 'emailId')       //sorting by emailId
                    {
                        const dosort = { email: order };
                        const userD = await User.find({}).sort(dosort);
                        res.json(userD);
                    }
                            
                    else

                    if (str[0] == 'employeeId')     //sorting by employee Id
                    {
                        const dosort = { uniqueId: order };
                        const userD = await User.find({}).sort(dosort);
                        res.json(userD);
                    }

                    else

                    if (str[0] == 'orgName')      //sorting by organisation name
                    {
                        const dosort = { organisationName: order };
                        const userD = await User.find({}).sort(dosort);
                        res.json(userD);
                    }

                    else
                        
                    {
                        res.send({message:"oops! user not found"});
                    }
            }
                        
            else
                
            if (page && limit)  //pagination
            {
                const userD = await User.find().limit(limit * 1) .skip((page - 1) * limit).exec();
                const count = await User.countDocuments();                                        // counting total number of users found
                res.json({ userD, totalPages: Math.ceil(count / limit), currentPage: page });     //responding userlist as per limit and pages set by us 
            }
    
            else 
            
            {
                const userD = await User.find({}); // if query will be null then it will respond list of all user 
                res.json(userD);
            }
    
        }
        catch (err) {
            res.send({ message: "oops! something went worng" });
        }  
});
module.exports = router;