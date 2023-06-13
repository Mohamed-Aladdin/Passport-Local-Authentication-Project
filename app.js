// Dependencies Requirement
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");

// Express
const app = express();

// Passport Config
require("./config/passport")(passport);

// EJS
app.set("view engine", "ejs");

// bodyParser
app.use(bodyParser.urlencoded({extended: true}));

// Connect Flash
app.use(flash());

// Express Session
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: false
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Global Variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// DB Config & Connection
const db = require("./config/keys").MongoURI;
mongoose.connect(db).then(() => console.log("Successfully connected to MongoDB.")).catch((err) => console.log(err));

// Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));

// Application Config and Startup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}.`));