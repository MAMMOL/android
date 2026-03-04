// api/diagnostico.js — Solo para testear que la función serverless funciona
module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  const vars = {
    POSTGRESS_USER_QUERY:     !!process.env.POSTGRESS_USER_QUERY,
    POSTGRESS_DB_QUERY:       !!process.env.POSTGRESS_DB_QUERY,
    POSTGRESS_PASSWORD_QUERY: !!process.env.POSTGRESS_PASSWORD_QUERY,
    POSTGRESS_HOST:           process.env.POSTGRESS_HOST || '185.139.1.178 (default)',
  };

  let pgDisponible = false;
  let pgError = null;
  try {
    require('pg');
    pgDisponible = true;
  } catch (e) {
    pgError = e.message;
  }

  res.status(200).json({
    ok: true,
    node: process.version,
    variables_de_entorno: vars,
    modulo_pg: { disponible: pgDisponible, error: pgError },
  });
};
