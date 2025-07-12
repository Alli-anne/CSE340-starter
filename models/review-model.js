const pool = require("../database")

async function addReview(account_id, inv_id, rating, comment ){
    const sql = `INSERT INTO review (account_id, inv_id, rating, comment)
    VALUES ($1, $2, $3, $4)
    RETURNING * 
`
    const data = await pool.query(sql, [account_id, inv_id, rating, comment])
    return data.rows[0]
}


async function getReviewsByVehicleId(inv_id) {
  const sql = `SELECT * FROM review WHERE inv_id = $1 ORDER BY review_date DESC`
  const data = await pool.query(sql, [inv_id])
  return data.rows
}


async function averageReviews(inv_id) {
 const sql = `SELECT COUNT(*) FROM review WHERE inv_id = $1`;
  const data = await pool.query(sql, [inv_id]);
  return data.rows[0]?.count || 0;
}


module.exports = {
    addReview,
    getReviewsByVehicleId,
    averageReviews
}