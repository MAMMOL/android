// server.js - Servidor web para mostrar productos desde PostgreSQL
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Conexión a PostgreSQL (igual que en tu main.js) ───────────────────────
const pool = new Pool({
  user:     process.env.POSTGRESS_USER_QUERY,
  host:     '185.139.1.178',
  database: process.env.POSTGRESS_DB_QUERY,
  password: process.env.POSTGRESS_PASSWORD_QUERY,
  port:     5432,
  ssl:      { rejectUnauthorized: false }, // igual que NODE_TLS_REJECT_UNAUTHORIZED='0'
});

// ─── Archivos estáticos ─────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname)));

// ─── API: obtener todos los productos ──────────────────────────────────────
app.get('/api/productos', async (req, res) => {
  try {
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
    const result = await pool.query(query);
    res.json({ success: true, productos: result.rows });
  } catch (err) {
    console.error('Error al consultar productos:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── API: obtener productos por usuario delegado (como en tu main.js) ───────
app.get('/api/productos/:usuario', async (req, res) => {
  const { usuario } = req.params;
  try {
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
    `;
    const result = await pool.query(query, [usuario]);
    res.json({ success: true, productos: result.rows });
  } catch (err) {
    console.error('Error al consultar productos por usuario:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Página principal ───────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ─── Iniciar servidor ───────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
