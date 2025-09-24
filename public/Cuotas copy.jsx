import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import apiConfiguracion from "../services/api_configuracion_contratos";
import apiUsuario from "../services/api_usuario";
import apiCuotas from "../services/api_cuotas";

const Dashboard = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [configuracion, setConfiguracion] = useState(null);
  const [cuotas, setCuotas] = useState([]); // Estado para cuotas

  // Cargar cuotas automáticamente según configuración
  useEffect(() => {
  const fetchCuotas = async () => {
    try {
      if (user?.cedula) {
        const cuotasData = await apiCuotas.getContratoPorId(user.cedula);
        console.log("Datos de cuotas obtenidos:", cuotasData); // Aquí el console.log
        setCuotas(cuotasData);
      }
    } catch (error) {
      console.error("Error al obtener cuotas:", error);
    }
  };
  fetchCuotas();
}, [user]);

  // Cargar usuario
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cedula = localStorage.getItem("cedula_usuario");
        if (cedula) {
          const usuario = await apiUsuario.getUsuarioPorCedula(cedula);
          if (usuario) {
            setUserState(usuario);
            if (setUser) setUser(usuario);
          }
        }
      } catch (error) {
        console.error("Error al obtener usuario:", error);
      }
    };
    if (!user) fetchUserData();
  }, [setUser, user]);

  // Cargar configuración y generar cuotas de gracia automáticamente
  useEffect(() => {
    const fetchConfiguracion = async () => {
      try {
        const config = await apiConfiguracion.getConfiguracion();
        setConfiguracion(config);
        if (config) {
          const cuotasGeneradas = calcularCuotas(config);
          setCuotas(cuotasGeneradas);
        }
      } catch (error) {
        console.error("Error al obtener configuración:", error);
      }
    };
    fetchConfiguracion();
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Función para calcular cuotas, incluyendo cuotas de gracia
  const calcularCuotas = (config) => {
    const {
      numero_cuotas,
      frecuencia_pago,
      dias_personalizados,
      cuotasGracia,
    } = config;

    const totalCuotas = Number(numero_cuotas) || 0;
    const cuotasGraciaNum = Number(cuotasGracia) || 0;
    const diasPersonalizadosNum = Number(dias_personalizados) || 0;
    const hoy = new Date();

    const cuotasArray = [];

    // Generar cuotas de gracia primero
    for (let i = 1; i <= cuotasGraciaNum; i++) {
      const desde = new Date(hoy);
      const hasta = new Date(hoy);
      const offset = i - 1;

      switch (frecuencia_pago) {
        case "diario":
          desde.setDate(hoy.getDate() + offset);
          hasta.setDate(hoy.getDate() + offset);
          break;
        case "semanal":
          desde.setDate(hoy.getDate() + offset * 7);
          hasta.setDate(hoy.getDate() + offset * 7);
          break;
        case "quincenal":
          desde.setDate(hoy.getDate() + offset * 15);
          hasta.setDate(hoy.getDate() + offset * 15);
          break;
        case "mensual":
          desde.setMonth(hoy.getMonth() + offset);
          hasta.setMonth(hoy.getMonth() + offset);
          break;
        case "personalizado":
          desde.setDate(hoy.getDate() + offset * diasPersonalizadosNum);
          hasta.setDate(hoy.getDate() + offset * diasPersonalizadosNum);
          break;
        default:
          desde.setMonth(hoy.getMonth() + offset);
          hasta.setMonth(hoy.getMonth() + offset);
      }

      cuotasArray.push({
        cuota: i,
        tipo: "Gracia",
        desde: desde.toLocaleDateString(),
        hasta: hasta.toLocaleDateString(),
        esGracia: true,
        monto_bs: null,
        monto_semanal: null,
        dias_mora_cuota: null,
        interes_acumulado: null,
        confirmacionIFEMI: null,
      });
    }

    // Generar cuotas regulares
    for (let i = cuotasGraciaNum + 1; i <= totalCuotas + cuotasGraciaNum; i++) {
      const desde = new Date(hoy);
      const hasta = new Date(hoy);
      const offset = i - 1;

      switch (frecuencia_pago) {
        case "diario":
          desde.setDate(hoy.getDate() + offset);
          hasta.setDate(hoy.getDate() + offset);
          break;
        case "semanal":
          desde.setDate(hoy.getDate() + offset * 7);
          hasta.setDate(hoy.getDate() + offset * 7);
          break;
        case "quincenal":
          desde.setDate(hoy.getDate() + offset * 15);
          hasta.setDate(hoy.getDate() + offset * 15);
          break;
        case "mensual":
          desde.setMonth(hoy.getMonth() + offset);
          hasta.setMonth(hoy.getMonth() + offset);
          break;
        case "personalizado":
          desde.setDate(hoy.getDate() + offset * diasPersonalizadosNum);
          hasta.setDate(hoy.getDate() + offset * diasPersonalizadosNum);
          break;
        default:
          desde.setMonth(hoy.getMonth() + offset);
          hasta.setMonth(hoy.getMonth() + offset);
      }

      cuotasArray.push({
        cuota: i,
        tipo: "Pendiente",
        desde: desde.toLocaleDateString(),
        hasta: hasta.toLocaleDateString(),
        esGracia: false,
        monto_bs: null,
        monto_semanal: null,
        dias_mora_cuota: null,
        interes_acumulado: null,
        confirmacionIFEMI: null,
      });
    }

    return cuotasArray;
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {menuOpen && <Menu />}
      <div
        className={`flex-1 flex flex-col transition-margin duration-300 ${
          menuOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <Header toggleMenu={toggleMenu} />

        {/* Contenido principal */}
        <main className="flex-1 p-6 bg-gray-50">
          {/* Encabezado */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 mt-12">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer">
                <i className="bx bx-home text-3xl text-indigo-600"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Panel Principal</h1>
                <p className="text-gray-600">
                  Bienvenido/a, {user?.nombre_completo?.split(" ")[0] || "Usuario"}
                </p>
              </div>
            </div>
          </div>

          {/* Tabla de cuotas */}
          {/* Tabla de cuotas */}
<div className="overflow-x-auto">
  <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
    <thead>
      <tr>
        <th className="border px-4 py-2">Cuota</th>
        <th className="border px-4 py-2">Monto Bs</th>
        <th className="border px-4 py-2">Monto Semanal</th>
        <th className="border px-4 py-2">Tipo</th>
        <th className="border px-4 py-2">Días Mora</th>
        <th className="border px-4 py-2">Interés</th>
        <th className="border px-4 py-2">Confirmación</th>
        <th className="border px-4 py-2">Desde</th>
        <th className="border px-4 py-2">Hasta</th>
      </tr>
    </thead>
    <tbody>
      {cuotas.map((cuota) => (
        <tr
          key={cuota.cuota}
          className={cuota.esGracia ? "bg-yellow-100" : "hover:bg-gray-100"}
        >
          <td className="border px-4 py-2">{cuota.cuota}</td>
          <td className="border px-4 py-2">{cuota.monto_bs}</td>
          <td className="border px-4 py-2">{cuota.monto_semanal}</td>
          <td className="border px-4 py-2">{cuota.tipo}</td>
          <td className="border px-4 py-2">{cuota.dias_mora_cuota}</td>
          <td className="border px-4 py-2">{cuota.interes_acumulado}</td>
          <td className="border px-4 py-2">{cuota.confirmacionIFEMI}</td>
          <td className="border px-4 py-2">{cuota.desde}</td>
          <td className="border px-4 py-2">{cuota.hasta}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;