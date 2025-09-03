import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";

const ContratoDetailModal = ({ contrato, onClose }) => {
  const handleAceptar = () => {
    alert("Contrato aceptado");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto p-4">
      <div className="bg-white p-8 rounded-xl max-w-4xl w-full shadow-xl relative max-h-screen overflow-y-auto">
        {/* Cerrar botón */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Título */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2 font-serif">
            Detalle del Contrato de Prestación de Servicios Empresariales
          </h3>
          <div className="w-20 h-1 bg-blue-500 mx-auto"></div>
        </div>

        {/* Información básica */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
          <p className="font-semibold text-blue-700 mb-2">
            Contrato N°: <span className="font-normal text-gray-800">{contrato.id}</span>
          </p>
          <p className="font-semibold text-blue-700">
            Tipo de Contrato: <span className="font-normal text-gray-800">{contrato.tipoContrato}</span>
          </p>
        </div>

        {/* Secciones del contrato */}
        {[
          {
            title: "ANTECEDENTES",
            content:
              "Ambas partes reconocen la necesidad de colaborar en proyectos de consultoría y asesoría empresarial para mejorar los procesos internos y la estrategia comercial de la empresa contratante. En virtud de ello, acuerdan celebrar el presente contrato de prestación de servicios, bajo los términos y condiciones que a continuación se detallan.",
          },
          {
            title: "OBJETO DEL CONTRATO",
            content:
              "La empresa prestadora se compromete a proporcionar servicios de consultoría y asesoramiento en áreas clave para el desarrollo empresarial, incluyendo análisis de mercado, planificación estratégica, capacitación del personal, evaluación de procesos internos y recomendaciones para la mejora continua. Los servicios serán prestados en las instalaciones de la empresa contratante o en las oficinas de la prestadora, según lo acordado.",
          },
          {
            title: "DURACIÓN",
            content:
              "Este contrato tendrá una vigencia de doce (12) meses, iniciando el día 1 de octubre de 2023 y finalizando el 30 de septiembre de 2024. Las partes podrán acordar por escrito la extensión o renovación del mismo antes de su vencimiento.",
          },
          {
            title: "VALOR Y FORMA DE PAGO",
            content:
              "La empresa contratante abonará a la empresa prestadora la suma de diez mil dólares estadounidenses (USD 10,000) mensuales, los cuales serán depositados mediante transferencia bancaria a la cuenta que indique la prestadora, dentro de los primeros cinco días hábiles de cada mes. El pago incluye todos los servicios y gastos asociados necesarios para el cumplimiento del objeto del contrato.",
          },
          {
            title: "CONFIDENCIALIDAD",
            content:
              "Ambas partes se obligan a mantener la confidencialidad de toda la información técnica, comercial, financiera o de cualquier otra índole, que sea compartida o conocida en virtud de este contrato, y a no divulgarla a terceros sin autorización previa y por escrito.",
          },
          {
            title: "RESOLUCIÓN DEL CONTRATO",
            content:
              "El presente contrato podrá concluir anticipadamente por acuerdo mutuo entre las partes, o por incumplimiento grave de alguna de ellas, mediante notificación escrita con un plazo de aviso de treinta (30) días. En caso de terminación, la parte incumplida deberá cumplir con las obligaciones pendientes y pagar las obligaciones vencidas.",
          },
          {
            title: "JURISDICCIÓN Y LEY APLICABLE",
            content:
              "Para cualquier controversia derivada del presente contrato, las partes se someten a la jurisdicción de los tribunales de la ciudad, renunciando a cualquier otra competencia. La ley aplicable será la vigente en la República correspondiente.",
          },
        ].map((section, index) => (
          <div
            key={index}
            className="border-l-4 border-blue-500 pl-4 mb-6"
          >
            <h4 className="font-semibold text-gray-800 text-lg mb-2 font-serif">{section.title}</h4>
            <p className="text-gray-600 leading-relaxed">{section.content}</p>
          </div>
        ))}

        {/* Obligaciones de las partes */}
        <div className="border-l-4 border-blue-500 pl-4 mb-6">
          <h4 className="font-semibold text-gray-800 text-lg mb-2 font-serif">OBLIGACIONES DE LAS PARTES</h4>
          <ul className="space-y-3 list-disc list-inside text-gray-600">
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-600 rounded-full p-1 mr-2 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <div>
                <strong>De la empresa prestadora:</strong> Prestar los servicios en los plazos y condiciones pactadas, asegurando calidad y eficiencia, informar periódicamente sobre el avance de los trabajos, respetar la confidencialidad de la información, y entregar informes y recomendaciones por escrito según lo requiera la contratante.
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-600 rounded-full p-1 mr-2 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <div>
                <strong>De la empresa contratante:</strong> Facilitar toda la información y recursos necesarios, pagar oportunamente los honorarios, y colaborar con la prestadora para facilitar el desarrollo de las actividades.
              </div>
            </li>
          </ul>
        </div>

        {/* Firmas */}
        <div className="border-l-4 border-blue-500 pl-4 mb-6">
          <h4 className="font-semibold text-gray-800 text-lg mb-4 font-serif">FIRMAS</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Firma 1 */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
              <div className="h-0.5 bg-gray-300 w-full mb-4"></div>
              <p className="font-semibold text-gray-800 mb-1">Juan Pérez</p>
              <p className="text-sm text-gray-600">Representante Legal - Empresa XYZ S.A.</p>
            </div>
            {/* Firma 2 */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
              <div className="h-0.5 bg-gray-300 w-full mb-4"></div>
              <p className="font-semibold text-gray-800 mb-1">María Gómez</p>
              <p className="text-sm text-gray-600">Representante Legal - Servicios Empresariales S.R.L.</p>
            </div>
          </div>
        </div>

        {/* Botón aceptar */}
        <div className="flex justify-center mt-8 pt-6 border-t border-gray-200">
          <button
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md flex items-center transition-colors duration-300"
            onClick={handleAceptar}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Aceptar Contrato
          </button>
        </div>
      </div>
    </div>
  );
};

const Contrato = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContrato, setSelectedContrato] = useState(null);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const usuarioFicticio = {
          id: 1,
          nombre: "Juan Pérez",
          email: "juan.perez@example.com",
          cedula: "1234567890",
        };
        setUserState(usuarioFicticio);
        if (setUser) setUser(usuarioFicticio);

        const contratosFicticios = [
          {
            id: "C-1001",
            nombre: "Contrato de Arrendamiento",
            email: "arrendador@example.com",
            estado: "Activo",
            tipoContrato: "Contrato de Arrendamiento Empresarial",
          },
          {
            id: "C-1002",
            nombre: "Contrato de Servicios",
            email: "servicios@example.com",
            estado: "Pendiente",
            tipoContrato: "Contrato de Servicios Empresariales",
          },
          {
            id: "C-1003",
            nombre: "Contrato de Compra",
            email: "comprador@example.com",
            estado: "Finalizado",
            tipoContrato: "Contrato de Compra-Venta Empresarial",
          },
        ];

        setTimeout(() => {
          setContratos(contratosFicticios);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error al obtener datos:", error);
        setLoading(false);
      }
    };

    if (!user) {
      fetchUserData();
    }
  }, [setUser, user]);

  const getEstadoClasses = (estado) => {
    switch (estado) {
      case "Activo":
        return "bg-green-100 text-green-800";
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "Finalizado":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Menú lateral */}
      {menuOpen && <Menu />}

      {/* Contenido principal */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${menuOpen ? "ml-64" : "ml-0"}`}
      >
        {/* Header */}
        <Header toggleMenu={toggleMenu} />

        {/* Main */}
        <main className="flex-1 p-8">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-8 mt-4">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Mis Contratos</h1>
                <p className="text-gray-600">Gestiona y revisa tus contratos</p>
              </div>
            </div>
          </div>

          {/* Número de contrato */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-5 shadow-lg max-w-2xl mx-auto mb-8 text-center">
            <h4 className="text-xl font-semibold text-white mb-1">Número de contrato</h4>
            <p className="text-2xl font-bold text-white tracking-wide">IFEMI/CRED/001-25</p>
          </div>

          {/* Lista de Contratos */}
          <section className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-12">
            {/* Buscador */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Lista de Contratos</h2>
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Buscar contrato..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Cargando */}
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="border-4 border-gray-300 border-t-blue-500 rounded-full w-10 h-10 animate-spin"></div>
              </div>
            ) : contratos.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contrato</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contratos.map((contrato) => (
                      <tr key={contrato.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-900">{contrato.id}</div>
                          <div className="text-sm text-gray-500">{contrato.nombre}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{contrato.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoClasses(contrato.estado)}`}
                          >
                            {contrato.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
                            onClick={() => setSelectedContrato(contrato)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 15.5v-11a2 2 0 012-2h16a2 2 0 012 2v11a2 2 0 01-2 2H4a2 2 0 01-2-2z" />
                            </svg>
                            Ver Detalle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg">No hay contratos disponibles</p>
                <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors duration-200">
                  Crear nuevo contrato
                </button>
              </div>
            )}
          </section>
        </main>

        {/* Modal detalles */}
        {selectedContrato && (
          <ContratoDetailModal contrato={selectedContrato} onClose={() => setSelectedContrato(null)} />
        )}

        {/* Pie */}
        <footer className="mt-auto p-6 bg-white border-t border-gray-200 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default Contrato;