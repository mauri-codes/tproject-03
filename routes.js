var express = require("express");
var User = require("./models/user");
var Device = require("./models/device");
var Devuser = require("./models/devuser");
var Link = require("./models/link");
var passport = require("passport");
var router = express.Router();


router.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.errors = req.flash("error");
    res.locals.infos = req.flash("info");
    next();
});

router.get("/", function(req, res, next) {
    User.find()
        .sort({ createdAt: "descending" })
        .exec(function(err, users) {
            if (err) { return next(err); }
            res.render("index", { users: users });
        });
});

router.get("/signup", function(req, res) {
    res.render("signup");
});
router.get("/devices/:device", ensureAuthenticated, function(req, res, next) {
    Devuser.find({ devicename: req.params.device }, function(err, device) {
        if (err) { return next(err); }
        if (!device) { return next(404); }
        res.render("devuser", { device: device });
    });
});
router.post("/signup", function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    User.findOne({ username: username }, function(err, user) {
        if (err) { return next(err); }
        if (user) {
            req.flash("error", "Usuario ya existe");
            return res.redirect("/signup");
        }
        var newUser = new User({
            username: username,
            password: password
        });
        newUser.save(next);
    });
}, passport.authenticate("login", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}));

router.get("/users/:username", function(req, res, next) {
    User.findOne({ username: req.params.username }, function(err, user) {
        if (err) { return next(err); }
        if (!user) { return next(404); }
        res.render("profile", { user: user });
    });
});

router.get("/login", function(req, res) {
    res.render("login");
});

router.post("/login", passport.authenticate("login", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}));

router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash("info", "Debes estar registrado para ver esta pagina.");
        res.redirect("/login");
    }
}
router.get("/edit", ensureAuthenticated, function(req, res) {
    res.render("edit");
});

router.post("/edit", ensureAuthenticated, function(req, res, next) {
    req.user.displayName = req.body.displayname;
    req.user.bio = req.body.bio;
    req.user.save(function(err) {
        if (err) {
            next(err);
            return;
        }
        req.flash("info", "Profile updated!");
        res.redirect("/edit");
    });
});

router.get("/devices", ensureAuthenticated, function (req, res) {
    Device.find()
        .exec(function(err, devices) {
            if (err) { return next(err); }
            res.render("devices", { devices: devices });
        });
});

router.post("/device", ensureAuthenticated, function(req, res) {
    var devicename = req.body.devicename;
    var password = req.body.password;
    Device.findOne({ deviceName: devicename }, function(err, device) {
        if (err) { req.json({"data": err}) }
        if (device) {
            req.flash("error", "El dispositivo ya existe");
            res.redirect("/devices");
        }
        var newDevice = new Device({
            deviceName: devicename,
            password: password
        });
        newDevice.save();
        res.redirect("/devices")
    });
});

router.post("/try", function (req, res, next) {
    var devicename = req.body.devicename;
    var password = req.body.password;
    Device.findOne({ deviceName: devicename }, function(err, device) {
        if (err) { res.json({"data": err})}
        if (!device) {
            res.json({"data": "No device has that device name!" });
        }
        device.checkPassword(password, function(err, isMatch) {
            if (err) { res.json({"data": err})}
            if (isMatch) {
                next();
            } else {
                res.json({"data": "invalid"});
            }
        });
    });
    //res.json({"data": "hello " + username, "data2": "your password is: " +password, "result": t});
});
router.post("/try", function (req, res) {
    // res.json({"data": "success"});
    var data = req.body;
    Link.findOneAndUpdate({"devicename": data.devicename}, {"status": "Fingerprint", "fingerprint": parseInt(data.id)}, function(err, doc){
        if (err) return res.send(500, { error: err });
        res.json({"data": "successful"});
    });
    // var newDevuser = new Devuser({
    //     username: username,
    //     password: password
    // });
    // newDevuser.save();
});
router.post("/catch", function (req, res, next) {
    var devicename = req.body.devicename;
    var password = req.body.password;
    Device.findOne({ deviceName: devicename }, function(err, device) {
        if (err) { res.json({"data": err})}
        if (!device) {
            res.json({"data": "No device has that device name!" });
        }
        device.checkPassword(password, function(err, isMatch) {
            if (err) { res.json({"data": err})}
            if (isMatch) {
                next();
            } else {
                res.json({"data": "invalid"});
            }
        });
    });
    //res.json({"data": "hello " + username, "data2": "your password is: " +password, "result": t});
});
router.post("/catch", function (req, res) {
    // res.json({"data": "success"});
    var data = req.body;
    Link.findOneAndUpdate({"devicename": data.devicename}, {"status": "Fingerprint", "fingerprint": parseInt(data.id)}, function(err, doc){
        if (err) return res.send(500, { error: err });
        Devuser.findOne({username: doc.username}, function (err, user) {
            if(data.id == user.fingerprintID){
                res.json({"data": "successful"});
            }
            else{ res.json({"data": "not success"});}
        });
    });
    // var newDevuser = new Devuser({
    //     username: username,
    //     password: password
    // });
    // newDevuser.save();
});


