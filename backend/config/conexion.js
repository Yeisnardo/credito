const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',        // reemplaza con tus datos
  host: 'localhost',
  database: 'siccee', // reemplaza con tu base
  password: '13092003',   // reemplaza con tu password
  port: 5432,
});

const query = (text, params) => pool.query(text, params);

    // Middleware de verificación de rol
const verificarRol = (rolesPermitidos) => (req, res, next) => {
  const { rol } = req.usuario;
  
  if (!rolesPermitidos.includes(rol)) {
    return res.status(403).json({ error: 'Acceso no autorizado' });
  }
  next();
};
// Rutas de usuario
app.post('/login', async (req, res) => {
  try {
    const { usuario, clave } = req.body;  
    const query = 'SELECT * FROM usuarios WHERE usuario = $1 AND clave = $2';
    const result = await pool.query(query, [usuario, clave]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    res.json({
      id: result.rows[0].id,
      usuario: result.rows[0].usuario,
      rol: result.rows[0].rol,
      token: 'token_simulado' // En producción usar JWT
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Ruta protegida para admin
app.get('/admin', verificarRol(['admin']), (req, res) => {
  res.json({ message: 'Acceso concedido a administrador' });
});
// Iniciar servidor
app.listen(3000, () => {
  console.log('Servidor ejecutándose en http://localhost:3000');
});

module.exports = { query };

