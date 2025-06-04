import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Importación de páginas
import Login from "./pages/Login";
import RegistroEmprendedor from "./pages/RegistroEmprendedor";
import Dashboard from "./pages/Dashboard";
import Solicitud from "./pages/Solicitud";
import Depositos from "./pages/Depositos";
import Cuotas from "./pages/Cuotas";
import Usuario from "./pages/Usuario";
import Perfil_emprendedores from "./pages/Perfil_emprendedores";
import Emprendimiento from "./pages/Emprendimiento";
import Gestion from "./pages/Gestion";
import Aprobacion from "./pages/Aprobacion";
import Fondo from "./pages/Fondo";
import Amortizacion from "./pages/Amortizacion";
import Credito from "./pages/Credito";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/RegistroEmprendedor" element={<RegistroEmprendedor />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Solicitud" element={<Solicitud />} />
        <Route path="/Depositos" element={<Depositos />} />
        <Route path="/Cuotas" element={<Cuotas />} />
        <Route path="/Usuario" element={<Usuario />} />
        <Route path="/Perfil_emprendedores" element={<Perfil_emprendedores />} />
        <Route path="/Emprendimiento" element={<Emprendimiento />} />
        <Route path="/Gestion" element={<Gestion />} />
        <Route path="/Aprobacion" element={<Aprobacion />} />
        <Route path="/Fondo" element={<Fondo />} />
        <Route path="/Amortizacion" element={<Amortizacion />} />
        <Route path="/Credito" element={<Credito />} />
      </Routes>
    </Router>
  );
}

export default App;