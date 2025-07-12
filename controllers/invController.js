const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const invCont = {}
const reviewModel = require("../models/review-model") 

/* ************************
 * Utility functions (formerly in Util)
 ************************** */

invCont.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

invCont.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + ' details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make +' "/></a>'
      
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'

      // Add star ratings here
      const fullStars = Math.floor(vehicle.averageRating || 0);
      const halfStar = (vehicle.averageRating - fullStars) >= 0.5 ? 1 : 0;
      const emptyStars = 5 - fullStars - halfStar;

      // Build stars html (using ★ for filled, ☆ for empty, and optionally a half star)
      let starsHtml = '<div class="star-rating">';
      for (let i = 0; i < fullStars; i++) {
        starsHtml += '★';
      }
      if (halfStar) starsHtml += '½';  // or use a half star icon
      for (let i = 0; i < emptyStars; i++) {
        starsHtml += '☆';
      }
      starsHtml += ` <span>(${vehicle.reviewCount || 0})</span>`; // show count of reviews next to stars
      starsHtml += '</div>';

      grid += starsHtml;

      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}


invCont.buildClassificationGrid = async function(data) {
  let grid = '<ul id="inv-display">'

  for (const vehicle of data) {
    const avgResult = await reviewModel.averageReviews(vehicle.inv_id)
    const avgRating = avgResult?.avg ? Number(avgResult.avg).toFixed(1) : "No ratings"

    grid += '<li>'
    grid += `<a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">`
    grid += `<img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make}" /></a>`

    grid += `<div class="namePrice"><hr />`
    grid += `<h2><a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">`
    grid += `${vehicle.inv_make} ${vehicle.inv_model}</a></h2>`
    grid += `<span>$${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</span>`
    grid += `<p>Avg Rating: ${avgRating}</p>`
    grid += `</div></li>`
  }

  grid += "</ul>"
  return grid
}
invCont.buildCarDetail = function(car) {
  let detailHTML = ''

  detailHTML += `<h1 id="info-title">${car.inv_make} ${car.inv_model}</h1>`
  detailHTML += `<div class="info-grid">`

  detailHTML += `<img class="info-img" src="${car.inv_image}" alt="${car.inv_make} ${car.inv_model}" />`

  detailHTML += `<div class="stuff">`

  detailHTML += `<div class="info-flex"><h2 class="Description">Price:</h2>`
  detailHTML += `<h2 class="database-info">$${new Intl.NumberFormat('en-US').format(car.inv_price)}</h2></div>`

  detailHTML += `<div class="info-flex"><h2 class="Description">Description:</h2>`
  detailHTML += `<h2 class="database-info">${car.inv_description}</h2></div>`

  detailHTML += `<div class="info-flex"><h2 class="Description">Color:</h2>`
  detailHTML += `<h2 class="database-info">${car.inv_color}</h2></div>`

  detailHTML += `<div class="info-flex"><h2 class="Description">Miles:</h2>`
  detailHTML += `<h2 class="database-info">${new Intl.NumberFormat('en-US').format(car.inv_miles)} miles</h2></div>`

  detailHTML += `</div></div>`

  return detailHTML
}



/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await invCont.buildClassificationGrid(data)

    
    let nav = await invCont.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,

    })
  } catch (error) {
    next(error)
  }
}

invCont.showCarDetails = async function (req, res, next) {
  try {
    const carId = req.params.carId
    const car = await invModel.getCarById(carId)
    const nav = await invCont.getNav()

    // ✅ Use carId here
    const reviews = await reviewModel.getReviewsByVehicleId(carId)
    const averageRatingData = await reviewModel.averageReviews(carId)
    const reviewCount = await reviewModel.averageReviews(carId)

    const averageRating =
      averageRatingData?.avg != null
        ? Number(averageRatingData.avg).toFixed(1)
        : null

    if (!car) {
      return next({
        status: 500,
        message: "Sorry, we couldn't find the vehicle you're looking for.",
      })
    }

    const detailHTML = invCont.buildCarDetail(car)

    res.render("inventory/info", {
      title: `${car.inv_make} ${car.inv_model}`,
      nav,
      detailHTML,
      reviews,
      averageRating,
      reviewCount // ✅ Don't forget to pass this to EJS too
    })
  } catch (err) {
    next(err)
  }
}

