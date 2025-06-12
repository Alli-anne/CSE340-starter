const invModel = require("../models/inventory-model")
const Util = {}


/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
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
Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications()
    let classificationList =
      '<select name="classification_id" id="classificationList" required>'
    classificationList += "<option value=''>Choose a Classification</option>"
    data.rows.forEach((row) => {
      classificationList += '<option value="' + row.classification_id + '"'
      if (
        classification_id != null &&
        row.classification_id == classification_id
      ) {
        classificationList += " selected "
      }
      classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
  }



/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
    let grid
    if(data.length > 0){
      grid = '<ul id="inv-display">'
      data.forEach(vehicle => { 
        grid += '<li>'
        grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
        + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
        + 'details"><img src="' + vehicle.inv_thumbnail 
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
      grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
  }

Util.buildCarDetail = function(car) {
  let detailHTML = '';

  detailHTML += `<h1 id="info-title">${car.inv_make} ${car.inv_model}</h1>`;
  detailHTML += `<div class="info-grid">`;

  detailHTML += `<img class="info-img" src="${car.inv_image}" alt="${car.inv_make} ${car.inv_model}" />`;

  detailHTML += `<div class="stuff">`;

  detailHTML += `<div class="info-flex"><h2 class="Description">Price:</h2>`;
  detailHTML += `<h2 class="database-info">$${new Intl.NumberFormat('en-US').format(car.inv_price)}</h2></div>`;

  detailHTML += `<div class="info-flex"><h2 class="Description">Description:</h2>`;
  detailHTML += `<h2 class="database-info">${car.inv_description}</h2></div>`;

  detailHTML += `<div class="info-flex"><h2 class="Description">Color:</h2>`;
  detailHTML += `<h2 class="database-info">${car.inv_color}</h2></div>`;

  detailHTML += `<div class="info-flex"><h2 class="Description">Miles:</h2>`;
  detailHTML += `<h2 class="database-info">${new Intl.NumberFormat('en-US').format(car.inv_miles)} miles</h2></div>`;

  detailHTML += `</div></div>`;

  return detailHTML;
};

function handleErrors(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  handleErrors,
  getNav: Util.getNav,
  buildClassificationList: Util.buildClassificationList,
  buildClassificationGrid: Util.buildClassificationGrid,
  buildCarDetail: Util.buildCarDetail
}
