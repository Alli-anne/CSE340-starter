/* ****************************************
*  Deliver login view
* *************************************** */
const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
require("dotenv").config()




async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    messages : req.flash("notice"),
    email: '',
  })
}
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    account_firstname: '',
    account_lastname: '',
    account_email: '',
    errors: null,

  })
}

/* ****************************************
*  Process Registration
* *************************************** */async function registerAccount(req, res) {
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  const hashedPassword = await bcrypt.hash(account_password, 10);
  
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash("notice", "You have successfully registered.");
    res.redirect("/account/login");
  } else {
    req.flash("error", "Registration failed. Try again.");
    res.render("account/register", {
      title: "Register",
      account_firstname,
      account_lastname,
      account_email,
    });
  }
}
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account")
    }
    else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

async function buildAccountManagement (req, res) {
  let nav = await utilities.getNav()  // Added await
  res.render("account/account_management", {
    title: "Account Management",
    nav,
    errors: null, // Add this for error handling
    messages: req.flash("notice")
  })
}


module.exports = { buildLogin,
  buildRegister,
  registerAccount,  
  accountLogin, 
buildAccountManagement }