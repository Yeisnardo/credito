import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 relative overflow-x-hidden">
      
      {/* Encabezado */}
      <motion.header
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="bg-indigo-800 py-8 px-4 shadow-lg relative flex items-center justify-center"
      >
        <div className="text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-wide drop-shadow-lg">
            Instituto para el Fortalecimiento al Emprendedor
          </h1>
          <p className="mt-3 text-indigo-100 text-lg md:text-xl font-semibold">
            del municipio Independencia
          </p>
        </div>
      </motion.header>

      {/* Navegación */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="sticky top-0 z-50 bg-white bg-opacity-80 backdrop-blur-md shadow-md py-4 px-6 flex justify-center items-center space-x-8 font-semibold text-gray-700 hover:text-indigo-700 transition-all duration-300"
      >
        {[
          { href: "#inicio", label: "Inicio" },
          { href: "#sobre-nosotros", label: "Sobre Nosotros" },
          { href: "#servicios", label: "Servicios" },
          { href: "#programas", label: "Programas" },
          { href: "#contacto", label: "Contacto" },
        ].map((link, index) => (
          <a
            key={index}
            href={link.href}
            className="px-3 py-1 rounded hover:bg-indigo-100 transition duration-200"
          >
            {link.label}
          </a>
        ))}
        {/* Botón en línea */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: -3 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            to="/login"
            className="bg-gradient-to-r from-indigo-500 to-gray-700 text-white font-semibold py-3 px-6 rounded-full shadow-xl uppercase tracking-widest hover:scale-105 transition-transform"
          >
            Persona En Línea
          </Link>
        </motion.div>
      </motion.nav>

      {/* Sección Inicio */}
      <section
        id="inicio"
        className="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 py-20 px-4 text-center relative"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-800 drop-shadow-lg">
            ¡Impulsa tu Emprendimiento!
          </h2>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-700 mb-6">
            El instituto que fortalece y apoya a los emprendedores del municipio
            Independencia para que alcancen sus metas y sueños.
          </p>
          <motion.a
            whileHover={{ scale: 1.05 }}
            href="#contacto"
            className="bg-indigo-800 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300"
          >
            Contáctanos
          </motion.a>
        </motion.div>
      </section>

      {/* Sobre Nosotros */}
      <section
        id="sobre-nosotros"
        className="max-w-7xl mx-auto p-8 my-16 bg-white rounded-lg shadow-lg"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-8 border-b-4 border-indigo-600 pb-2 text-center text-gray-800">
          Sobre Nosotros
        </h2>
        {/* Cards con animación */}
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Historia",
              content:
                "Desde su creación, nuestro instituto ha dedicado esfuerzos a potenciar el espíritu emprendedor en la comunidad.",
            },
            {
              title: "Misión y Visión",
              content:
                "Fomentar y fortalecer el emprendimiento local a través de capacitación, asesoría y redes de apoyo.",
            },
            {
              title: "Estructura",
              content:
                "Contamos con un equipo especializado y alianzas estratégicas para impulsar tu crecimiento.",
            },
          ].map((card, index) => (
            <motion.div
              key={index}
              className="bg-gray-50 p-6 rounded-lg shadow hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <h3 className="text-xl font-semibold mb-4 text-indigo-600">{card.title}</h3>
              <p className="text-gray-700">{card.content}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Servicios */}
      <section
        id="servicios"
        className="max-w-7xl mx-auto p-8 my-16 bg-gray-100 rounded-lg shadow-lg"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-8 border-b-4 border-indigo-600 pb-2 text-center text-gray-800">
          Nuestros Servicios
        </h2>
        {/* Servicios con animación */}
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: (
                <svg
                  className="w-8 h-8 text-indigo-700 mx-auto mb-4"
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v.01" />
                </svg>
              ),
              title: "Asesorías Emprendedoras",
              description:
                "Capacitación y asesoría para potenciar tu idea de negocio y convertirla en realidad.",
            },
            {
              icon: (
                <svg
                  className="w-8 h-8 text-indigo-700 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} fill="none" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
                </svg>
              ),
              title: "Red de Emprendedores",
              description:
                "Conecta con otros emprendedores y comparte experiencias, ideas y apoyo mutuo.",
            },
            {
              icon: (
                <svg
                  className="w-8 h-8 text-indigo-700 mx-auto mb-4"
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
              ),
              title: "Capacitación y Talleres",
              description:
                "Programas de formación en habilidades empresariales, liderazgo y gestión.",
            },
          ].map((servicio, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-transform hover:-translate-y-2 duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <div className="flex flex-col items-center mb-4">
                <div className="bg-indigo-200 p-4 rounded-full mb-4">{servicio.icon}</div>
                <h3 className="text-xl font-semibold text-gray-700 text-center">{servicio.title}</h3>
              </div>
              <p className="text-gray-600 text-center">{servicio.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Programas y Cursos */}
      <section
        id="programas"
        className="max-w-7xl mx-auto p-8 my-16 bg-white rounded-lg shadow-lg"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-8 border-b-4 border-indigo-600 pb-2 text-center text-gray-800">
          Programas y Cursos
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 text-lg md:text-xl">
          {["Formación en Gestión Empresarial", "Innovación y Creatividad", "Marketing Digital", "Finanzas para Emprendedores"].map((item, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              {item}
            </motion.li>
          ))}
        </ul>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center text-gray-600 font-semibold"
        >
          Para más información, solicita tu ficha de inscripción o agenda una asesoría.
        </motion.p>
      </section>

      {/* Contacto */}
      <section
        id="contacto"
        className="bg-indigo-100 py-20 px-4"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-8 border-b-4 border-indigo-600 pb-2 text-center text-gray-800">
          Contáctanos
        </h2>
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg space-y-8">
          {[
            {
              title: "Dirección",
              value:
                "Calle 30, entre 4 y 5 Avenida, Municipio Independencia, Estado Yaracuy.",
            },
            {
              title: "Teléfono",
              value: "+123 456 7890",
            },
            {
              title: "Email",
              value: "contacto@institutoparaelfortalecimiento.cl",
            },
          ].map((info, index) => (
            <div key={index}>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">{info.title}:</h3>
              <p className="text-gray-800">{info.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pie de página */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="bg-gray-900 text-gray-200 py-6 mt-16 text-center"
      >
        © {new Date().getFullYear()} Instituto para el Fortalecimiento al Emprendedor - Municipio Independencia
      </motion.footer>
    </div>
  );
}

export default App;