require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRESS_USER_QUERY,
  host: process.env.POSTGRESS_HOST,
  database: process.env.POSTGRESS_DB_QUERY,
  password: process.env.POSTGRESS_PASSWORD_QUERY,
  port: 5432,
});

module.exports = async (req, res) => {
  const { username } = req.query;

  if (!username) {
    res.status(400).json({ error: 'Falta el parámetro username' });
    return;
  }

  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT 
        p."idProductos",
        p."nameProductos",
        p."descriptionProductos",
        p."codigoBarraProductos",
        p."unidadDeMedida",
        p."costeProductos",
        p."priceProductos",
        ep."nameEmpresasPaises",
        ep."namePaisLista"
      FROM public."empresasPaises" ep
      LEFT JOIN public.productos p ON ep."idEmpresasPaises" = p."idEmpresasPaisesProductos"
      LEFT JOIN public."usuariosDelegados" ud ON ep."idEmpresasPaises" = ud."idPuestosEmpresasPaises"
      WHERE ud."nombreUsuariosDelegados" = $1
    `, [username]);
    client.release();
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};