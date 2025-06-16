const express = require('express');
const cors = require('cors');

const usuarioRoutes = require('./routes/routes_usuario');
const emprendimientoRoutes = require('./routes/routes_emprendimiento');
const personaRoutes = require('./routes/routes_persona');
const perfilRoutes = require('./routes/routes_perfil');
const requerimientoRoutes = require('./routes/routes_requerimiento');
const solicitudRoutes = require('./routes/routes_solicitud');
const clasificacionRoutes = require('./routes/routes_clasificacion');
const aprobacionRoutes = require('./routes/routes_aprobacion');

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/usuarios', usuarioRoutes);
app.use('/api/emprendimientos', emprendimientoRoutes);
app.use('/api/persona', personaRoutes);
app.use('/api/perfiles', perfilRoutes);
app.use('/api/requerimiento', requerimientoRoutes);
app.use('/api/solicitudes', solicitudRoutes);
app.use('/api/clasificacion', clasificacionRoutes);
app.use('/api/aprobacion', aprobacionRoutes);

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});