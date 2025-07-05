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
* *************************************** */
async function registerAccount(req, res) {
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
      nav
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

    const accountId = res.locals.accountData.account_id
    const updatedAccountData = await accountModel.getAccountById(accountId)

  res.render("account/account_management", {
    title: "Account Management",
    firstName: updatedAccountData.account_firstname,
    accountType: updatedAccountData.account_type,
    accountId: updatedAccountData.account_id,
    nav,
    errors: null,
    messages: req.flash("notice")
  })
}
async function showUpdateForm (req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/update-account", {
  title: "Update Account",
  nav,
  firstName: res.locals.accountData.account_firstname,
  account_lastname: res.locals.accountData.account_lastname,
  account_email: res.locals.accountData.account_email,
  accountId: res.locals.accountData.account_id,
  messages: req.flash("notice"),
  errors: null
})

}

async function updateAccount(req, res) { 
  const { account_firstname, account_lastname, account_email } = req.body
  const accountId = res.locals.accountData.account_id
  let nav = await utilities.getNav()

  // Validation
  const errors = []
  if (!account_firstname || account_firstname.trim() === "") {
    errors.push("First name is required.")
  }
  if (!account_lastname || account_lastname.trim() === "") {
    errors.push("Last name is required.")
  }
  if (!account_email || account_email.trim() === "") {
    errors.push("Email is required.")
  } else {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(account_email.trim())) {
      errors.push("Email is not valid.")
    }
  }

  if (errors.length > 0) {
    req.flash("error", errors.join(" "))
    return res.status(400).render("account/update-account", {
      title: "Update Account",
      nav,
      firstName: account_firstname,
      account_lastname,
      account_email,
      accountId,
      errors,
      messages: req.flash("error"),
    })
  }

  // If validation passed, update the account
  const success = await accountModel.updateAccount(
    account_firstname.trim(),
    account_lastname.trim(),
    account_email.trim(),
    accountId
  )

  if (success) {
    req.flash("notice", "Account updated successfully.")
    res.redirect("/account")
  } else {
    req.flash("error", "Account update failed.")
    res.redirect("/account/update-account")
  }
}

async function updatePassword(req, res) {
  const { account_password } = req.body
  const accountId = res.locals.accountData.account_id

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)

    const success = await accountModel.updatePassword(accountId, hashedPassword)

    if (success) {
      req.flash("notice", "Password updated successfully.")
      return res.redirect("/account")
    } else {
      req.flash("error", "Password update failed.")
      return res.redirect("/account/update-account")
    }
  } catch (error) {
    console.error("Password update error:", error)
    req.flash("error", "An unexpected error occurred. Please try again.")
    return res.redirect("/account/update-account")
  }
}
  
async function accountLogout(req, res) {
  console.log("LOGOUT HIT 🚪"); // make sure this shows in terminal

  try {
    res.clearCookie("jwt")
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err)
        return res.redirect("/account")
      }

      console.log("SESSION DESTROYED ✅")
      res.redirect("/")
    })
  } catch (err) {
    console.error("Logout error:", err)
    res.redirect("/account")
  }
}


module.exports = { buildLogin,
  buildRegister,
  registerAccount,  
  accountLogin, 
buildAccountManagement,
showUpdateForm,
updateAccount,
updatePassword,
accountLogout}