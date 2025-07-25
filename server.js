/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 ******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require("./utilities");
const inv = require("./models/inventory-model");
const session = require("express-session");
const pool = require('./database/');
const accountRoute = require("./routes/accountRoute");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const accountValidation = require("./utilities/account-validation");

/* ***********************
 * Middleware Setup
 * ************************/

// Body parsers should be before routes so req.body is populated correctly
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Cookie parser should be before session (since session uses cookies)
app.use(cookieParser());

// Session middleware
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,           // Changed to false for better performance
  saveUninitialized: false, // Changed to false to prevent storing empty sessions
  name: 'sessionId',
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// JWT token check middleware, sets res.locals.loggedin and res.locals.accountData
app.use(utilities.checkJWTToken);

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not at views root

/* ***********************
 * Static Files
 *************************/
app.use(static);

/* ***********************
 * Routes
 *************************/

// Base Home route
app.get("/", baseController.buildHome);

// Account routes (login, registration, etc.)
app.use("/account", accountRoute);

// Inventory routes
app.use("/inv", inventoryRoute);

// Favicon shortcut to avoid unnecessary errors
app.get('/favicon.ico', (req, res) => res.status(204).end());

/* ***********************
 * 404 Handler
 *************************/
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'});
});

/* ***********************
 * Express Error Handler
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  res.status(err.status || 500).render("errors/error", {
    title: err.status || 'Server Error',
    message: err.message,
    nav
  });
});

/* *********************** 
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 3000; // default port fallback
const host = process.env.HOST || 'localhost'; 

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});

