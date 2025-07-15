const pool = require("../db");

const createVolunteer = async (name, email, message) => {
  const result = await pool.query(
    "INSERT INTO volunteers (name, email, message) VALUES ($1, $2, $3) RETURNING *",
    [name, email, message]
  );
  return result.rows[0];
};

module.exports = { createVolunteer };
