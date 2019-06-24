const express = require("express");
const router = express.Router();
var cookieParser = require('cookie-parser');

var User = require('../models/user');


router.post("/signup", function (req, res) {
    var {user_id, user_pass, email, first_name, middle_name, last_name, mobile, dob} = req.body;
    var user = {
        user_id, user_pass, email, first_name, middle_name, last_name, mobile, dob
    };
    console.log(user);
    new User(user).save((err, docs) => {
        if (err) {
            res.send("User already exists");
            console.log(err);
            console.log(docs);
        }
        else {
            res.send("User created!");
        }
    })
});

router.post('/login', function (req, res) {
    var {user_id, user_pass} = req.body;
    console.log("\n\n" + user_id + "\n\n");
    User.find({user_id: user_id}).exec(function(err, docs){
        // res.send("err: \n" + err + "\n\n" + "docs: \n" + docs);
        console.log(req.body);
        console.log(docs);
        console.log(docs[0].user_pass);
        console.log(user_pass);
        if(err){
            res.send("Some error occurred");
            console.log(err);
        }
        else if(docs.length===0){
            res.send("User not found");
        }
        else{
            if(docs[0].user_pass == user_pass) {
                console.log(docs);
                res.cookie("login_id", user_id + "," + user_pass + "," + docs[0]._id).send("Ok");
            }
            else if(docs[0].user_pass != user_pass){
                res.send("Invalid Password")
            }
            }
    });

});


module.exports = router;

