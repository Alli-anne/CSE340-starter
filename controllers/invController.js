const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const invCont = {}

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
    })
  } catch (err) {
    next(err)
  }
}
invCont.buildManagement = async (req, res, next) => {
  try {
    const nav = await invCont.getNav() // 👈 make sure this is here
    res.render("inventory/management", {
      title: "Inventory Management", // 👈 pass it to the view
      flashMessage: req.flash("message"),
      nav
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
      return res.redirect("/inv/management"); // redirect after success
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
      return res.redirect("/inv"); // redirect after success
    } else {
      req.flash("error", "Failed to add inventory.");
      return res.redirect("/inv/add-inventory");
    }
    console.log('Add inventory result:', result);
console.log('Row count:', result.rowCount);
  } catch (error) {
    return next(error);
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


module.exports = invCont
