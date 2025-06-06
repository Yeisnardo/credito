// Importar módulos necesarios
const express = require('express');
const cors = require('cors');

// Importar las rutas específicas para cada entidad, excepto 'emprendedores'
const usuarioRoutes = require('./routes/routes_usuario');
const emprendimientoRoutes = require('./routes/routes_emprendimiento');
const personaRoutes = require('./routes/routes_persona'); // Ruta de persona

// Crear la aplicación Express
const app = express();

// Configurar CORS para permitir solicitudes desde el cliente
app.use(cors({ origin: 'http://localhost:5173' }));

// Middleware para parsear cuerpos en formato JSON
app.use(express.json()); 

// Definir las rutas de cada entidad
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/emprendimientos', emprendimientoRoutes);
app.use('/api/persona', personaRoutes);

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