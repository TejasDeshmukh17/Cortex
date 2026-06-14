if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const ExpressError = require("./Utils/ExpressError.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const userRoutes = require("./routes/user.js");

const session = require("express-session");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// ================= DATABASE CONNECTION =================

const db_URL = process.env.ATLASDB_KEY;

async function main() {
  try {
    await mongoose.connect(db_URL);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.log("❌ MongoDB Connection Error:");
    console.log(err);
  }
}

main();

// ================= EJS SETUP =================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// ================= MIDDLEWARE =================

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// ================= SESSION CONFIG =================

const sessionOptions = {
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// ================= PASSPORT CONFIG =================

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ================= GLOBAL VARIABLES =================

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

// ================= ROUTES =================

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);
app.use("/", userRoutes);

// ================= ERROR HANDLING =================

// 404 Error
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// General Error Handler
app.use((err, req, res, next) => {
  console.log(err);
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { err });
});

// ================= SERVER =================

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});