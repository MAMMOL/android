// api/productos.js — Serverless Function para Vercel
const { Pool } = require('pg');

// Pool se crea por invocación para evitar problemas de conexión en serverless
function createPool() {
  return new Pool({
    user:            process.env.POSTGRESS_USER_QUERY,
    host:            process.env.POSTGRESS_HOST || '185.139.1.178',
    database:        process.env.POSTGRESS_DB_QUERY,
    password:        process.env.POSTGRESS_PASSWORD_QUERY,
    port:            5432,
    ssl:             { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis:       10000,
    max:                     1,   // serverless: 1 conexión por invocación
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  // Verificar que las variables de entorno existan
  const { POSTGRESS_USER_QUERY, POSTGRESS_DB_QUERY, POSTGRESS_PASSWORD_QUERY } = process.env;
  if (!POSTGRESS_USER_QUERY || !POSTGRESS_DB_QUERY || !POSTGRESS_PASSWORD_QUERY) {
    return res.status(500).json({
      success: false,
      error: 'Faltan variables de entorno: ' + [
        !POSTGRESS_USER_QUERY    && 'POSTGRESS_USER_QUERY',
        !POSTGRESS_DB_QUERY      && 'POSTGRESS_DB_QUERY',
        !POSTGRESS_PASSWORD_QUERY && 'POSTGRESS_PASSWORD_QUERY',
      ].filter(Boolean).join(', ')
    });
  }

  const pool = createPool();
  const { usuario } = req.query;

  try {
    let result;

    if (usuario) {
      result = await pool.query(`
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
      `, [usuario]);
    } else {
      result = await pool.query(`
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
      `);
    }

    res.status(200).json({ success: true, productos: result.rows });

  } catch (err) {
    console.error('PostgreSQL error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await pool.end().catch(() => {});
  }
}
