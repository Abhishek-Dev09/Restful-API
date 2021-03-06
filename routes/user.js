// user API endpoints with jwt authentication

const express = require("express");
const { check, validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require('../middleware/auth');

const User = require("../model/user");

//registration router for users
//method - Post

router.post("/register", [
    check("firstName", "it's mandatory").not().isEmpty(),       //validating name
    check("lastName", "it's mandatory").not().isEmpty(),        //validating name
    check("email", "enter valid mail").isEmail(),               //validating emailId
    check("password", "it's too short").isLength({ min: 5 }),   //validating password
    check("uniqueId", "it's mandatory").not().isEmpty(),        //validating uniqueId
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });  //will respond an array of error messages is valid details are not entered
        }
        const { firstName, lastName, email, password, uniqueId, organisationName } = req.body;
        try {
            let user = await User.findOne({ email });               //searching database to check similar emailId in db
            if (user)
            {
                return res.status(400).json({ message: "opps! you have already registerd" });
            }
            user = new User({ firstName, lastName, email, password, uniqueId, organisationName });

            const salt = await bcrypt.genSalt(10);                 //encrypting password with cost factor 10
            user.password = await bcrypt.hash(password, salt);     //storing hash password in db

            await user.save();
            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(
                payload, "randomString", //first parameter is payload id as a string, second parameter: secret key"randomString" 
                { expiresIn: 20000 },      //time in which jwt token will expires which is 20 sec(20000 milliseconds)
                (err, token) => {
                    if (err) throw err;
                     res.status(200).json({token,message:"Bingo ! you have sucessfully resisterd"});
                }
            );
        }
         catch (err) 
        {
            console.log(err.message);
            res.status(500).send("oops! something went worng");
        }
    }
);



//login router for users
//mmethod - Post

router.post("/login", [
    check("email", "invalid email").isEmail(),                  //validating emailId 
    check("password", "enter pasword").isLength({ min: 5 })],   //validating proper password

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });      //sending error response after submitting invalid credentials
        }

        const { email, password } = req.body;
        try {
            let user = await User.findOne({ email });                     //searching submitted email 
                if (!user)
                return res.status(400).json({ message: "oops! user does not exist " });

            const isMatch = await bcrypt.compare(password, user.password); //comparing entered password with stored hashed password
                if (!isMatch)
                return res.status(400).json({ message: " oops! incorrect password!" });

            const payload = {
                user: { id: user.id }
            };

            jwt.sign(payload, "randomString", { expiresIn: 10000 },
                (err, token) => {
                if (err) throw err;
                res.status(200).json({ token , message:"copy the above token and add to the header while geting your profile"});             //sending jwt token 
                });
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ message: "oops! something went worng" });
        }
    })

// router for profile (users)
//method -Get

router.get("/yourprofile", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id); //user is fetched from middleware after jwt authentication
        res.json(user);
    } 
    catch (err) {
        res.send({ message: "oops! something went worng" });
    }
});


module.exports = router;
