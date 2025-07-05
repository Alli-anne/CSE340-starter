const pool = require("../database/")


/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = `
      INSERT INTO account 
        (account_firstname, account_lastname, account_email, account_password, account_type) 
      VALUES 
        ($1, $2, $3, $4, 'Client') 
      RETURNING *;
    `
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    ])
    return result.rows[0] // Return the inserted account data
  } catch (error) {
    console.error("Database error in registerAccount:", error)
    return null // Don't return error.message here, it breaks consistency
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}
/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

async function updateAccount(firstName, lastName, email, accountId) {
  try {
    const sql = `
      UPDATE account
      SET account_firstname = $1,
          account_lastname = $2,
          account_email = $3
      WHERE account_id = $4
      RETURNING account_id
    `
    const values = [firstName, lastName, email, accountId]

    const result = await pool.query(sql, values)

    // If the update affected a row, result.rowCount or result.rows.length will tell you
    if (result.rowCount > 0) {
      return true
    }
    return false
  } catch (error) {
    console.error("Error updating account: ", error)
    return false
  }
}
async function getAccountById(account_id) {
  try {
    const sql = `
      SELECT account_id, account_firstname, account_lastname, account_email, account_type
      FROM account
      WHERE account_id = $1
    `
    const result = await pool.query(sql, [account_id])
    return result.rows[0]
  } catch (error) {
    console.error("Error in getAccountById:", error)
    return null
  }
}
async function updatePassword(accountId, hashedPassword) {
  try {
    const sql = `
      UPDATE account
      SET account_password = $1
      WHERE account_id = $2
    `
    const result = await pool.query(sql, [hashedPassword, accountId])
    return result.rowCount > 0
  } catch (error) {
    console.error("Error updating password:", error)
    return false
  }
}
/* **********************
 *   Check for existing email
 * ********************* */

module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  updateAccount,
  getAccountById,
  updatePassword
}
