var mongoose = require('mongoose');
var Device = require('../models/Device');
var deviceService = {};

deviceService.getDevices = function(data, callback){
    Device.find({ownerId: data.email}, function(err, devices){
        callback(err,devices);
    });
}

deviceService.addDevices = function(data, callback){
    Device.findOne({deviceId: data.deviceId}, function(err, device){
        if(err){
            callback(err,null);
            return;
        }else{
            if(device){
                device.verifyPassword(data.password, function(err, valid){
                    if(err){
                        callback(err,null);
                        return;
                    }else if(valid){
                        Device.findOneAndUpdate({deviceId: device.deviceId}, {$set: {ownerId: data.email, name: data.name}},{new: true}, function(err,suc){
                            callback(err,suc);
                            return;
                        });
                    }else{
                        callback({message: "Invalid"},null);
                        return;
                    }
                });
            }else{
                callback(null,null);
                return;
            }
        }
    });
}

module.exports = deviceService;