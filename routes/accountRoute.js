const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const regValidate = require('../utilities/account-validation');
const utilities = require('../utilities');


router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/register", utilities.handleErrors(accountController.buildRegister))
router.get("/", 
  utilities.checkLogin,              
  utilities.handleErrors(accountController.buildAccountManagement));

// regValidate.checkLogin, 

// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);
// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);


module.exports = router
