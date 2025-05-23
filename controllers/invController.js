const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")




const invCont = {}


/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}
invCont.showCarDetails = async function (req, res, next) {
  try {
    const carId = req.params.carId
    const car = await invModel.getCarById(carId)
    const nav = await utilities.getNav()

    if (!car) {
      // Send error to centralized error handler
      return next({
        status: 500,
        message: "Sorry, we couldn't find the vehicle you're looking for.",
      })
    }

    res.render("inventory/info", {
      title: `${car.inv_make} ${car.inv_model}`,
      nav,
      car,
    })
  } catch (err) {
    next(err) // Catch and send unexpected errors to the handler
  }
}

invCont.showError = function (req, res, next) {
  throw new Error("This is an error")
}


module.exports = invCont