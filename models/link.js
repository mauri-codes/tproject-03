var mongoose = require("mongoose");

var linkSchema = mongoose.Schema({
    username: { type: String},
    devicename: {type: String},
    status: { type: String},//Hecho, EsperandoScanner, HuellaConfirmada
    date: {type: Date, default: Date.now()},
    processName: String,
    type: {type: String}// registro, identificacion
});

var Link = mongoose.model("Link", linkSchema);
module.exports = Link;