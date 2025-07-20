// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const { inventoryRules, inventoryValidation, handleErrors, checkLogin, adminCheck} = utilities;
const regValidate = require('../utilities/index');


// ==== Public Routes (No Login Needed) ====
router.get("/type/:classificationId", 
  utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:carId", 
  utilities.handleErrors(invController.showCarDetails))
router.get("/error", 
  utilities.handleErrors(invController.showError))
router.get("/getInventory/:classification_id", 
  utilities.handleErrors(invController.getInventoryJSON))

// ==== Admin Views (GET) ====
router.get("/", 
  utilities.checkLogin,
  utilities.adminCheck,
  utilities.handleErrors(invController.buildManagement))
router.get("/addclassification", 
  utilities.checkLogin,
  utilities.adminCheck,
  utilities.handleErrors(invController.addClassification))  // <-- This is line 13?
router.get("/add-inventory",  
  utilities.checkLogin,
  utilities.adminCheck,
  utilities.handleErrors(invController.buildAddInventory))
router.get("/edit/:inv_id", 
  utilities.checkLogin,
  utilities.adminCheck,
  utilities.handleErrors(invController.showEditInventoryView))
router.get('/delete/:inv_id', 
  utilities.checkLogin,
  utilities.adminCheck,
  invController.showDeleteConfirmation);

// ==== Admin Actions (POST) ====
router.post('/delete', 
  utilities.checkLogin,
  utilities.adminCheck,
  invController.deleteInventoryItem);

router.post("/update", 
  utilities.checkLogin,
  utilities.adminCheck,
  utilities.inventoryRules(),   
  utilities.checkUpdateData, 
  utilities.handleErrors(invController.updateInventory));

router.post('/addclassification', 
  utilities.checkLogin,
  utilities.adminCheck,
  utilities.handleErrors(invController.addClassificationToDB));

router.post(
  "/add-inventory",
  utilities.checkLogin,
  utilities.adminCheck,
  utilities.inventoryRules(),           
  utilities.inventoryValidation,        
  utilities.handleErrors(invController.addInventoryToDB)
);
router.post("/add-review/:carId", utilities.handleErrors(invController.submitReview));




module.exports = router