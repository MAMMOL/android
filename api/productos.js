// api/productos.js — Serverless Function para Vercel (CommonJS)
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  // 1. Verificar variables de entorno
  const user     = process.env.POSTGRESS_USER_QUERY;
  const host     = process.env.POSTGRESS_HOST || '185.139.1.178';
  const database = process.env.POSTGRESS_DB_QUERY;
  const password = process.env.POSTGRESS_PASSWORD_QUERY;

  const faltantes = [
    !user     && 'POSTGRESS_USER_QUERY',
    !database && 'POSTGRESS_DB_QUERY',
    !password && 'POSTGRESS_PASSWORD_QUERY',
  ].filter(Boolean);

  if (faltantes.length > 0) {
    return res.status(500).json({
      success: false,
      error: 'Faltan variables de entorno en Vercel: ' + faltantes.join(', '),
    });
  }

  // 2. Verificar que pg esté disponible
  let Pool;
  try {
    Pool = require('pg').Pool;
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: 'No se pudo cargar el módulo "pg": ' + e.message,
    });
  }

  // 3. Conectar y consultar
  const pool = new Pool({
    user,
    host,
    database,
    password,
    port: 5432,
    ssl:  { rejectUnauthorized: false },
    max:  1,
    connectionTimeoutMillis: 8000,
  });

  const { usuario } = req.query;

  try {
    let result;

    if (usuario) {
      result = await pool.query(
        `SELECT
           p."nameProductos"            AS nombre,
           p."descriptionProductos"     AS descripcion,
           p."priceProductos"           AS precio,
           ep."nameEmpresasPaises"      AS empresa,
           ep."namePaisLista"           AS pais,
           ud."nombreUsuariosDelegados" AS usuario_delegado
         FROM public."empresasPaises" ep
         LEFT JOIN public.productos p
                ON ep."idEmpresasPaises" = p."idEmpresasPaisesProductos"
         LEFT JOIN public."usuariosDelegados" ud
                ON ep."idEmpresasPaises" = ud."idPuestosEmpresasPaises"
         WHERE ud."nombreUsuariosDelegados" = $1
         ORDER BY p."nameProductos"`,
        [usuario]
      );
    } else {
      result = await pool.query(
        `SELECT
           p."nameProductos"        AS nombre,
           p."descriptionProductos" AS descripcion,
           p."priceProductos"       AS precio,
           ep."nameEmpresasPaises"  AS empresa,
           ep."namePaisLista"       AS pais
         FROM public.productos p
         LEFT JOIN public."empresasPaises" ep
                ON ep."idEmpresasPaises" = p."idEmpresasPaisesProductos"
         ORDER BY ep."nameEmpresasPaises", p."nameProductos"`
      );
    }

    return res.status(200).json({ success: true, productos: result.rows });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
      detalle: err.code || null,
    });
  } finally {
    await pool.end().catch(() => {});
  }
};
