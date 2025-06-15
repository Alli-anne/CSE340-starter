// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const { inventoryRules, inventoryValidation, handleErrors } = utilities;
const regValidate = require('../utilities/index');




router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:carId", utilities.handleErrors(invController.showCarDetails))
router.get("/error", utilities.handleErrors(invController.showError))
router.get("/", utilities.handleErrors(invController.buildManagement))
router.get("/addclassification", utilities.handleErrors(invController.addClassification))  // <-- This is line 13?
router.get("/add-inventory",  utilities.handleErrors(invController.buildAddInventory))

router.post('/addclassification', utilities.handleErrors(invController.addClassificationToDB));
router.post(
  "/add-inventory",
  utilities.inventoryRules(),           // 1. Run validation
  utilities.inventoryValidation,        // 2. Handle validation errors and rerender if needed
  utilities.handleErrors(invController.addInventoryToDB) // 3. Only run controller if all is valid
)


module.exports = router