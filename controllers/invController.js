const invModel = require("../models/inventory-model")

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

invCont.showError = function (req, res, next) {
  throw new Error("This is an error")
}

module.exports = invCont