invCont.buildManagement = async (req, res, next) => {
  try {
    const nav = await invCont.getNav() 
   const classificationSelect = await utilities.buildClassificationList()
    res.render("inventory/management", {
      title: "Inventory Management", // 👈 pass it to the view
      flashMessage: req.flash("message"),
      nav, 
      classificationSelect
    })
  } catch (error) {
    next(error);
  };
};
// invCont.buildAddClassification = async (req, res, next) => {
//   let nav = await utilities.getNav()
//   const {name, description} = req.body
//   const regResult = await accountModel.registerAccount(
//       name, 
//       description
//     )

//     if (regResult) {
//       res.redirect("/inv/management")
//     }
// }
invCont.showError = async function(req, res, next) {
  // Your error handling or error page rendering logic here
  res.render('error-view', { title: "Error" });
};
invCont.addClassificationToDB = async (req, res, next) => {
  try {
    const classificationName = req.body.classification_name;

    if (!classificationName || classificationName.trim() === "") {
      req.flash("error", "Please provide a classification name.");
      return res.redirect("/inv/addclassification");
    }

    const result = await invModel.addClassification(classificationName);

    if (result.rowCount === 1) {
      req.flash("success", `${classificationName} classification added successfully.`);
      return res.redirect("/inv"); // redirect after success
    } else {
      req.flash("error", "Failed to add classification.");
      return res.redirect("/inv/addclassification");
    }
  } catch (error) {
    return next(error);
  }
};
invCont.addInventoryToDB = async (req, res, next) => {
  try {
    const {
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    } = req.body;

    const result = await invModel.addInventory(
      inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price,
      inv_miles, inv_color, classification_id
    );

    if (result.rowCount === 1) {
      req.flash("success", "Inventory added successfully.");
      return res.redirect("/inv");
    } else {
      req.flash("error", "Failed to add inventory.");
      return res.redirect("/inv/add-inventory");
    }

  } catch (error) {
    console.error("Error in addInventoryToDB:", error);
    req.flash("error", "There was a problem adding the inventory item.");
    return res.redirect("/inv/add-inventory");
  }
};


invCont.addClassification = async (req, res, next) => {
  let nav = await invCont.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
  })
}
invCont.buildAddInventory = async function (req, res) {
  try {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()
    
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      classificationList,
      nav,
      errors: [], 

      inv_make: req.body?.inv_make || "",
      inv_model: req.body?.inv_model || "",
      inv_year: req.body?.inv_year || "",
      inv_description: req.body?.inv_description || "",
      inv_image: req.body?.inv_image || "",
      inv_thumbnail: req.body?.inv_thumbnail || "",
      inv_price: req.body?.inv_price || "",
      inv_miles: req.body?.inv_miles || "",
      inv_color: req.body?.inv_color || "",
      classification_id: req.body?.classification_id || "",
    })
  } catch (error) {
    console.error("Error rendering Add Inventory page:", error)
    res.status(500).send("Server error")
  }
}

    

