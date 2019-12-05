const mongoose = require("mongoose");
const User = require("../models/user");

var projectSchema = new mongoose.Schema({
    title: String,
    creator: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    summary: String,
    users: [String],    
    text: [String],
    tabCount: Number
});

module.exports = mongoose.model("Project", projectSchema);