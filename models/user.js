const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Project = require("../models/project");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);