var express = require('express');
var router = express.Router();


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

});

router.get('/manage',authenticate, function(req,res){

});

router.get('/register',navigate, function(req,res){
    res.render('register');
});

router.post('/register',function(req,res){

});

module.exports = router;
