import React from "react";
import { Link } from "react-router-dom";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 relative">
      
      {/* Encabezado */}
      <header className="bg-indigo-800 py-6 px-4 shadow-lg relative flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wide">
            Instituto para el Fortalecimiento al Emprendedor
          </h1>
          <p className="mt-2 text-indigo-100 text-sm">
            del municipio Independencia
          </p>
        </div>
      </header>

      {/* Navegación */}
      <nav className="sticky top-0 z-50 bg-white bg-opacity-90 backdrop-blur-md shadow-md flex justify-center items-center py-4 px-4 font-semibold text-gray-700 hover:text-indigo-700 transition-all duration-300">
        {/* Enlaces */}
        <div className="flex space-x-8 items-center">
          <a
            href="#inicio"
            className="hover:text-indigo-700 hover:-translate-y-1 transition-transform duration-200"
          >
            Inicio
          </a>
          <a
            href="#sobre-nosotros"
            className="hover:text-indigo-700 hover:-translate-y-1 transition-transform duration-200"
          >
            Sobre Nosotros
          </a>
          <a
            href="#servicios"
            className="hover:text-indigo-700 hover:-translate-y-1 transition-transform duration-200"
          >
            Servicios
          </a>
          <a
            href="#programas"
            className="hover:text-indigo-700 hover:-translate-y-1 transition-transform duration-200"
          >
            Programas
          </a>
          <a
            href="#contacto"
            className="hover:text-indigo-700 hover:-translate-y-1 transition-transform duration-200"
          >
            Contacto
          </a>
          {/* Botón en línea con estilo actualizado y vibrante */}
          <Link
            to="/login"
            className="ml-8 bg-gradient-to-r from-indigo-500 to-gray-700 text-white font-semibold py-3 px-6 rounded-full shadow-xl transform hover:scale-110 hover:-rotate-3 transition-all duration-300 font-extrabold tracking-widest uppercase"
          >
            Persona En Línea
          </Link>
        </div>
      </nav>

      {/* Sección Inicio */}
      <section
        id="inicio"
        className="bg-blue-100 py-16 px-4 text-center relative"
      >
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-800 drop-shadow-lg">
          ¡Impulsa tu Emprendimiento!
        </h2>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-700 mb-8">
          El instituto que fortalece y apoya a los emprendedores del municipio
          Independencia para que alcancen sus metas y sueños.
        </p>
        <a
          href="#contacto"
          className="bg-indigo-800 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300"
        >
          Contáctanos
        </a>
      </section>

      {/* Sobre Nosotros */}
      <section
        id="sobre-nosotros"
        className="max-w-7xl mx-auto p-8 my-12 bg-white rounded-lg shadow-md"
      >
        <h2 className="text-3xl font-bold mb-6 border-b-4 border-indigo-600 pb-2 text-center text-gray-800">
          Sobre Nosotros
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-gray-50 p-6 rounded-lg shadow hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-4 text-indigo-600">
              Historia
            </h3>
            <p className="text-gray-700">
              Desde su creación, nuestro instituto ha dedicado esfuerzos a potenciar el espíritu emprendedor en la comunidad.
            </p>
          </div>
          {/* Card 2 */}
          <div className="bg-gray-50 p-6 rounded-lg shadow hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-4 text-indigo-600">
              Misión y Visión
            </h3>
            <p className="text-gray-700">
              Fomentar y fortalecer el emprendimiento local a través de capacitación, asesoría y redes de apoyo.
            </p>
          </div>
          {/* Card 3 */}
          <div className="bg-gray-50 p-6 rounded-lg shadow hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-4 text-indigo-600">
              Estructura
            </h3>
            <p className="text-gray-700">
              Contamos con un equipo especializado y alianzas estratégicas para impulsar tu crecimiento.
            </p>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section
        id="servicios"
        className="max-w-7xl mx-auto p-8 my-12 bg-gray-100 rounded-lg shadow-md"
      >
        <h2 className="text-3xl font-bold mb-8 border-b-4 border-indigo-600 pb-2 text-center text-gray-800">
          Nuestros Servicios
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Servicio 1 */}
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-transform hover:-translate-y-2 duration-300">
            <div className="flex items-center mb-4">
              {/* Icono */}
              <div className="bg-indigo-200 p-3 rounded-full mr-4">
                <svg
                  className="w-6 h-6 text-indigo-700"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8c-1.1 0-2 .9-2 2v4h4v-4c0-1.1-.9-2-2-2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 12v.01"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700">
                Asesorías Emprendedoras
              </h3>
            </div>
            <p className="text-gray-600">
              Capacitación y asesoría para potenciar tu idea de negocio y convertirla en realidad.
            </p>
          </div>
          {/* Servicio 2 */}
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-transform hover:-translate-y-2 duration-300">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-200 p-3 rounded-full mr-4">
                <svg
                  className="w-6 h-6 text-indigo-700"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth={2}
                    fill="none"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700">
                Red de Emprendedores
              </h3>
            </div>
            <p className="text-gray-600">
              Conecta con otros emprendedores y comparte experiencias, ideas y apoyo mutuo.
            </p>
          </div>
          {/* Servicio 3 */}
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-transform hover:-translate-y-2 duration-300">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-200 p-3 rounded-full mr-4">
                <svg
                  className="w-6 h-6 text-indigo-700"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                  />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700">
                Capacitación y Talleres
              </h3>
            </div>
            <p className="text-gray-600">
              Programas de formación en habilidades empresariales, liderazgo y gestión.
            </p>
          </div>
        </div>
      </section>

      {/* Programas y Cursos */}
      <section
        id="programas"
        className="max-w-7xl mx-auto p-8 my-12 bg-white rounded-lg shadow-md"
      >
        <h2 className="text-3xl font-bold mb-6 border-b-4 border-indigo-600 pb-2 text-center text-gray-800">
          Programas y Cursos
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
          <li>Formación en Gestión Empresarial</li>
          <li>Innovación y Creatividad</li>
          <li>Marketing Digital</li>
          <li>Finanzas para Emprendedores</li>
        </ul>
        <p className="text-center text-gray-600">
          Para más información, solicita tu ficha de inscripción o agenda una asesoría.
        </p>
      </section>

      {/* Contacto */}
      <section id="contacto" className="bg-indigo-100 py-16 px-4">
        <h2 className="text-3xl font-bold mb-8 border-b-4 border-indigo-600 pb-2 text-center text-gray-800">
          Contáctanos
        </h2>
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Dirección:</h3>
            <p>
              Calle 30, entre 4 y 5 Avenida, Municipio Independencia, Estado Yaracuy.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Teléfono:</h3>
            <p>+123 456 7890</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Email:</h3>
            <p>contacto@institutoparaelfortalecimiento.cl</p>
          </div>
        </div>
      </section>

      {/* Pie de página */}
      <footer className="bg-gray-900 text-gray-200 py-6 mt-12 text-center">
        © {new Date().getFullYear()} Instituto para el Fortalecimiento al Emprendedor - Municipio Independencia
      </footer>
    </div>
  );
}

export default App;