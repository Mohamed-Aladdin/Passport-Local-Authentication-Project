// Dependencies Requirement
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const { forwardAuthenticated } = require("../config/auth");

// Registeration Page
router.route("/register")
  .get(forwardAuthenticated, (req, res) => res.render("register"))

  .post((req, res) => {
    const {name, email, password, password2} = req.body;
    const errors = [];

    // Check Required Fields
    if (!name || !email || !password || !password2) {
      errors.push({msg: "Please fill in all the fields."});
    }

    // Check Password Match
    if (password !== password2) {
      errors.push({msg: "Passwords must match."});
    }

    // Check Password Length
    if (password.length < 6) {
      errors.push({msg: "Password should be atleast 6 characters."});
    }

    // Rendering Conditions
    if (errors.length > 0) {
      res.render("register", {
        errors,
        name,
        email,
      });
    } else {
      // Existence Validation
      User.findOne({email: email}).then((foundUser) => {
        if (!foundUser) {
          const newUser = new User({
            name: name,
            email: email,
            password: password
          });
          bcrypt.genSalt(process.env.SALT, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;

              newUser.password = hash;

              newUser.save().then(foundUser => {
                req.flash("success_msg", "You're now registered, please log in")
                res.redirect("login");
              }).catch(err => console.log(err));
            });
          });
        } else {
          errors.push({msg: "This email is already registered."})
          res.render("register", {
            errors,
            name,
            email,
          });
        }
      }).catch(err => console.log(err));
    }
  });

// Login Page
router.route("/login")
  .get(forwardAuthenticated, (req, res) => res.render("login"))

  .post((req, res, next) => {
    passport.authenticate('local', {
      successRedirect: "/dashboard",
      failureRedirect: "login",
      failureFlash: true
    })(req, res, next);
  });

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    req.flash("success_msg", "You have been logged out.");
    res.redirect("login");
  });
});

module.exports = router;