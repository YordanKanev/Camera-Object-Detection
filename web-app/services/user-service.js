'use strict';
var mongoose = require('mongoose');
var User = require('../models/User');
var userService = {};

userService.login = function(data, callback){
    User.findOne({username: data.username}, function(err,user){
        if(err){
            callback(err,null);
        }else{
            if(user){
                user.verifyPassword(data.password, function(err,valid){
                    if(err){
                        callback(err,null);
                    }else if(valid){
                        callback(null,user);
                    }else{
                        callback({message: "invalid password"},null);
                    }
                });
            }
            else{
                callback(null,null);
            }
        }
    });
}

userService.register = function(data, callback){
    var user = new User(data);
    user.save(function(err){
        if(err){
            console.log("Error");
            callback(err, null);
        }else{
            callback(null, user);
        }
    });
}

module.exports = userService;

