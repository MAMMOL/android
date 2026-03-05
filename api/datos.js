// api/datos.js — Serverless Function para Vercel (DEBUG)
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  console.log('=== INICIO REQUEST ===');

  const user     = process.env.PG_USER;
  const host     = process.env.PG_HOST || '185.139.1.178';
  const database = process.env.PG_DATABASE;
  const password = process.env.PG_PASSWORD;
  const port     = parseInt(process.env.PG_PORT || '5432');

  console.log('Variables:', {
    PG_USER:     user     ? user + ' OK'  : 'FALTA',
    PG_HOST:     host,
    PG_DATABASE: database ? database + ' OK' : 'FALTA',
    PG_PASSWORD: password ? 'OK' : 'FALTA',
    PG_PORT:     port,
  });

  const faltantes = [
    !user     && 'PG_USER',
    !database && 'PG_DATABASE',
    !password && 'PG_PASSWORD',
  ].filter(Boolean);

  if (faltantes.length > 0) {
    console.log('FALTAN VARIABLES:', faltantes);
    return res.status(500).json({
      success: false,
      paso: 'variables_entorno',
      error: 'Faltan variables: ' + faltantes.join(', '),
    });
  }

  let Pool;
  try {
    Pool = require('pg').Pool;
    console.log('Modulo pg cargado OK');
  } catch (e) {
    console.log('Error cargando pg:', e.message);
    return res.status(500).json({
      success: false,
      paso: 'cargar_pg',
      error: e.message,
    });
  }

  console.log('Conectando a ' + host + ':' + port + ' db=' + database);

  const pool = new Pool({
    user, host, database, password, port,
    ssl: { rejectUnauthorized: false },
    max: 1,
    connectionTimeoutMillis: 8000,
  });

  try {
    console.log('Ejecutando query...');
    const tablas = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    console.log('Tablas encontradas:', tablas.rows.map(r => r.table_name));

    const tablasDisponibles = tablas.rows.map(r => r.table_name);
    const tablaParam = req.query.tabla;
    let tablaNombre = (tablaParam && tablasDisponibles.includes(tablaParam))
      ? tablaParam
      : tablasDisponibles[0] || null;

    let muestra = null;
    if (tablaNombre) {
      console.log('Trayendo datos de:', tablaNombre);
      const datos = await pool.query(`SELECT * FROM public."${tablaNombre}" LIMIT 10`);
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
      tablas_encontradas: tablasDisponibles,
      muestra,
    });

  } catch (err) {
    console.log('ERROR en query:', err.message, 'codigo:', err.code);
    return res.status(500).json({
      success: false,
      paso: 'consulta_db',
      error: err.message,
      codigo: err.code || null,
      detalle: err.detail || null,
    });
  } finally {
    await pool.end().catch(() => {});
    console.log('=== FIN REQUEST ===');
  }
};
