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
    }
});

User.plugin(require('mongoose-bcrypt'));

module.exports = new Schema('users', User);