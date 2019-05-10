var express = require('express');
var router = express.Router();
var userService = require("../services/user-service");


function authenticate(req,res,next){
  if(req.session.user){
    next();
  }
  else{
    res.redirect('/login');
  }
}

function navigate(req,res,next){
  if(req.session.user){
    res.redirect('/manage');
  }
  else{
    next();
  }
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.redirect('/manage');
});


router.get('/login', navigate, function(req,res,next){
    res.render('login', {title: "Login"});
});

router.post('/login', function(req,res){
    userService.login(req.body,function(err,user){
      if(err){
        res.redirect('/login');
      }else{
        req.session.user = user;
        res.redirect('/manage');
      }
    })
});

router.get('/manage',authenticate, function(req,res){

});

router.get('/register',navigate, function(req,res){
    res.render('register');
});

router.post('/register',function(req,res){
  var reqBody = req.body;
  var userReq = {};
  userReq.username = reqBody.username;
  userReq.password= reqBody.password;
  userReq.email = reqBody.email;
  userService.register(userReq, function(err,user){
    if(err){
      res.status(400).json("Could not register");
    }else{
      req.session.user = user;
      res.redirect('/manage');
    }
  });
});

module.exports = router;
