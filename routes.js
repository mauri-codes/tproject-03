var express = require("express");
var User = require("./models/user");
var Device = require("./models/device");
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
    var username = req.body.username;
    var password = req.body.password;
    User.findOne({ username: username }, function(err, user) {
        if (err) { res.json({"data": err})}
        if (!user) {
            res.json({"data": "No user has that username!" });
        }
        user.checkPassword(password, function(err, isMatch) {
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
    res.json({"data": "success"});
});

module.exports = router;