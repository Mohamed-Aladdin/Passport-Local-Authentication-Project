// Dependencies Requirement
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

// Load User Model
const User = require("../models/User");

module.exports = (passport) => {
  passport.use("local",
    new LocalStrategy({usernameField: "email"}, (email, password, done) => {
      // Match User
      User.findOne({email: email}).then(foundUser => {
        if (!foundUser) {
          return done(null, false, {message: "The email you entered is not registered."});
        }

        // Match Password
        bcrypt.compare(password, foundUser.password, (err, isMatch) => {
          if (err) throw err;

          if (isMatch) {
            return done(null, foundUser);
          } else {
            return done(null, false, {message: "Password is incorrect."});
          }
        });
      }).catch(err => console.log(err));
    })
  );

  passport.serializeUser((foundUser, done) => {
    done(null, foundUser.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id).then((foundUser) => done(null, foundUser)).catch(err => console.log(err));
    // User.findById(id, (err, foundUser) => {
    //   done(err, foundUser);
    // });
  });
}