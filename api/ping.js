// api/ping.js — Test de conectividad TCP puro
const net = require('net');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const host = process.env.PG_HOST || '185.139.1.178';
  const port = 5432;

  console.log(`Test TCP a ${host}:${port}`);

  const resultado = await new Promise((resolve) => {
    const socket = new net.Socket();
    const inicio = Date.now();

    socket.setTimeout(8000);

    socket.connect(port, host, () => {
      const ms = Date.now() - inicio;
      console.log(`CONECTADO en ${ms}ms`);
      socket.destroy();
      resolve({ conectado: true, ms });
    });

    socket.on('timeout', () => {
      console.log('TIMEOUT');
      socket.destroy();
      resolve({ conectado: false, razon: 'timeout después de 8 segundos' });
    });

    socket.on('error', (err) => {
      console.log('ERROR TCP:', err.message);
      socket.destroy();
      resolve({ conectado: false, razon: err.message, codigo: err.code });
    });
  });

  return res.status(200).json({
    host,
    port,
    ...resultado,
  });
};
