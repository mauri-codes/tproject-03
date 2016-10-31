var mongoose = require("mongoose");

var linkSchema = mongoose.Schema({
    linkID: { type:String, required: true, unique: true },
    username: { type: String},
    devicename: {type: String},
    status: { type: String},//Hecho, EsperandoScanner, HuellaConfirmada
    date: {type: Date, default: Date.now()},
    processName: String,
    fingerprint: {type: Number}// registro, identificacion
});

var Link = mongoose.model("Link", linkSchema);
module.exports = Link;