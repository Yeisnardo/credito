const express = require('express');
const cors = require('cors');

// Importamos todos los archivos consolidados
const personaAPI = require('./controllers/persona');
const usuarioAPI = require('./controllers/usuario');
const fondoAPI = require('./controllers/fondo');
const contratoAPI = require('./controllers/contrato');
const clasificacion_requerimientoAPI = require('./controllers/clasificacion_requerimiento'); // Asegúrate de que la ruta sea correcta
const emprendimientoAPI = require('./controllers/empredimiento'); // Importa el controlador de emprendimientos
const solicitudAPI = require('./controllers/solicitud'); // Importa el controlador de solicitudes
const requerimientoEmprendedorAPI = require('./controllers/requerimiento'); // Importa el controlador de requerimientos de emprendedores
const clasificacionEmprendimientoEmprendedorAPI = require('./controllers/clasificacion_emprendimiento'); // Importa el controlador de requerimientos de clasificacion de empredimietos

const app = express();

// Middlewares básicos
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Rutas consolidadas
app.use('/api/persona', personaAPI);
app.use('/api/usuarios', usuarioAPI);
app.use('/api/fondos', fondoAPI);
app.use('/api/contrato', contratoAPI);
app.use('/api/requerimientos', clasificacion_requerimientoAPI); // Aquí agregamos la API de requerimientos
app.use('/api/emprendimientos', emprendimientoAPI); // Aquí agregamos la API de emprendimientos
app.use('/api/solicitudes', solicitudAPI); // Aquí agregamos la API de solicitudes
app.use('/api/requerimiento_emprendedor', requerimientoEmprendedorAPI); // Aquí agregamos la API de requerimientos de emprendedores
app.use('/api/clasificacion', clasificacionEmprendimientoEmprendedorAPI); // Aquí agregamos la API de requerimientos de emprendedores

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
  console.log('   /api/requerimientos'); // Endpoint de requerimientos
  console.log('   /api/emprendimientos'); // Endpoint de emprendimientos
  console.log('   /api/solicitudes'); // Endpoint de solicitudes
  console.log('   /api/requerimiento_emprendedor'); // Endpoint de requerimientos de emprendedores
  console.log('   /api/clasificacion'); // Endpoint de requerimientos de emprendedores
});
