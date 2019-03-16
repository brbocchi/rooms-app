

const express = require('express');
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const passport = require("passport");
const nodemailer = require("nodemailer"); 

router.get("/profile/add", (req, res, next) => {
  res.render("profile-add", {
    'errorMessage': req.flash('error')
  });
});

router.post("/profile/add", (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const fullName = req.body.fullName;
  


  if (email == '' || password == '') {
    res.render('profile-add', {
      msgError: `username and password can't be empty`
    })
    return;
  }

  User.findOne({
      "email": email
    })
    .then(user => {
      if (user !== null) {
        res.render("profile-add", {
          msgError: "The username already exists!"
        });
        return;
      }

      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);
      const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let confirmationCode = '';
      for (let i = 0; i < 25; i++) {
        confirmationCode += characters[Math.floor(Math.random() * characters.length)];
      }

      const newUser = new User({
        email: email,
        password: hashPass,
        fullName: fullName,
        confirmationCode: confirmationCode
      });

      newUser.save()
        .then(user => {
          let transporter = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: process.env.MAILTRAP_USER,
              pass: process.env.MAILTRAP_PASS
            }
          });
          transporter.sendMail({
            from: '"My Awesome Project 👻" <myawesome@project.com>',
            to: email,
            subject: 'email confirmation required',
            // text: message,
            html: `please click <a href="${process.env.MAIL_URL}${confirmationCode}">here</a>`
          })
          .then(info => console.log('nodemailer sucess -->', info))
          .catch(error => console.log(error));
          
          res.redirect("/");

        })
        .catch(err => {
          throw new Error(err)
        });
    })
    .catch(err => {
      throw new Error(err)
    });

});

router.get('/auth/confirm/:confirmationCode', (req, res) =>{
  
  const{confirmationCode} = req.params;
  User.findOneAndUpdate({confirmationCode}, {$set: {status: 'Active'}}, {new: true})
  .then(user =>{
    (user) ? res.status(201).send(`${user.fullName} - ${user.email} - status: ${user.status}`) : res.status(500).send('invalid confirmation code');
  })
  .catch(err => {throw new Error(err)})
});


router.get("/login", (req, res, next) => {
  res.render("auth/login", {
    'errorMessage': req.flash('error')
  });
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true,
  passReqToCallback: true
}));

router.get("/logout", (req, res, next) => {
  req.logout();
  res.redirect("/");
});

router.get('/auth/facebook',
  passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/login'
  }));

module.exports = router;