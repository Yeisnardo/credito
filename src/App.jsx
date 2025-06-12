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
  const [menuOpen, setMenuOpen] = useState(false);

  // Verificar si hay usuario en localStorage al cargar
  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Función para proteger rutas
  const PrivateRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router>

      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/RegistroEmprendedor" element={<RegistroEmprendedor />} />

        {/* Rutas protegidas */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/Dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/Requerimiento"
          element={
            <PrivateRoute>
              <Requerimiento />
            </PrivateRoute>
          }
        />
        <Route
          path="/Solicitud"
          element={
            <PrivateRoute>
              <Solicitud />
            </PrivateRoute>
          }
        />
        <Route
          path="/Depositos"
          element={
            <PrivateRoute>
              <Depositos />
            </PrivateRoute>
          }
        />
        <Route
          path="/Cuotas"
          element={
            <PrivateRoute>
              <Cuotas />
            </PrivateRoute>
          }
        />
        <Route
          path="/Usuario"
          element={
            <PrivateRoute>
              <Usuario />
            </PrivateRoute>
          }
        />
        <Route
          path="/Perfil_emprendedores"
          element={
            <PrivateRoute>
              <Perfil_emprendedores />
            </PrivateRoute>
          }
        />
        <Route
          path="/Emprendimiento"
          element={
            <PrivateRoute>
              <Emprendimiento />
            </PrivateRoute>
          }
        />
        <Route
          path="/Gestion"
          element={
            <PrivateRoute>
              <Gestion />
            </PrivateRoute>
          }
        />
        <Route
          path="/Aprobacion"
          element={
            <PrivateRoute>
              <Aprobacion />
            </PrivateRoute>
          }
        />
        <Route
          path="/Fondo"
          element={
            <PrivateRoute>
              <Fondo />
            </PrivateRoute>
          }
        />
        <Route
          path="/ConfirmacionCuota"
          element={
            <PrivateRoute>
              <ConfirmacionCuota />
            </PrivateRoute>
          }
        />
        <Route
          path="/Amortizacion"
          element={
            <PrivateRoute>
              <Amortizacion />
            </PrivateRoute>
          }
        />
        <Route
          path="/Credito"
          element={
            <PrivateRoute>
              <Credito />
            </PrivateRoute>
          }
        />
        {/* Redirección a login si ruta no encontrada */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;