// api/productos.js — Serverless Function para Vercel
const { Pool } = require('pg');

const pool = new Pool({
  user:     process.env.POSTGRESS_USER_QUERY,
  host:     process.env.POSTGRESS_HOST || '185.139.1.178',
  database: process.env.POSTGRESS_DB_QUERY,
  password: process.env.POSTGRESS_PASSWORD_QUERY,
  port:     5432,
  ssl:      { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  // CORS por si acaso
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const { usuario } = req.query;

  try {
    let result;

    if (usuario) {
      // Filtrar por usuario delegado (como en tu main.js)
      const query = `
        SELECT
          p."nameProductos"              AS nombre,
          p."descriptionProductos"       AS descripcion,
          p."priceProductos"             AS precio,
          ep."nameEmpresasPaises"        AS empresa,
          ep."namePaisLista"             AS pais,
          ud."nombreUsuariosDelegados"   AS usuario_delegado
        FROM public."empresasPaises" ep
        LEFT JOIN public.productos p
               ON ep."idEmpresasPaises" = p."idEmpresasPaisesProductos"
        LEFT JOIN public."usuariosDelegados" ud
               ON ep."idEmpresasPaises" = ud."idPuestosEmpresasPaises"
        WHERE ud."nombreUsuariosDelegados" = $1
        ORDER BY p."nameProductos"
      `;
      result = await pool.query(query, [usuario]);
    } else {
      // Todos los productos
      const query = `
        SELECT
          p."nameProductos"        AS nombre,
          p."descriptionProductos" AS descripcion,
          p."priceProductos"       AS precio,
          ep."nameEmpresasPaises"  AS empresa,
          ep."namePaisLista"       AS pais
        FROM public.productos p
        LEFT JOIN public."empresasPaises" ep
               ON ep."idEmpresasPaises" = p."idEmpresasPaisesProductos"
        ORDER BY ep."nameEmpresasPaises", p."nameProductos"
      `;
      result = await pool.query(query);
    }

    res.status(200).json({ success: true, productos: result.rows });

  } catch (err) {
    console.error('PostgreSQL error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}
