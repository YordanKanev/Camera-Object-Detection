var mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Device = new Schema({
    deviceId: String,
    ownerId: String,
    name: String,
    password: String
});

Device.plugin(require('mongoose-bcrypt'));

Device.methods.toJSON = function () {
    var device = this.toObject();
    delete device.password;
    return device;
  }

module.exports = mongoose.model('devices', Device);