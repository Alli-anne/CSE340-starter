const accountModel = require("../models/account-model")
const utilities = require(".")
  const { body, validationResult } = require("express-validator")
  const validate = {}
  const jwt = require("jsonwebtoken")
  require("dotenv").config()

  /*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
 validate.registrationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the DB
     body("account_email")
        .trim()
         .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
    if (emailExists){
      throw new Error("Email exists. Please log in or use different email")
    }
  }),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

  /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}
validate.loginRules = () => {
  return [ 
    body("account_email")
      .isEmail()
      .withMessage("Please enter a valid email address."),
    body("account_password")
      .notEmpty()
      .withMessage("Please enter your password.")
  ]
}

validate.checkLoginData = async (req, res, next) =>{
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/login", {
       title: "Login",
         nav,
      errors: errors.array(),
      email: req.body.email,
      });
      return
    };
    next()
}
// utilities.js or wherever your utilities are

validate.checkLogin = async function (req, res, next) {
  if (req.session.account) {
    return next(); // user is logged in, continue
  }
  // user not logged in, redirect to login page or show error
  req.flash('notice', 'You must be logged in to view this page.');
  res.redirect('/account/login');
}
/* ****************************************
* Middleware to check token validity
**************************************** */
validate.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
      }
    )
  } else {
    next()
  }
}





module.exports = validate