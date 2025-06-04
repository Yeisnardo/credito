import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";

const Depositos = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [depositos, setDepositos] = useState([]); // Datos ficticios
  const [loading, setLoading] = useState(true);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Datos ficticios
  const usuarioFicticio = {
    id: 1,
    nombre: "Juan Pérez",
  };

  const depositosFicticios = [
    {
      id: 101,
      monto: 1500,
      fecha: "2023-10-01",
      confirmado: false,
    },
    {
      id: 102,
      monto: 2500,
      fecha: "2023-10-05",
      confirmado: false,
    },
    {
      id: 103,
      monto: 3000,
      fecha: "2023-10-10",
      confirmado: true,
    },
  ];

  useEffect(() => {
    // Simulación de carga de datos
    setUser(usuarioFicticio);
    setTimeout(() => {
      setDepositos(depositosFicticios);
      setLoading(false);
    }, 500);
  }, []);

  const confirmarDeposito = (depositoId) => {
    setDepositos((prevDepositos) =>
      prevDepositos.map((dep) =>
        dep.id === depositoId ? { ...dep, confirmado: true } : dep
      )
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {menuOpen && <Menu />}
      <div className="flex-1 flex flex-col ml-0 md:ml-64">
        <Header user={user} toggleMenu={toggleMenu} menuOpen={menuOpen} />

        {/* Contenido principal */}
        <div className="pt-20 px-8">
          {/* Encabezado */}
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-500 p-3 rounded-full shadow-lg text-white">
                <i className="bx bx-home text-2xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Inicio</h1>
            </div>
          </header>

          {/* Sección de depósitos */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Depósitos Realizados</h2>
            {depositos.length === 0 ? (
              <p>No tienes depósitos registrados.</p>
            ) : (
              <table className="min-w-full bg-white border border-gray-200 rounded-lg mb-8">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border-b">ID</th>
                    <th className="px-4 py-2 border-b">Monto</th>
                    <th className="px-4 py-2 border-b">Fecha</th>
                    <th className="px-4 py-2 border-b">Estado</th>
                    <th className="px-4 py-2 border-b">Confirmar</th>
                  </tr>
                </thead>
                <tbody>
                  {depositos.map((dep) => (
                    <tr key={dep.id} className="hover:bg-gray-100">
                      <td className="px-4 py-2 border-b">{dep.id}</td>
                      <td className="px-4 py-2 border-b">${dep.monto}</td>
                      <td className="px-4 py-2 border-b">{dep.fecha}</td>
                      <td className="px-4 py-2 border-b">
                        {dep.confirmado ? (
                          <span className="text-green-600 font-semibold">Recibido</span>
                        ) : (
                          <span className="text-yellow-600 font-semibold">Pendiente</span>
                        )}
                      </td>
                      <td className="px-4 py-2 border-b">
                        {!dep.confirmado && (
                          <button
                            className="bg-blue-500 text-white px-3 py-1 rounded"
                            onClick={() => confirmarDeposito(dep.id)}
                          >
                            Ya cayó
                          </button>
                        )}
                        {dep.confirmado && <span>Confirmado</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
        {/* Pie de página */}
        <footer className="mt-auto p-4 text-center text-gray-500 bg-gray-100 border-t border-gray-300">
          © {new Date().getFullYear()} TuEmpresa. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Depositos;