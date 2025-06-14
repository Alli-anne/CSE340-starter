async function addInventory(req, res) {
  const errors = validationResult(req);
  
if (!errors.isEmpty()) {
  const nav = await utilities.getNav();
  const classificationList = await utilities.buildClassificationList(req.body.classification_id);

  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classificationList,
    errors: errors.array(),
    // Pass the form fields back to the template for repopulating inputs
    inv_make: req.body.inv_make,
    inv_model: req.body.inv_model,
    inv_year: req.body.inv_year,
    inv_description: req.body.inv_description,
    inv_image: req.body.inv_image,
    inv_thumbnail: req.body.inv_thumbnail,
    inv_price: req.body.inv_price,
    inv_miles: req.body.inv_miles,
    inv_color: req.body.inv_color,
  });
  return;
}

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(req.body.classification_id);
    return res.status(400).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      errors: errors.array(),
      classificationList,
      // pass sticky values back to form
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: req.body.inv_year,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: req.body.inv_price,
      inv_miles: req.body.inv_miles,
      inv_color: req.body.inv_color,
      classification_id: req.body.classification_id,
      messages: {
        success: req.flash("success"),
        error: req.flash("error")
        
      }
    });
  }

  try {
    await invModel.addInventory(
      req.body.inv_make, req.body.inv_model, req.body.inv_year, req.body.inv_description,
      req.body.inv_image || "/images/vehicles/no-image.png",
      req.body.inv_thumbnail || "/images/vehicles/no-image-tn.png",
      req.body.inv_price, req.body.inv_miles, req.body.inv_color, req.body.classification_id
    );
    req.flash("success", "Inventory item added successfully.");
    res.redirect("/inv");
  } catch (error) {
    console.error("Add failed:", error);
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(req.body.classification_id);
    res.status(500).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      errors: [{ msg: "Sorry, the insert failed." }],
      classificationList,
      // pass sticky values back to form
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: req.body.inv_year,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: req.body.inv_price,
      inv_miles: req.body.inv_miles,
      inv_color: req.body.inv_color,
      classification_id: req.body.classification_id,
      messages: {
        success: req.flash("success"),
        error: req.flash("error")
      }
    });
  }
}

invCont.buildAddInventory = async function (req, res) {
  const nav = await invCont.getNav()
  const classificationList = await utilities.buildClassificationList()
   
  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    classificationList, 
    nav, 
    messages: {
    success: req.flash("success"),
    error: req.flash("error")
  },
    inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_image: "",
      inv_thumbnail: "",
      inv_price: "",
      inv_miles: "",
      inv_color: "",
      classification_id: ""
    }),
  console.log('Flash success:', req.flash("success"));
console.log('Flash error:', req.flash("error"));
    

}




 