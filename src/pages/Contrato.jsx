import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import api, { getUsuarioPorCedula } from '../services/api_usuario';
import { getContratosPorCedulaEmprendedor } from '../services/api_contrato'

const AceptacionContrato = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [contratos, setContratos] = useState([]);
  const [contratoSeleccionado, setContratoSeleccionado] = useState(null);
  const [aceptado, setAceptado] = useState(false);

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
            
            // Obtener contratos del usuario
            const contratosUsuario = await getContratosPorCedulaEmprendedor(cedula);
            setContratos(contratosUsuario);
            
            // Si hay contratos, seleccionar el primero
            if (contratosUsuario.length > 0) {
              setContratoSeleccionado(contratosUsuario[0]);
            }
          }
        }
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };
    
    if (!user) fetchUserData();
  }, [setUser, user]);

  const handleAceptarContrato = async () => {
    if (!contratoSeleccionado) return;
    
    try {
      // Aquí iría la lógica para actualizar el estado del contrato a "Aceptado"
      // await api.aceptarContrato(contratoSeleccionado.id_contrato);
      
      // Simulación de éxito
      setAceptado(true);
      setTimeout(() => {
        navigate('/dashboard'); // Redirigir al dashboard después de aceptar
      }, 2000);
    } catch (error) {
      console.error('Error al aceptar el contrato:', error);
      alert('Error al aceptar el contrato. Intente nuevamente.');
    }
  };

  const formatearMonto = (monto) => {
    return monto ? `€ ${Number(monto).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A';
  };

  const formatearMontoBs = (monto) => {
    return monto ? `Bs. ${Number(monto).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A';
  };

  const formatearFecha = (fecha) => {
    return fecha ? new Date(fecha).toLocaleDateString('es-ES') : 'N/A';
  };

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
                <i className="bx bx-file text-3xl text-indigo-600"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Aceptación de Contrato</h1>
                <p className="text-gray-600">Revise y acepte los términos de su contrato</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button 
                className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 transition-colors"
                onClick={() => navigate(-1)}
              >
                <i className="bx bx-arrow-back mr-2"></i> Volver
              </button>
            </div>
          </div>

          {aceptado ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="bg-green-100 p-4 rounded-full inline-flex mb-6">
                <i className="bx bx-check-circle text-4xl text-green-600"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">¡Contrato Aceptado Exitosamente!</h2>
              <p className="text-gray-600 mb-6">Su contrato ha sido aceptado y procesado correctamente.</p>
              <button 
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                onClick={() => navigate('/dashboard')}
              >
                Ir al Dashboard
              </button>
            </div>
          ) : contratoSeleccionado ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Detalles del contrato */}
              <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Detalles del Contrato</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Número de Contrato</h3>
                    <p className="text-lg font-semibold text-gray-800">{contratoSeleccionado.numero_contrato || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Estado</h3>
                    <p className="text-lg font-semibold">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        contratoSeleccionado.estatus === 'Aprobado' 
                          ? 'bg-green-100 text-green-800' 
                          : contratoSeleccionado.estatus === 'Pendiente'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {contratoSeleccionado.estatus || 'N/A'}
                      </span>
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Monto Aprobado (Euros)</h3>
                    <p className="text-lg font-semibold text-gray-800">{formatearMonto(contratoSeleccionado.monto_aprob_euro)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Monto Aprobado (Bs)</h3>
                    <p className="text-lg font-semibold text-gray-800">{formatearMontoBs(contratoSeleccionado.monto_bs)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">5% Flat</h3>
                    <p className="text-lg font-semibold text-gray-800">{formatearMontoBs(contratoSeleccionado.cincoflat)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">10% Interés</h3>
                    <p className="text-lg font-semibold text-gray-800">{formatearMontoBs(contratoSeleccionado.diezinteres)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Monto a Devolver</h3>
                    <p className="text-lg font-semibold text-gray-800">{formatearMontoBs(contratoSeleccionado.monto_devolver)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Vigencia Desde</h3>
                    <p className="text-lg font-semibold text-gray-800">{formatearFecha(contratoSeleccionado.fecha_desde)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Vigencia Hasta</h3>
                    <p className="text-lg font-semibold text-gray-800">{formatearFecha(contratoSeleccionado.fecha_hasta)}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Términos y Condiciones</h3>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                    <p className="text-sm text-gray-600 mb-3">
                      1. El prestatario se compromete a devolver el monto total del crédito más los intereses establecidos en el plazo acordado.
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      2. El incumplimiento en los pagos generará intereses moratorios según lo establecido en la ley.
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      3. El prestatario autoriza a la institución a verificar su información crediticia y personal para fines de evaluación.
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      4. Cualquier modificación al presente contrato deberá ser por escrito y firmada por ambas partes.
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      5. El prestatario se compromete a utilizar los fondos exclusivamente para los fines establecidos en su solicitud.
                    </p>
                    <p className="text-sm text-gray-600">
                      6. En caso de disputa, ambas partes se someterán a la jurisdicción competente de acuerdo con la ley vigente.
                    </p>
                  </div>
                </div>
              </div>

              {/* Panel de aceptación */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Confirmación</h2>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <i className="bx bx-info-circle text-blue-600 text-xl mr-2 mt-0.5"></i>
                    <div>
                      <p className="text-sm text-blue-800 font-medium">Verifique cuidadosamente</p>
                      <p className="text-xs text-blue-700">
                        Asegúrese de haber leído y comprendido todos los términos del contrato antes de aceptar.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="flex items-start">
                    <input 
                      type="checkbox" 
                      className="mt-1 mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      onChange={(e) => setAceptado(e.target.checked)}
                    />
                    <span className="text-sm text-gray-700">
                      He leído y acepto los términos y condiciones del contrato. Entiendo que estoy obligado a cumplir con todas las cláusulas establecidas.
                    </span>
                  </label>
                </div>
                
                <div className="space-y-3">
                  <button 
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    onClick={handleAceptarContrato}
                    disabled={!aceptado}
                  >
                    <i className="bx bx-check-circle mr-2"></i> Aceptar Contrato
                  </button>
                  
                  <button 
                    className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => navigate(-1)}
                  >
                    <i className="bx bx-x-circle mr-2"></i> Cancelar
                  </button>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">¿Necesita ayuda?</h3>
                  <p className="text-xs text-gray-600 mb-2">
                    Si tiene dudas sobre los términos del contrato, contacte a su asesor financiero.
                  </p>
                  <button className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center">
                    <i className="bx bx-envelope mr-1"></i> Contactar soporte
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="bg-gray-100 p-4 rounded-full inline-flex mb-6">
                <i className="bx bx-file text-4xl text-gray-600"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">No hay contratos pendientes</h2>
              <p className="text-gray-600 mb-6">Actualmente no tiene contratos pendientes de aceptación.</p>
              <button 
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                onClick={() => navigate('/dashboard')}
              >
                Volver al Dashboard
              </button>
            </div>
          )}
        </main>

        {/* Pie de página */}
        <footer className="mt-auto p-4 bg-white border-t border-gray-200 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default AceptacionContrato;