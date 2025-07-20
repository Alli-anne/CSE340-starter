const pool = require("../database")

async function addReview({ inv_id, account_id, rating, comment }) {
  const sql = `INSERT INTO review (inv_id, account_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *`;
  const values = [inv_id, account_id, rating, comment];
  const result = await pool.query(sql, values);
  return result.rows[0];
}

async function getReviewsByVehicleId(inv_id) {
  const sql = `SELECT * FROM review WHERE inv_id = $1 ORDER BY review_date DESC`
  const data = await pool.query(sql, [inv_id])
  return data.rows
}


async function averageReviews(inv_id) {
   const sql = `
    SELECT 
      AVG(rating) AS avg,
      COUNT(*) AS count
    FROM review
    WHERE inv_id = $1;
  `;
  const data = await pool.query(sql, [inv_id]);
  return data.rows[0]; // { avg: ..., count: ... }
}

async function averageRating(inv_id) {
  const sql = `SELECT AVG(rating) AS avg FROM review WHERE inv_id = $1;`
  const data = await pool.query(sql, [inv_id]);
  return data.rows[0];
}


module.exports = {
    addReview,
    getReviewsByVehicleId,
    averageReviews,
    averageRating
}