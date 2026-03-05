// api/datos.js — Serverless Function para Vercel
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  // Variables de entorno
  const user     = process.env.PG_USER;
  const host     = process.env.PG_HOST || '185.139.1.178';
  const database = process.env.PG_DATABASE;
  const password = process.env.PG_PASSWORD;
  const port     = parseInt(process.env.PG_PORT || '5432');

  const faltantes = [
    !user     && 'PG_USER',
    !database && 'PG_DATABASE',
    !password && 'PG_PASSWORD',
  ].filter(Boolean);

  if (faltantes.length > 0) {
    return res.status(500).json({
      success: false,
      error: 'Faltan variables de entorno: ' + faltantes.join(', '),
      ayuda: 'Configurarlas en Vercel → Settings → Environment Variables',
    });
  }

  let Pool;
  try {
    Pool = require('pg').Pool;
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: 'No se pudo cargar "pg": ' + e.message,
      ayuda: 'Ejecutá: npm install pg',
    });
  }

  const pool = new Pool({
    user,
    host,
    database,
    password,
    port,
    ssl: { rejectUnauthorized: false },
    max: 1,
    connectionTimeoutMillis: 8000,
  });

  try {
    // Traer todas las tablas disponibles en el schema public
    const tablas = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    // Determinar qué tabla mostrar
    const tablaParam = req.query.tabla;
    const tablasDisponibles = tablas.rows.map(r => r.table_name);

    let muestra = null;
    let tablaNombre = null;

    // Si viene ?tabla= en la query, usar esa; sino usar la primera
    if (tablaParam && tablasDisponibles.includes(tablaParam)) {
      tablaNombre = tablaParam;
    } else if (tablasDisponibles.length > 0) {
      tablaNombre = tablasDisponibles[0];
    }

    if (tablaNombre) {
      const datos = await pool.query(
        `SELECT * FROM public."${tablaNombre}" LIMIT 10`
      );
      muestra = {
        tabla: tablaNombre,
        columnas: datos.fields.map(f => f.name),
        filas: datos.rows,
        total_filas: datos.rowCount,
      };
    }

    return res.status(200).json({
      success: true,
      conexion: 'OK',
      base_de_datos: database,
      tablas_encontradas: tablas.rows.map(r => r.table_name),
      muestra,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
      codigo: err.code || null,
    });
  } finally {
    await pool.end().catch(() => {});
  }
};
