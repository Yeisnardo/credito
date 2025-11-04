import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Importación de páginas
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import FormatoContrato from "./pages/FormatoContrato"
//Emprededor
import RegistroEmprendedor from "./pages/RegistroEmprendedor";
import Requeri_solicit from "./pages/Requeri_solicit";
import Contrato from "./pages/Contrato";
import Depositos from "./pages/Depositos";
import Cuotas from "./pages/Cuotas";
import Banco from "./pages/Banco";


//Administracion IFEMI
import Usuario from "./pages/Usuario";
import Emprendimiento from "./pages/Emprendimiento";
import Gestion from "./pages/Gestion";
import Aprobacion from "./pages/Aprobacion";
import Requerimientos from "./pages/Requerimientos";
import Bitacora from './pages/Bitacora';
import AdministracionCuota from './pages/AdministracionCuota';


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
        <Route path="/" element={<Index />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/RegistroEmprendedor" element={<RegistroEmprendedor />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Requeri_solicit" element={<Requeri_solicit />} />
        <Route path="/Banco" element={<Banco />} />
        <Route path="/Contrato" element={<Contrato />} />
        <Route path="/Depositos" element={<Depositos />} />
        <Route path="/Cuotas" element={<Cuotas />} />
        <Route path="/Usuario" element={<Usuario />} />
        <Route path="/Emprendimiento" element={<Emprendimiento />} />
        <Route path="/Gestion" element={<Gestion />} />
        <Route path="/Aprobacion" element={<Aprobacion />} />
        <Route path="/Requerimientos" element={<Requerimientos />} />
        <Route path='/Bitacora' element={<Bitacora />} />
        <Route path='/AdministracionCuota' element={<AdministracionCuota/>} />
        <Route path='/FormatoContrato' element={<FormatoContrato />} />
      </Routes>
    </Router>
  );
}

export default App;