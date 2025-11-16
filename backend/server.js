// server.js o tu archivo principal
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Importa tus routers
const depositoRouter = require('./controllers/deposito');
// Importa tus demás routers
const personaAPI = require('./controllers/persona');
const emprendimientoAPI = require('./controllers/empredimiento');
const usuarioAPI = require('./controllers/usuario');
const solicitudAPI = require('./controllers/solicitud');
const archivoAPI = require('./controllers/archivo');
const cuentaAPI = require('./controllers/banco');
const fondoAPI = require('./controllers/fondo');
const contratoAPI = require('./controllers/contrato');
const coutaAPI = require('./controllers/cuotas');
const clasificacion_requerimientoAPI = require('./controllers/clasificacion_requerimiento');
const requerimientoEmprendedorAPI = require('./controllers/requerimiento');
const clasificacionEmprendimientoEmprendedorAPI = require('./controllers/clasificacion_emprendimiento');
const configAPi = require('./controllers/configuracion_contratos');
const RespaldoAPi = require('./routes/backupRoutes');
const BitacoraAPi = require('./controllers/bitacora');
const FiadorAPi = require('./controllers/fiador');
const FiadoresAPi = require('./controllers/fiador_solicitud');

const app = express();

// Middlewares
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Configuración de la carpeta uploads
const uploadsPath = path.join(__dirname, 'uploads');

// Crear la carpeta uploads si no existe
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}

// Servir archivos estáticos en /uploads
app.use('/uploads', express.static(uploadsPath));

// Rutas principales
app.use('/api/persona', personaAPI);
app.use('/api/usuarios', usuarioAPI);
app.use('/api/fondos', fondoAPI);
app.use('/api/cuenta', cuentaAPI);
app.use('/api/requerimientos', clasificacion_requerimientoAPI);
app.use('/api/emprendimientos', emprendimientoAPI);
app.use('/api/solicitudes', solicitudAPI);
app.use('/api/archivo', archivoAPI);
app.use('/api/contratos', contratoAPI);
app.use('/api/deposito', depositoRouter);
app.use('/api/cuotas', coutaAPI);
app.use('/api/requerimiento_emprendedor', requerimientoEmprendedorAPI);
app.use('/api/clasificacion', clasificacionEmprendimientoEmprendedorAPI);
app.use('/api/configuracion', configAPi);
app.use('/api/backup', RespaldoAPi);
app.use('/api/bitacora', BitacoraAPi);
app.use('/api/requerimientos-fiador', FiadorAPi);
app.use('/api/fiadores', FiadoresAPi);

app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 


// Si estás en producción, asegúrate de que la carpeta uploads exista
console.log('Ruta de uploads:', path.join(__dirname, 'uploads'));

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
  console.log('   /api/persona');
  console.log('   /api/usuarios');
  console.log('   /api/fondos');
  console.log('   /api/cuenta');
  console.log('   /api/requerimientos');
  console.log('   /api/emprendimientos');
  console.log('   /api/solicitudes');
  console.log('   /api/archivo');
  console.log('   /api/contratos');
  console.log('   /api/deposito');
  console.log('   /api/cuotas');
  console.log('   /api/requerimiento_emprendedor');
  console.log('   /api/clasificacion');
  console.log('   /api/configuracion');
  console.log('   /api/backup');
  console.log('   /api/bitacora');
  console.log('   /api/requerimientos-fiador');
  console.log('   /api/fiadores');
});