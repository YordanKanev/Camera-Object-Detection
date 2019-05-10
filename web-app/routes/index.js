var express = require('express');
var router = express.Router();
var userService = require("../services/user-service");
var deviceService = require("../services/device-service");

/* GET home page. */
router.get('/', function (req, res, next) {
  res.redirect('/manage');
});

function authenticate(req, res, next) {
  if (req.session.user) {
    next();
  }
  else {
    res.redirect('/login');
  }
}

function navigate(req, res, next) {
  if (req.session.user) {
    res.redirect('/manage');
  }
  else {
    next();
  }
}

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.redirect('/manage');
});


router.get('/login', navigate, function (req, res, next) {
  res.render('login', { title: "Login" });
});

router.post('/login', function (req, res) {
  userService.login(req.body, function (err, user) {
    if (err) {
      res.redirect('/login');
    } else {
      if (user) {
        req.session.user = user;
      }
      res.redirect('/manage');
    }
  })
});

router.get('/manage', authenticate, function (req, res) {
  res.render('manage');
});

router.get('/register', navigate, function (req, res) {
  res.render('register');
});

router.post('/register', function (req, res) {
  var reqBody = req.body;
  var userReq = {};
  userReq.username = reqBody.username;
  userReq.password = reqBody.password;
  userReq.email = reqBody.email;
  userService.register(userReq, function (err, user) {
    if (err) {
      res.status(400).json("Could not register");
    } else {
      req.session.user = user;
      res.redirect('/manage');
    }
  });
});

router.get('/devices', authenticate, function (req, res) {
    var email = req.session.user.email;
    deviceService.getDevices({email: email}, function(err,devices){
      if(err){
        res.send(err);
        return;
      }
      res.json(devices);
    });
});

router.post('/devices', authenticate, function(req,res){
  deviceService.addDevices(req.body, function(err, device){
    if(err){
      res.send(err);
      return;
    }
    res.json(device);
    return;
  });
});

module.exports = router;
