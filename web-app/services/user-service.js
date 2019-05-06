var mongoose = require('mongoose');
var User = require('../models/User');
var userService = {};

userService.login = function(data, callback){
    User.findOne({username: data.username}, function(err,user){
        if(err){
            callback(err,null);
        }else{
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
    });
}

userService.register = function(data, callback){

}

module.exports = userService;

