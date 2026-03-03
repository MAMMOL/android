const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.POSTGRESS_USER_QUERY,
  host: process.env.POSTGRESS_HOST,
  database: process.env.POSTGRESS_DB_QUERY,
  password: process.env.POSTGRESS_PASSWORD_QUERY,
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM productos");

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