invCont.addInventory = async function (req, res) {
  const errors = validationResult(req);

  // Destructure from req.body once
  let {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  } = req.body;

  // Set default images if blank
  const defaultImage = "/images/vehicles/no-image.png";
  const defaultThumbnail = "/images/vehicles/no-image-tn.png";

  if (!inv_image || inv_image.trim() === "") {
    inv_image = defaultImage;
  }

  if (!inv_thumbnail || inv_thumbnail.trim() === "") {
    inv_thumbnail = defaultThumbnail;
  }

  // Trim text fields
  inv_make = inv_make?.trim();
  inv_model = inv_model?.trim();
  inv_description = inv_description?.trim();
  inv_color = inv_color?.trim();

  // If errors exist, re-render form
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(classification_id);

    return res.status(400).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: errors.array(),
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
      messages: {
        success: req.flash("success"),
        error: req.flash("error")
      }
    });
  }

  try {
    // Add to database
    await invModel.addInventory(
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    );

    req.flash("success", "Inventory item added successfully.");
    res.redirect("/inv");
  } catch (error) {
    console.error("Add failed:", error);
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(classification_id);

    res.status(500).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      errors: [{ msg: "Sorry, the insert failed." }],
      classificationList,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
      messages: {
        success: req.flash("success"),
        error: req.flash("error")
      }
    });
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

invCont.showEditInventoryView = async (req, res, next) => {
  try {
    const inventoryId = parseInt(req.params.inv_id);
    const item = await invModel.getInventoryById(inventoryId);

    if (!item) {
      return res.status(404).render("errors/404", { message: "Item not found" });
    }

    res.render("inventory/edit-inventory", {
      title: "Edit Inventory Item",
      nav: await invCont.getNav(),
      inv_id: item.inv_id,  
      inv_make: item.inv_make,
      inv_model: item.inv_model,
      inv_year: item.inv_year,
      inv_description: item.inv_description,
      inv_image: item.inv_image,
      inv_thumbnail: item.inv_thumbnail,
      inv_price: item.inv_price,
      inv_miles: item.inv_miles,
      inv_color: item.inv_color,
      classification_id: item.classification_id,
      messages: {
        success: req.flash("success"),
        error: req.flash("error")
      }
    });
  } catch (error) {
    next(error);
  }
};
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}
invCont.updateInventoryItem = async (req, res) => {
  const data = req.body;
  const success = await invModel.updateInventoryItem(data);
  if (success) {
    req.flash("notice", "Inventory item updated successfully.");
    res.redirect("/inv/");
  } else {
    req.flash("error", "Inventory update failed.");
    res.redirect("/inv/edit/" + data.inv_id);
  }
};
invCont.showDeleteConfirmation = async function (req, res, next) {
  try {
    const invId = parseInt(req.params.inv_id);
    const item = await invModel.getInventoryById(invId);

    if (!item) {
      return res.status(404).render('errors/404', { message: 'Item not found' });
    }

    const nav = await invCont.getNav();

    res.render('inventory/delete-confirmation', {
      title: `Delete ${item.inv_make} ${item.inv_model}`,
      nav,
      item,
      messages: {
        success: req.flash('success'),
        error: req.flash('error'),
      },
    });
  } catch (error) {
    next(error);
  }
};
 
invCont.deleteInventoryItem = async function (req, res, next) {
  try {
    const invId = parseInt(req.body.inv_id);

    const result = await invModel.deleteInventoryById(invId);

    if (result) {
      req.flash('success', 'Inventory item deleted successfully.');
      res.redirect('/inv');
    } else {
      req.flash('error', 'Failed to delete inventory item.');
      res.redirect(`/inv/delete/${invId}`);
    }
  } catch (error) {
    next(error);
  }
};
invCont.submitReview = async function(req, res, next) {
  try {
    const inv_id = req.params.carId; // assuming your route is like /inv/detail/:carId
    const { rating, comment } = req.body;
    const account_id = req.session.account_id; // adjust to your session setup

    if (!account_id) {
      // maybe redirect to login or show error
      return res.status(401).send("Please log in to submit a review.");
    }

    await reviewModel.addReview(account_id, inv_id, rating, comment);

    res.redirect(`/inv/detail/${inv_id}`);
  } catch (error) {
    console.error("Error submitting review:", error);
    next(error);
  }
};


module.exports = invCont;

