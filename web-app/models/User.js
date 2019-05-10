'use strict';
var mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }

});

User.plugin(require('mongoose-bcrypt'));

User.methods.toJSON = function () {
    var user = this.toObject();
    delete user.password;
    return user;
  }

module.exports =  mongoose.model('users', User);