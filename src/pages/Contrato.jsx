import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";

// Componente modal para mostrar detalles del contrato
const ContratoDetailModal = ({ contrato, onClose }) => {
  const handleAceptar = () => {
    alert("Contrato aceptado");
    // Aquí puedes agregar lógica adicional para guardar la aceptación
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg max-w-3xl w-full shadow-lg relative max-h-screen overflow-y-auto">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ✖
        </button>
        <h3 className="text-xl font-semibold mb-4 text-center">
          Detalle del Contrato de Prestación de Servicios Empresariales
        </h3>

        <div className="text-sm space-y-4">
          {/* Información básica del contrato */}
          <p>
            <strong>Contrato N°:</strong> {contrato.id}
          </p>
          <p>
            <strong>Tipo de Contrato:</strong> {contrato.tipoContrato}
          </p>
          <hr className="my-2" />

          {/* Antecedentes */}
          <h4 className="font-semibold text-lg mb-2">ANTECEDENTES</h4>
          <p>
            Ambas partes reconocen la necesidad de colaborar en proyectos de
            consultoría y asesoría empresarial para mejorar los procesos internos
            y la estrategia comercial de la empresa contratante. En virtud de ello,
            acuerdan celebrar el presente contrato de prestación de servicios, bajo
            los términos y condiciones que a continuación se detallan.
          </p>
          <hr className="my-2" />

          {/* Objeto del contrato */}
          <h4 className="font-semibold mb-2">OBJETO DEL CONTRATO</h4>
          <p>
            La empresa prestadora se compromete a proporcionar servicios de
            consultoría y asesoramiento en áreas clave para el desarrollo
            empresarial, incluyendo análisis de mercado, planificación estratégica,
            capacitación del personal, evaluación de procesos internos y
            recomendaciones para la mejora continua. Los servicios serán prestados
            en las instalaciones de la empresa contratante o en las oficinas de
            la prestadora, según lo acordado.
          </p>
          <hr className="my-2" />

          {/* Duración */}
          <h4 className="font-semibold mb-2">DURACIÓN</h4>
          <p>
            Este contrato tendrá una vigencia de <strong>doce (12) meses</strong>,
            iniciando el día <strong>1 de octubre de 2023</strong> y finalizando el
            <strong> 30 de septiembre de 2024</strong>. Las partes podrán acordar por
            escrito la extensión o renovación del mismo antes de su vencimiento.
          </p>
          <hr className="my-2" />

          {/* Valor y forma de pago */}
          <h4 className="font-semibold mb-2">VALOR Y FORMA DE PAGO</h4>
          <p>
            La empresa contratante abonará a la empresa prestadora la suma de
            <strong> diez mil dólares estadounidenses (USD 10,000)</strong> mensuales,
            los cuales serán depositados mediante transferencia bancaria a la cuenta
            que indique la prestadora, dentro de los primeros cinco días hábiles
            de cada mes. El pago incluye todos los servicios y gastos asociados
            necesarios para el cumplimiento del objeto del contrato.
          </p>
          <hr className="my-2" />

          {/* Obligaciones de las partes */}
          <h4 className="font-semibold mb-2">OBLIGACIONES DE LAS PARTES</h4>
          <ul className="list-disc list-inside">
            <li>
              <strong>De la empresa prestadora:</strong> Prestar los servicios en los
              plazos y condiciones pactadas, asegurando calidad y eficiencia, informar
              periódicamente sobre el avance de los trabajos, respetar la confidencialidad
              de la información, y entregar informes y recomendaciones por escrito según
              lo requiera la contratante.
            </li>
            <li>
              <strong>De la empresa contratante:</strong> Facilitar toda la información
              y recursos necesarios, pagar oportunamente los honorarios, y colaborar
              con la prestadora para facilitar el desarrollo de las actividades.
            </li>
          </ul>
          <hr className="my-2" />

          {/* Confidencialidad */}
          <h4 className="font-semibold mb-2">CONFIDENCIALIDAD</h4>
          <p>
            Ambas partes se obligan a mantener la confidencialidad de toda la
            información técnica, comercial, financiera o de cualquier otra índole,
            que sea compartida o conocida en virtud de este contrato, y a no divulgarla
            a terceros sin autorización previa y por escrito.
          </p>
          <hr className="my-2" />

          {/* Resolución del contrato */}
          <h4 className="font-semibold mb-2">RESOLUCIÓN DEL CONTRATO</h4>
          <p>
            El presente contrato podrá concluir anticipadamente por acuerdo mutuo
            entre las partes, o por incumplimiento grave de alguna de ellas, mediante
            notificación escrita con un plazo de aviso de treinta (30) días. En caso de
            terminación, la parte incumplida deberá cumplir con las obligaciones pendientes
            y pagar las obligaciones vencidas.
          </p>
          <hr className="my-2" />

          {/* Jurisdicción y ley aplicable */}
          <h4 className="font-semibold mb-2">JURISDICCIÓN Y LEY APLICABLE</h4>
          <p>
            Para cualquier controversia derivada del presente contrato, las partes se
            someten a la jurisdicción de los tribunales de la ciudad, renunciando a
            cualquier otra competencia. La ley aplicable será la vigente en la
            República correspondiente.
          </p>
          <hr className="my-2" />

          {/* Firmas y botón de aceptación */}
          <h4 className="font-semibold mb-2">FIRMAS</h4>
          <div className="flex justify-between mt-8 space-x-4">
            <div className="text-center w-1/2 border-t pt-4">
              <p>______________________________</p>
              <p>
                <strong>Juan Pérez</strong>
              </p>
              <p>Representante Legal - Empresa XYZ S.A.</p>
            </div>
            <div className="text-center w-1/2 border-t pt-4">
              <p>______________________________</p>
              <p>
                <strong>María Gómez</strong>
              </p>
              <p>Representante Legal - Servicios Empresariales S.R.L.</p>
            </div>
          </div>
          {/* Botón para aceptar */}
          <div className="flex justify-center mt-4">
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300"
              onClick={handleAceptar}
            >
              Aceptar Contrato
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Contrato = ({ setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUserState] = useState(null);
  const [contratos, setContratos] = useState([]); // Contratos del usuario
  const [loading, setLoading] = useState(true);
  const [selectedContrato, setSelectedContrato] = useState(null); // Contrato para ver detalles

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

        // Datos ficticios de contratos con tipoContrato
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

  return (
    <div className="flex min-h-screen bg-gray-100 font-serif">
      {/* Menú lateral */}
      {menuOpen && <Menu />}

      {/* Contenido principal */}
      <div
        className={`flex-1 flex flex-col transition-margin duration-300 ${
          menuOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <Header toggleMenu={toggleMenu} />

        {/* Main Content */}
        <main className="flex-1 p-8 bg-gray-100">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-8 mt-12">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer">
                <i className="bx bx-file text-3xl text-gray-700"></i>
              </div>
              <h1 className="text-3xl font-semibold text-gray-800">
                Mis Contratos
              </h1>
            </div>
          </div>

          {/* Número de contrato */}
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 shadow-md max-w-2xl mx-auto mb-4">
            <h4 className="text-2xl font-semibold text-gray-800 text-center tracking-wide uppercase">
              Número de contrato: <span className="font-bold">IFEMI/CRED/001-25</span>
            </h4>
          </div>

          {/* Lista de Contratos */}
          <section className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 overflow-x-auto mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b border-gray-300 pb-2">
              Lista de Contratos
            </h2>
            {loading ? (
              <p className="text-center text-gray-500">Cargando...</p>
            ) : contratos.length > 0 ? (
              <table className="min-w-full text-left divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600 uppercase tracking-wide">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600 uppercase tracking-wide">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {contratos.map((contrato, index) => (
                    <tr
                      key={contrato.id}
                      className={`transition-all duration-200 hover:bg-gray-100 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-800">{contrato.estado}</td>
                      <td className="px-4 py-3">
                        <button
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                          onClick={() => setSelectedContrato(contrato)}
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-gray-500">No hay contratos disponibles</p>
            )}
          </section>
        </main>

        {/* Modal de detalles */}
        {selectedContrato && (
          <ContratoDetailModal
            contrato={selectedContrato}
            onClose={() => setSelectedContrato(null)}
          />
        )}

        {/* Pie de página */}
        <footer className="mt-auto p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Contrato;