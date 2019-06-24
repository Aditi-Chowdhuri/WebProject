var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserProfile = new Schema({
    user_id: {type: String, lowercase: true, required: true, unique: true},
    user_pass: {type: String, required: true},
    first_name: {type: String, required: true},
    middle_name: {type: String},
    last_name: {type: String, required: true},
    mobile: {type: Number, required: true, unique: true},
    email: {type: String, lowercase: true, required: true, unique: true},
    dob: {type: String, required: true}
});

module.exports = mongoose.model('User', UserProfile);
