const express = require("express");
const router = express.Router();

var cookieParser = require('cookie-parser');

var User = require('../models/user');



router.get('/', function(req, res){
    console.log(req.cookies);
    if(req.cookies["login_id"]){
        res.render('final');
    }
    else{
        res.render('login');
    }
});

/*router.get('/communities', function(req, res){
    res.render('communities');
});*/

router.get('/final', function(req, res){
    console.log(req.cookies["login_id"]);
    if(req.cookies["login_id"]) {
        res.render('final');
    }
    else{
        res.render('login');
    }
});

router.get('/logOut', function(req, res){
    res.clearCookie('login_id', {path: '/'}).status(200).send('Ok.');


});



router.get('/getUserInfo', function(req, res){
    var id = req.cookies.login_id.split(',')[0];
    User.find({user_id: id}).exec(function(err, docs){
      if(err){
          res.send("Couldn't fetch user");
      }
      else{
          res.send(docs);
      }
    });
});



module.exports = router;

