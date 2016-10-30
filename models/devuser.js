var mongoose = require("mongoose");

var devuserSchema = mongoose.Schema({
    username: { type: String },
    devicename: {type: String},
    fingerprintID: { type: Number }
});

var Devuser = mongoose.model("Devuser", devuserSchema);
module.exports = Devuser;