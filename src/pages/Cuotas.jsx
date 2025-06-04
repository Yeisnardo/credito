import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";
import api from "../services/api_usuario"; // Tu API

const Cuotas = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUser] = useState(null);

  // Datos de cuotas
  const [cuotas, setCuotas] = useState([
    { id: 1, monto: 100, descripcion: "Cuota 1", pagada: false },
    { id: 2, monto: 200, descripcion: "Cuota 2", pagada: false },
  ]);

  // Datos de semanas y oportunidades
  const [semanas, setSemanas] = useState([
    { semana: 1, oportunidad: 1, pagada: false, cuotaId: 1 },
    { semana: 2, oportunidad: 1, pagada: false, cuotaId: 2 },
    { semana: 3, oportunidad: 2, pagada: false, cuotaId: null },
    { semana: 4, oportunidad: 2, pagada: false, cuotaId: null },
  ]);

  // Estado para formulario
  const [nuevoMonto, setNuevoMonto] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.getUsers();
        if (response.length > 0) {
          setUser(response[0]);
        }
      } catch (error) {
        console.error("Error al obtener los usuarios:", error);
      }
    };
    fetchUserData();
  }, []);

  const agregarCuota = () => {
    if (nuevoMonto && nuevaDescripcion) {
      const nuevaCuota = {
        id: cuotas.length + 1,
        monto: parseFloat(nuevoMonto),
        descripcion: nuevaDescripcion,
        pagada: false,
      };
      setCuotas([...cuotas, nuevaCuota]);
      setNuevoMonto('');
      setNuevaDescripcion('');
    } else {
      alert("Por favor ingresa monto y descripción");
    }
  };

  // Función para amortizar semana
  const amortizarSemana = (semana, oportunidad) => {
    setSemanas(prev =>
      prev.map(s =>
        s.semana === semana && s.oportunidad === oportunidad
          ? { ...s, pagada: true }
          : s
      )
    );
  };

  // Función para pagar cuota
  const pagarCuota = (cuotaId) => {
    setCuotas(prev =>
      prev.map(c => (c.id === cuotaId ? { ...c, pagada: true } : c))
    );
  };

  // Unir en una sola estructura para mostrar en una tabla
  const filas = semanas.map((s) => {
    const cuota = cuotas.find(c => c.id === s.cuotaId);
    return {
      semana: s.semana,
      oportunidad: s.oportunidad,
      semanaPagada: s.pagada,
      cuota: cuota,
      cuotaPagada: cuota ? cuota.pagada : null,
      semanaPagada: s.pagada,
    };
  });

  const semanasNoPagadas = semanas.filter(s => !s.pagada);

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

          {/* Tabla combinada */}
          <h2 className="text-2xl font-semibold mb-4">Gestión Integral: Semanas, Oportunidades y Cuotas</h2>
          <div className="overflow-x-auto mb-8">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b">Semana</th>
                  <th className="px-4 py-2 border-b">Oportunidad</th>
                  <th className="px-4 py-2 border-b">Semana Pagada</th>
                  <th className="px-4 py-2 border-b">Cuota</th>
                  <th className="px-4 py-2 border-b">Cuota Pagada</th>
                  <th className="px-4 py-2 border-b">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {semanas.map((s, index) => {
                  const cuota = cuotas.find(c => c.id === s.cuotaId);
                  return (
                    <tr key={index} className="hover:bg-gray-100">
                      <td className="px-4 py-2 border-b">{s.semana}</td>
                      <td className="px-4 py-2 border-b">{s.oportunidad}</td>
                      <td className="px-4 py-2 border-b">
                        {s.pagada ? (
                          <span className="text-green-600 font-semibold">Sí</span>
                        ) : (
                          <span className="text-red-600 font-semibold">No</span>
                        )}
                      </td>
                      <td className="px-4 py-2 border-b">
                        {cuota ? cuota.descripcion : "N/A"}
                      </td>
                      <td className="px-4 py-2 border-b">
                        {cuota ? (
                          cuota.pagada ? (
                            <span className="text-green-600 font-semibold">Sí</span>
                          ) : (
                            <span className="text-red-600 font-semibold">No</span>
                          )
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-4 py-2 border-b">
                        {!s.pagada && (
                          <button
                            className="bg-indigo-500 text-white px-3 py-1 rounded mb-1"
                            onClick={() => amortizarSemana(s.semana, s.oportunidad)}
                          >
                            Marcar como pagada
                          </button>
                        )}
                        {cuota && !cuota.pagada && (
                          <button
                            className="bg-yellow-500 text-white px-3 py-1 rounded"
                            onClick={() => pagarCuota(cuota.id)}
                          >
                            Pagar Cuota
                          </button>
                        )}
                        {s.pagada && <div className="text-green-600 font-semibold">Semana pagada</div>}
                        {cuota && cuota.pagada && (
                          <div className="text-green-600 font-semibold">Cuota pagada</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Resumen de semanas no pagadas */}
          <div className="p-4 bg-gray-50 rounded-lg border mb-8">
            <h3 className="text-xl font-semibold mb-2">Semanas no pagadas</h3>
            {semanasNoPagadas.length === 0 ? (
              <p>¡Todas las semanas están amortizadas!</p>
            ) : (
              <ul className="list-disc list-inside">
                {semanasNoPagadas.map((s, index) => (
                  <li key={index}>Semana {s.semana} - Oportunidad {s.oportunidad}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Pie */}
        <footer className="mt-auto p-4 text-center text-gray-500 bg-gray-100 border-t border-gray-300">
          © {new Date().getFullYear()} TuEmpresa. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Cuotas;