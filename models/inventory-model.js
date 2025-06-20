 const pool = require("../database/")
 
/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
      const data = await pool.query(
        `SELECT * FROM public.inventory AS i 
        JOIN public.classification AS c 
        ON i.classification_id = c.classification_id 
        WHERE i.classification_id = $1`,
        [classification_id] 
      )
      return data.rows
    } catch (error) {
      console.error("getclassificationsbyid error " + error)
    }
}
async function getCarById(carId) {
  try {
    const result = await pool.query(
      "SELECT * FROM inventory WHERE inv_id = $1",
      [carId]
    );
    return result.rows[0]; // just return the first row (the car)
  } catch (error) {
    console.error("Database error getting car by ID:" + error);
  }
}
async function addClassification(classificationName) {
  try {
    console.log("Adding classification to DB:", classificationName);
    const sql = "INSERT INTO classification (classification_name) VALUES ($1)";
    const values = [classificationName];
    const result = await pool.query(sql, values);
    console.log("Insert result:", result);
    return result;
  } catch (error) {
    console.error("Error in addClassification model:", error);
    throw error;
  }
}

async function addInventory(
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
) {
  try {
    const sql = `
      INSERT INTO inventory 
      (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `
    const data = await pool.query(sql, [
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
    ])
    return data // return the inserted row
  } catch (error) {
    console.error("Insert failed:", error)
    throw error
  }
}


module.exports = {
  getClassifications,
  getInventoryByClassificationId, 
  getCarById,
  addClassification,
  addInventory
}
