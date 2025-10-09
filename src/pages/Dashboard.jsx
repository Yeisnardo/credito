import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import api, { getUsuarioPorCedula } from '../services/api_usuario';
import { generarResumenUsuario } from '../pdf/generarPdf';

const Dashboard = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [stats, setStats] = useState({
    creditosActivos: 0,
    proximosPagos: 0,
    mensajesNoLeidos: 3
  });

  const handleViewPdf = () => {
  const doc = generarResumenUsuario(user, stats);
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl);
};

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cedula = localStorage.getItem('cedula_usuario');
        if (cedula) {
          const usuario = await getUsuarioPorCedula(cedula);
          if (usuario) {
            setUserState(usuario);
            if (setUser) setUser(usuario);
            
            // Simular datos de estadísticas según el rol
            if (usuario.rol === "Emprendedor") {
              setStats({
                creditosActivos: 2,
                proximosPagos: 1,
                mensajesNoLeidos: 3
              });
            } else if (usuario.rol === "Administrador") {
              setStats({
                creditosActivos: 24,
                proximosPagos: 8,
                mensajesNoLeidos: 5
              });
            } else {
              setStats({
                creditosActivos: 12,
                proximosPagos: 4,
                mensajesNoLeidos: 2
              });
            }
          }
        }
      } catch (error) {
        console.error('Error al obtener usuario por cédula:', error);
      }
    };
    if (!user) fetchUserData();
  }, [setUser, user]);

  // Datos de ejemplo para gráficos
  const chartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    values: [12, 19, 8, 15, 12, 17],
  };

  const recentActivities = [
    { id: 1, action: "Solicitud de crédito aprobada", time: "Hace 2 horas", type: "success" },
    { id: 2, action: "Nuevo mensaje del administrador", time: "Hace 5 horas", type: "info" },
    { id: 3, action: "Pago registrado exitosamente", time: "Ayer", type: "success" },
    { id: 4, action: "Recordatorio: pago pendiente", time: "Ayer", type: "warning" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {menuOpen && <Menu />}

      <div className={`flex-1 flex flex-col transition-margin duration-300 ${menuOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <Header toggleMenu={toggleMenu} />
        
        {/* Contenido */}
        <main className="flex-1 p-6 bg-gray-50">
          {/* Encabezado */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 mt-12">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer">
                <i className="bx bx-home text-3xl text-indigo-600"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Panel Principal</h1>
                <p className="text-gray-600">Bienvenido/a, {user?.nombre_completo?.split(' ')[0] || 'Usuario'}</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 transition-colors">
                <i className="bx bx-filter-alt mr-2"></i> Filtros
              </button>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors">
                <i className="bx bx-plus mr-2"></i> Nueva acción
              </button>
            </div>
          </div>

          {/* Tarjetas de resumen */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Tarjeta 1 - Resumen de usuario */}
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border-l-4 border-indigo-500">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-gray-700 mb-2">Resumen de usuario</h2>
                  <p className="text-gray-600 mb-1 text-sm">
                    <strong>Nombre:</strong> {user?.nombre_completo || "Cargando..."}
                  </p>
                  <p className="text-gray-600 text-sm">
                    <strong>Estatus:</strong> <span className="font-semibold text-green-600">{user?.estatus || "Cargando..."}</span>
                  </p>
                </div>
                <div className="bg-indigo-100 p-2 rounded-full">
                  <i className="bx bx-user-circle text-2xl text-indigo-600"></i>
                </div>
              </div>
              <button
  className="bg-green-600 text-white px-4 py-2 rounded-lg mb-4"
  onClick={handleViewPdf}
>
  Descargar Resumen PDF
</button>
            </div>

            {/* Tarjeta 2 - Créditos activos */}
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border-l-4 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-gray-700 mb-2">Créditos activos</h2>
                  <p className="text-3xl font-bold text-blue-600">{stats.creditosActivos}</p>
                  <p className="text-gray-500 text-sm">Total activos</p>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <i className="bx bx-credit-card text-2xl text-blue-600"></i>
                </div>
              </div>
            </div>

            {/* Tarjeta 3 - Próximos pagos */}
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border-l-4 border-amber-500">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-gray-700 mb-2">Próximos pagos</h2>
                  <p className="text-3xl font-bold text-amber-600">{stats.proximosPagos}</p>
                  <p className="text-gray-500 text-sm">Pendientes</p>
                </div>
                <div className="bg-amber-100 p-2 rounded-full">
                  <i className="bx bx-calendar-event text-2xl text-amber-600"></i>
                </div>
              </div>
            </div>

            {/* Tarjeta 4 - Mensajes */}
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border-l-4 border-purple-500">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-gray-700 mb-2">Mensajes</h2>
                  <p className="text-3xl font-bold text-purple-600">{stats.mensajesNoLeidos}</p>
                  <p className="text-gray-500 text-sm">No leídos</p>
                </div>
                <div className="bg-purple-100 p-2 rounded-full">
                  <i className="bx bx-chat text-2xl text-purple-600"></i>
                </div>
              </div>
            </div>
          </section>

          {/* Gráficos y actividades */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Gráfico de actividad */}
            <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Actividad de créditos</h2>
                <select className="bg-gray-100 border-0 rounded-lg px-3 py-1 text-sm">
                  <option>Últimos 6 meses</option>
                  <option>Último año</option>
                  <option>Últimos 3 meses</option>
                </select>
              </div>
              
              {/* Gráfico simplificado con CSS */}
              <div className="h-64 flex items-end space-x-2 pt-4">
                {chartData.values.map((value, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-gradient-to-t from-indigo-500 to-indigo-300 rounded-t-lg"
                      style={{ height: `${value * 3}px` }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-2">{chartData.labels[index]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actividad reciente */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Actividad reciente</h2>
              
              <div className="space-y-4">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="flex items-start">
                    <div className={`rounded-full p-2 mr-3 ${
                      activity.type === 'success' ? 'bg-green-100 text-green-600' : 
                      activity.type === 'warning' ? 'bg-amber-100 text-amber-600' : 
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <i className={`bx ${
                        activity.type === 'success' ? 'bx-check-circle' : 
                        activity.type === 'warning' ? 'bx-error' : 
                        'bx-info-circle'
                      }`}></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-4 text-center text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                Ver toda la actividad <i className="bx bx-chevron-right"></i>
              </button>
            </div>
          </section>

          {/* Acciones rápidas y noticias */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Acciones rápidas */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Acciones rápidas</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  className="bg-indigo-50 text-indigo-700 p-4 rounded-lg flex flex-col items-center justify-center hover:bg-indigo-100 transition-colors"
                  onClick={() => navigate('/Requeri_solicit')}
                >
                  <i className="bx bx-file text-2xl mb-2"></i>
                  <span className="text-sm font-medium">Solicitar crédito</span>
                </button>
                
                <button 
                  className="bg-green-50 text-green-700 p-4 rounded-lg flex flex-col items-center justify-center hover:bg-green-100 transition-colors"
                  onClick={() => navigate('/cuotas')}
                >
                  <i className="bx bx-credit-card text-2xl mb-2"></i>
                  <span className="text-sm font-medium">Ver cuotas</span>
                </button>
                
                <button 
                  className="bg-blue-50 text-blue-700 p-4 rounded-lg flex flex-col items-center justify-center hover:bg-blue-100 transition-colors"
                  onClick={() => navigate('/Banco')}
                >
                  <i className="bx bx-bank text-2xl mb-2"></i>
                  <span className="text-sm font-medium">Información bancaria</span>
                </button>
                
                <button 
                  className="bg-purple-50 text-purple-700 p-4 rounded-lg flex flex-col items-center justify-center hover:bg-purple-100 transition-colors"
                  onClick={() => navigate('/Aprobacion')}
                >
                  <i className="bx bx-check-shield text-2xl mb-2"></i>
                  <span className="text-sm font-medium">Solicitudes pendientes</span>
                </button>
              </div>
            </div>

            {/* Noticias y actualizaciones */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Noticias y actualizaciones</h2>
              
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm font-medium text-gray-800">Nuevos requisitos para solicitudes</p>
                  <p className="text-xs text-gray-600">Actualizado hace 2 días - Revise los cambios</p>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <p className="text-sm font-medium text-gray-800">Sistema de pagos mejorado</p>
                  <p className="text-xs text-gray-600">Ahora con más opciones de pago disponibles</p>
                </div>
                
                <div className="p-3 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                  <p className="text-sm font-medium text-gray-800">Mantenimiento programado</p>
                  <p className="text-xs text-gray-600">El próximo sábado de 2:00 AM a 6:00 AM</p>
                </div>
              </div>
              
              <button className="w-full mt-4 text-center text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                Ver todas las noticias <i className="bx bx-news"></i>
              </button>
            </div>
          </section>
        </main>

        {/* Pie de página */}
        <footer className="mt-auto p-4 bg-white border-t border-gray-200 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;