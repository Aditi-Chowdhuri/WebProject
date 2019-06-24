//Server.js

var express = require('express');
var cookieParser = require('cookie-parser');
var port = process.env.PORT || 8080;
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var path = require('path');
var getRoutes = require('./app/routes/getRoutes');
var postRoutes = require('./app/routes/postRoutes');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(getRoutes);
app.use(postRoutes);

mongoose.connect('mongodb://localhost:27017/UserProfile', function(err){
    if(err){
        console.log("Database not connected: "+ err);
    }
    else{
        console.log("Successfully connected to the database");
    }
});


app.listen(port, function(){
    console.log("Server is running on port : " + port);
});