import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 font-sans text-gray-800 overflow-x-hidden font-sans">

      {/* Encabezado */}
      <motion.header
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="bg-gray-900 py-12 px-4 shadow-xl backdrop-blur-lg bg-opacity-80 flex items-center justify-center"
      >
        <div className="text-center max-w-5xl px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-4 tracking-wide">
            Instituto para el Fortalecimiento al Emprendedor
          </h1>
          <p className="mt-2 text-indigo-100 text-lg md:text-xl font-semibold opacity-80">
            del municipio Independencia
          </p>
        </div>
      </motion.header>

      {/* Navegación */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="sticky top-0 z-50 bg-white bg-opacity-70 backdrop-blur-md shadow-md py-4 px-8 flex justify-center items-center space-x-8 font-semibold text-gray-700 transition-all hover:text-indigo-600"
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
            className="px-4 py-2 rounded-full hover:bg-indigo-100 transition-all duration-200"
          >
            {link.label}
          </a>
        ))}
        {/* Botón en línea */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: -2 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            to="/login"
            className="bg-gray-900 text-white font-semibold py-3 px-6 rounded-full shadow-lg uppercase tracking-widest hover:scale-105 transition-transform"
          >
            Persona En Línea
          </Link>
        </motion.div>
      </motion.nav>

      {/* Sección Inicio con Carrusel */}
      <section
        id="inicio"
        className="py-20 px-4 bg-gradient-to-br from-purple-100 via-indigo-100 to-pink-100 relative"
      >
        {/* Carrusel de imágenes */}
        <div className="max-w-5xl mx-auto mb-10 relative overflow-hidden rounded-xl shadow-lg">
          {(() => {
            const images = [
              "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
              "https://images.unsplash.com/photo-1493612276216-ee3925520721?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
              "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
            ];
            const [current, setCurrent] = React.useState(0);

            React.useEffect(() => {
              const interval = setInterval(() => {
                setCurrent((prev) => (prev + 1) % images.length);
              }, 5000);
              return () => clearInterval(interval);
            }, []);

            return (
              <div className="relative h-80 md:h-96 rounded-xl overflow-hidden">
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Slide ${index + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                      index === current ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}
              </div>
            );
          })()}
        </div>

        {/* Texto y CTA */}
        <div className="text-center max-w-3xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-800 drop-shadow-lg leading-tight">
            ¡Impulsa tu Emprendimiento!
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            El instituto que fortalece y apoya a los emprendedores del municipio
            Independencia para que alcancen sus metas y sueños.
          </p>
          <motion.a
            whileHover={{ scale: 1.05 }}
            href="#contacto"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg uppercase tracking-widest transition"
          >
            Contáctanos
          </motion.a>
        </div>
      </section>

      {/* Sobre Nosotros */}
      <section
        id="sobre-nosotros"
        className="max-w-7xl mx-auto p-8 my-20 bg-white rounded-2xl shadow-xl"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-10 border-b-4 border-indigo-500 pb-3 text-center text-gray-800">
          Sobre Nosotros
        </h2>
        {/* Cards */}
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
              className="bg-gray-50 p-6 rounded-3xl shadow-xl hover:scale-105 transition-transform duration-300"
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
        className="max-w-7xl mx-auto p-8 my-20 bg-gray-50 rounded-3xl shadow-xl"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-10 border-b-4 border-indigo-500 pb-3 text-center text-gray-800">
          Nuestros Servicios
        </h2>
        {/* Servicios */}
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: (
                <svg
                  className="w-10 h-10 text-indigo-600 mx-auto mb-4"
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
                  className="w-10 h-10 text-indigo-600 mx-auto mb-4"
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
                  className="w-10 h-10 text-indigo-600 mx-auto mb-4"
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
              className="bg-white p-6 rounded-3xl shadow hover:scale-105 transition-transform duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <div className="flex flex-col items-center mb-4">
                <div className="bg-indigo-100 p-4 rounded-full mb-4">{servicio.icon}</div>
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
        className="max-w-7xl mx-auto p-8 my-20 bg-white rounded-3xl shadow-xl"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-10 border-b-4 border-indigo-500 pb-3 text-center text-gray-800">
          Programas y Cursos
        </h2>
        <ul className="list-disc list-inside space-y-4 text-gray-700 mb-8 text-lg md:text-xl">
          {[
            "Formación en Gestión Empresarial",
            "Innovación y Creatividad",
            "Marketing Digital",
            "Finanzas para Emprendedores",
          ].map((item, index) => (
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
        className="py-20 px-4 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-8 border-b-4 border-indigo-500 pb-2 text-center text-gray-800">
          Contáctanos
        </h2>
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl space-y-8">
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
              <h3 className="text-xl font-semibold mb-2 text-indigo-600">{info.title}:</h3>
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