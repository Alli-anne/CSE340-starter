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
async function getInventoryById(inv_id) {
  const sql = "SELECT * FROM inventory WHERE inv_id = $1";
  const data = await pool.query(sql, [inv_id]);
  return data.rows[0];
}

async function updateInventory(
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
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
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
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}



// In your model file (inventory-model.js)

async function deleteInventoryById(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1';
    const values = [inv_id];
    const result = await pool.query(sql, values);

    // Check if a row was deleted
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }
}





module.exports = {
  getClassifications,
  getInventoryByClassificationId, 
  getCarById,
  addClassification,
  addInventory,
  getInventoryById,
  updateInventory,
  deleteInventoryById
}
