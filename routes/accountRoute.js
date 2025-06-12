const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const regValidate = require('../utilities/account-validation');
const utilities = require('../utilities');


router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/register", utilities.handleErrors(accountController.buildRegister))


// Process the registration data
router.post(
  "/register", utilities.handleErrors(
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount))
)
// Process the login attempt
router.post(
  "/login", 
  (req, res) => {
    res.status(200).send('login process')
  } 
)
module.exports = router
