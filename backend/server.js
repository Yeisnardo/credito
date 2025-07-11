const express = require('express');
const cors = require('cors');

// Importamos todos los archivos consolidados
const personaAPI = require('./controllers/persona');
const usuarioAPI = require('./controllers/usuario');
const fondoAPI = require('./controllers/fondo');
const requerimientoAPI = require('./controllers/empredimiento');

const app = express();

// Middlewares básicos
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Rutas consolidadas
app.use('/api/personas', personaAPI);
app.use('/api/usuarios', usuarioAPI);
app.use('/api/fondos', fondoAPI);
app.use('/api/requerimientos', requerimientoAPI);

// Middleware de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log('🔍 Endpoints disponibles:');
  console.log('   /api/personas');
  console.log('   /api/usuarios');
  console.log('   /api/fondos');
  console.log('   /api/requerimientos');
});
