// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const { inventoryRules, checkInventoryData, handleErrors } = utilities;




router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:carId", utilities.handleErrors(invController.showCarDetails))
router.get("/error", utilities.handleErrors(invController.showError))
router.get("/", utilities.handleErrors(invController.buildManagement))
router.get("/addclassification", utilities.handleErrors(invController.addClassification))  // <-- This is line 13?
router.get("/add-inventory",  utilities.handleErrors(invController.buildAddInventory))

router.post('/addclassification', utilities.handleErrors(invController.addClassificationToDB));
router.post(
  "/add-inventory",
  inventoryRules,
  checkInventoryData,
  handleErrors(invController.addInventory)
);

module.exports = router