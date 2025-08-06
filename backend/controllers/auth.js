const express = require('express');
const router = express.Router();
const { query } = require('../config/conexion');

router.post('/login', async (req, res) => {
  try {
    const { usuario, clave } = req.body;  
    const result = await query('SELECT * FROM usuarios WHERE usuario = $1 AND clave = $2', [usuario, clave]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    res.json({
      id: result.rows[0].id,
      usuario: result.rows[0].usuario,
      rol: result.rows[0].rol,
      token: 'token_simulado'
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;