router.post("/setlink", function (req, res) {
    var data = req.body;
    //removes all previous data so the scanner only deals with one request at a time
    Link.remove({}, function (err) {//could remove based on process or username
        if(err) console.log(err);
    });
    var newLink = new Link({
        linkID: data.id,
        username: data.name,
        status: data.status,
        processName: data.process,
        devicename: data.device
    });
    newLink.save();
    res.json({"id": data.id});
});
router.post("/getconnection", function (req, res) {
    var data = req.body;
    Link.findOne({"linkID": data.id} ,function(err, link) {
        if (err) { oonsole.log(err)}
        if(link){
            if(link.processName === data.process){
                if(link.status === "WaitingF"){
                    res.json({ "link": link, "status": "waiting"});
                }
                if(link.status === "Fingerprint"){//fingerprint connection established
                    if(link.processName === "Deleting" || link.processName === "DeleteR" || link.processName === "AcceptReg"){
                        Devuser.findOne({"username": link.username, "fingerprintID": link.fingerprint}, function (err, devuser) {
                            if (err) { oonsole.log(err)}
                            if(devuser){
                                if(devuser.accepted)
                                    res.json({ "link": link.fingerprint, "status": "Fingerprint"});
                                else
                                    res.json({ "link": link.fingerprint, "status": "notaccepted"});
                            }
                            else{
                                res.json({ "link": link.fingerprint, "status": "IncorrectUser"});
                            }
                        });
                    }
                    if(link.processName === "Register"){
                        res.json({ "link": link.fingerprint, "status": "Fingerprint"});
                    }
                    // res.json({ "link": link.fingerprint, "status": "Fingerprint"});
                    //I should actually change this status to done here
                }
            }
            else{ res.json({"status": "not fine"});}
        }else{
            res.json({"status": "no link"});
        }

    });
});

router.post("/registeruser", function (req, res) {
    //var data = req.body;
    Link.findOne({"processName": "Register", "status": "Fingerprint"} ,function(err, link) {
        if (err) { oonsole.log(err)}
        Devuser.findOne({"username": link.username}, function (err, devuser) {
            if(devuser){
                Devuser.findOneAndUpdate({"username": link.username}, {"fingerprintID": link.fingerprint}, function(err, doc){
                    if (err) return res.send(500, { error: err });
                    res.sendStatus(200);
                });
            }else{
                var newDevuser = new Devuser({
                    username: link.username,
                    devicename: link.devicename,
                    fingerprintID: link.fingerprint
                });
                newDevuser.save();
                User.findOneAndUpdate({"username": link.username}, {"registered": true}, function(err, doc){
                    if (err) return res.send(500, { error: err });
                    res.sendStatus(200);
                });
            }
        });
    });
});
router.post("/deleteuser", function (req, res) {
    var data = req.body;
    User.remove({"username": data.nameToDelete}, function (err) {
        if(err) console.log(err);
        Devuser.remove({"username": data.nameToDelete}, function (err) {
            if(err) console.log(err);
            res.sendStatus(200);
        });
    });
});
router.post("/deletereg", function (req, res) {
    var data = req.body;
    Devuser.remove({"username": data.nameToDelete}, function (err) {
        if(err) console.log(err);
        console.log(data.nameToDelete);
        res.sendStatus(200);
    });
});

router.post("/acceptregister", function (req, res) {
    var data = req.body;
    Devuser.findOneAndUpdate({"username": data.nameToAccept}, {"accepted": true}, function(err, doc){
        if (err) return res.send(500, { error: err });
        res.sendStatus(200);
    });
});

module.exports = router;