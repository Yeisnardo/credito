const express = require('express');
const cors = require('cors');

// Importamos todos los archivos consolidados
const personaAPI = require('./controllers/persona');
const usuarioAPI = require('./controllers/usuario');
const fondoAPI = require('./controllers/fondo');
const contratoAPI = require('./controllers/contrato');
const cuentaAPI = require('./controllers/banco');
const clasificacion_requerimientoAPI = require('./controllers/clasificacion_requerimiento');
const solicitudAPI = require('./controllers/solicitud');
const emprendimientoAPI = require('./controllers/empredimiento');
const requerimientoEmprendedorAPI = require('./controllers/requerimiento');
const clasificacionEmprendimientoEmprendedorAPI = require('./controllers/clasificacion_emprendimiento');

const app = express();

// Middlewares básicos
app.use(cors({ origin: 'https://credito-2.onrender.com' }));
app.use(express.json());


// Rutas consolidadas
app.use('/api/persona', personaAPI);
app.use('/api/usuarios', usuarioAPI);
app.use('/api/fondos', fondoAPI);
app.use('/api/contrato', contratoAPI);
app.use('/api/cuenta', cuentaAPI);
app.use('/api/requerimientos', clasificacion_requerimientoAPI); 
app.use('/api/emprendimientos', emprendimientoAPI);
app.use('/api/solicitudes', solicitudAPI); 
app.use('/api/requerimiento_emprendedor', requerimientoEmprendedorAPI); 
app.use('/api/clasificacion', clasificacionEmprendimientoEmprendedorAPI);

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
  console.log('   /api/contrato');
  console.log('   /api/banco');
  console.log('   /api/requerimientos');
  console.log('   /api/emprendimientos');
  console.log('   /api/solicitudes');
  console.log('   /api/requerimiento_emprendedor');
  console.log('   /api/clasificacion');
});
