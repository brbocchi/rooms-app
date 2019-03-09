const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: String,
    password: String,
    fullName: String,
    imageUrl: String,
    facebookID: String,
    googleID: String,
    status: {type: String, enum: ['Pending Confirmation', 'Active'], default: 'Pending Confirmation'},
    confirmationCode: String
}, {
        timestamps: true
    });

module.exports = mongoose.model('User', userSchema);
