const express = require('express');
const bodyParser = require('body-parser');
const user = require('./routes/user');
const initiateMongo = require('./config/database');
const User = require("./model/user");
const emp = require('./routes/emp');

initiateMongo(); //starting mongo server

const app = express();

const port = process.env.PORT || 8083; //port

app.use(bodyParser.json());


// welcome message for user portal

app.get("/", (req, res) => {
    res.json({ message: "Welcome to user portal! keep coding and love nature!" });
});

// welcome page for employee protal

app.get("/emp", (req, res) => {
    res.json({ message: "welcome to employee portal! keep loving nature!" });
});

app.use("/user", user);

app.use("/emp", emp);

app.listen(port, (req, res) => {
    console.log("server is listing to " + port);

});