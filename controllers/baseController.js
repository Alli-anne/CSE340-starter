const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function (req, res) {
  // Get the navigation list dynamically
  const nav = await utilities.getNav()
  res.render("index", { title: "Home", nav })
}

module.exports = baseController
