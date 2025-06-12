/* ****************************************
*  Deliver login view
* *************************************** */
const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require('bcryptjs')




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
* *************************************** */
async function registerAccount(req, res) {
  const nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  let hashedPassword

  // Hash the password
  try {
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", "There was an error processing the registration.")
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      errors: null
    })
  }

  // Register the account
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    return res.redirect("/account/login") // This triggers buildLogin() and shows flash
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    return res.status(501).render("account/register", {
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      errors: null
    })
  }
}




module.exports = { buildLogin,
  buildRegister,
  registerAccount
 }