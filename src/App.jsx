import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Importación de páginas
import Login from "./pages/Login";
import RegistroEmprendedor from "./pages/RegistroEmprendedor";
import Dashboard from "./pages/Dashboard";
import Requerimiento from "./pages/Requerimiento";
import Solicitud from "./pages/Solicitud";
import Depositos from "./pages/Depositos";
import Cuotas from "./pages/Cuotas";
import Usuario from "./pages/Usuario";
import Perfil_emprendedores from "./pages/Perfil_emprendedores";
import Emprendimiento from "./pages/Emprendimiento";
import Gestion from "./pages/Gestion";
import Aprobacion from "./pages/Aprobacion";
import Fondo from "./pages/Fondo";
import ConfirmacionCuota from "./pages/ConfirmacionCuota";
import Amortizacion from "./pages/Amortizacion";
import Credito from "./pages/Credito";

// Importación de componentes adicionales
import Header from './components/Header';

function App() {
  const [user, setUser] = useState(null);

  // Verificar si hay usuario en localStorage al cargar
  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/RegistroEmprendedor" element={<RegistroEmprendedor />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Requerimiento" element={<Requerimiento />} />
        <Route path="/Solicitud" element={<Solicitud />} />
        <Route path="/Depositos" element={<Depositos />} />
        <Route path="/Cuotas" element={<Cuotas />} />
        <Route path="/Usuario" element={<Usuario />} />
        <Route path="/Perfil_emprendedores" element={<Perfil_emprendedores />} />
        <Route path="/Emprendimiento" element={<Emprendimiento />} />
        <Route path="/Gestion" element={<Gestion />} />
        <Route path="/Aprobacion" element={<Aprobacion />} />
        <Route path="/Fondo" element={<Fondo />} />
        <Route path="/ConfirmacionCuota" element={<ConfirmacionCuota />} />
        <Route path="/Amortizacion" element={<Amortizacion />} />
        <Route path="/Credito" element={<Credito />} />

        {/* Redirección a login si ruta no encontrada */}
      </Routes>
    </Router>
  );
}

export default App;