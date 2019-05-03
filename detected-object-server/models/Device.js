import mongoose from "mongoose";
const Schema = mongoose.Schema;

const Device = new Schema({
    deviceId: String,
    ownerId: String
});

module.exports = mongoose.model('devices', Device);