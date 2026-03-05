// api/datos.js — Serverless Function para Vercel (DEBUG v2)
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const user     = process.env.PG_USER;
  const host     = process.env.PG_HOST || '185.139.1.178';
  const database = process.env.PG_DATABASE;
  const password = process.env.PG_PASSWORD;
  const port     = parseInt(process.env.PG_PORT || '5432');

  console.log('Conectando:', { host, port, database, user });

  let Pool;
  try {
    Pool = require('pg').Pool;
  } catch (e) {
    return res.status(500).json({ success: false, paso: 'cargar_pg', error: e.message });
  }

  // Intentar SIN ssl primero
  const pool = new Pool({
    user,
    host,
    database,
    password,
    port,
    ssl: false,
    max: 1,
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log('Ejecutando query sin SSL...');
    const result = await pool.query('SELECT current_database() AS db, now() AS hora');
    console.log('Conexion OK:', result.rows[0]);

    const tablas = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    return res.status(200).json({
      success: true,
      conexion: 'OK sin SSL',
      db_actual: result.rows[0].db,
      hora_servidor: result.rows[0].hora,
      tablas: tablas.rows.map(r => r.table_name),
    });

  } catch (err) {
    console.log('Error sin SSL:', err.message, err.code);
    return res.status(500).json({
      success: false,
      paso: 'consulta_sin_ssl',
      error: err.message,
      codigo: err.code || null,
    });
  } finally {
    await pool.end().catch(() => {});
  }
};
