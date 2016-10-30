var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");
var SALT_FACTOR = 10;
var deviceSchema = mongoose.Schema({
    deviceName: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    description: String
});

deviceSchema.methods.name = function() {
    return this.deviceName;
};

var noop = function() {};
deviceSchema.pre("save", function(done) {
    var device = this;
    if (!device.isModified("password")) {
        return done();
    }
    bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
        if (err) { return done(err); }
        bcrypt.hash(device.password, salt, noop, function(err, hashedPassword) {
            if (err) { return done(err); }
            device.password = hashedPassword;
            done();
        });
    });
});

deviceSchema.methods.checkPassword = function(guess, done) {
    bcrypt.compare(guess, this.password, function(err, isMatch) {
        done(err, isMatch);
    });
};

var Device = mongoose.model("Device", deviceSchema);
module.exports = Device;