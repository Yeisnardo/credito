// Importar módulos necesarios
const express = require('express');
const cors = require('cors');

// Importar las rutas específicas para cada entidad, excepto 'emprendedores'
const usuarioRoutes = require('./routes/routes_usuario');
const emprendimientoRoutes = require('./routes/routes_emprendimiento');
const ubicacionRoutes = require('./routes/routes_ubicacion');
const consejoRoutes = require('./routes/routes_consejoComunal');
const personaRoutes = require('./routes/routes_persona'); // Ruta de persona

// Crear la aplicación Express
const app = express();

// Configurar CORS para permitir solicitudes desde el cliente
app.use(cors({ origin: 'http://localhost:5173' }));

// Configurar el parsing de JSON y urlencoded con límite de tamaño
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Definir las rutas de cada entidad
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/emprendimientos', emprendimientoRoutes);
app.use('/api/ubicaciones', ubicacionRoutes);
app.use('/api/consejo_comunal', consejoRoutes);
app.use('/api/persona', personaRoutes); // Ruta para "persona"

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Definir puerto y arrancar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});