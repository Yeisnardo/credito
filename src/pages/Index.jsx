import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import fondoInicio from '../assets/image/landign_inicio_fondo.jpg';

// Imagenes carrucel
import imagen1 from '../assets/image/1.jpeg';
import imagen2 from '../assets/image/2.jpeg';
import imagen3 from '../assets/image/3.jpeg';
import imagen4 from '../assets/image/4.jpeg';
import imagen5 from '../assets/image/5.jpeg';

function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const images = [
    imagen1,
    imagen2,
    imagen3,
    imagen4,
    imagen5
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 font-sans text-gray-800 overflow-x-hidden">
      {/* Header Mejorado */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        className="bg-white/90 backdrop-blur-xl shadow-2xl py-6 px-4 md:px-16 flex items-center justify-between rounded-b-3xl border-b border-white/30"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">IFE</span>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Instituto Fortalecimiento Emprendedor
            </h1>
            <p className="text-sm text-gray-600">Municipio Independencia</p>
          </div>
        </div>        
      </motion.header>

      {/* Navegación Mejorada con Botón Desplegable en el Centro */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-lg py-4 px-6"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {[
              { href: "inicio", label: "Inicio" },
              { href: "sobre-nosotros", label: "Sobre Nosotros" },
              { href: "servicios", label: "Servicios" },
            ].map((link, index) => (
              <motion.button
                key={index}
                onClick={() => scrollToSection(link.href)}
                className="text-gray-700 hover:text-indigo-600 font-medium px-3 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-200 relative group"
                whileHover={{ y: -2 }}
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span>
              </motion.button>
            ))}
            
            {/* Botón desplegable en el centro de la navegación */}
            <div className="relative">
              <motion.button
                onClick={toggleDropdown}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Persona en linea</span>
                <motion.svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </motion.button>

              {/* Menú desplegable */}
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 backdrop-blur-lg z-50 overflow-hidden"
                >
                  {/* Encabezado del dropdown */}
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
                    <h3 className="font-semibold text-lg">Selecciona tu perfil</h3>
                    <p className="text-indigo-100 text-sm mt-1">Acceso al sistema</p>
                  </div>

                  {/* Opciones del dropdown */}
                  <div className="p-2">
                    <Link
                      to="/login"
                      target="_blank"
                      onClick={closeDropdown}
                      className="flex items-center space-x-3 p-3 rounded-xl hover:bg-indigo-50 transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">E</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 group-hover:text-indigo-600">Emprendedor</h4>
                        <p className="text-sm text-gray-600">Acceso para emprendedores</p>
                      </div>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>

                    <div className="h-px bg-gray-200 mx-3 my-1"></div>

                    <Link
                      to="/login-admin"
                      target="_blank"
                      onClick={closeDropdown}
                      className="flex items-center space-x-3 p-3 rounded-xl hover:bg-indigo-50 transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">A</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 group-hover:text-indigo-600">Administrativo</h4>
                        <p className="text-sm text-gray-600">Acceso para administradores</p>
                      </div>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>

                  {/* Footer del dropdown */}
                  <div className="bg-gray-50 p-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                      ¿Problemas para acceder? <button onClick={() => { closeDropdown(); scrollToSection('contacto'); }} className="text-indigo-600 hover:underline">Contáctanos</button>
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {[
              { href: "programas", label: "Programas" },
              { href: "contacto", label: "Contacto" },
            ].map((link, index) => (
              <motion.button
                key={index + 3}
                onClick={() => scrollToSection(link.href)}
                className="text-gray-700 hover:text-indigo-600 font-medium px-3 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-200 relative group"
                whileHover={{ y: -2 }}
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.nav>

      {/* Overlay para cerrar dropdown al hacer clic fuera */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={closeDropdown}
        ></div>
      )}

      {/* Hero Section Mejorada */}
      <section id="inicio" className="relative py-16 md:py-24 px-4 min-h-screen flex items-center">
        {/* Imagen de fondo con overlay */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${fondoInicio})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          {/* Overlay gradiente para mejor legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-purple-900/40 to-indigo-900/50"></div>
          {/* Overlay adicional para el texto */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40"></div>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center md:text-left"
          >
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            >
              <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Impulsa Tu
              </span>
              <br />
              <span className="text-white">Emprendimiento</span>
            </motion.h1>
            
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-200 mb-8 leading-relaxed"
            >
              Transformamos ideas en negocios exitosos. Capacitación, asesoría y apoyo continuo para emprendedores del municipio Independencia.
            </motion.p>
            
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
            >
              <motion.button
                onClick={() => scrollToSection('contacto')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-2 border-white/20"
                whileHover={{ 
                  scale: 1.05, 
                  y: -2
                }}
                whileTap={{ scale: 0.95 }}
              >
                Comenzar Ahora
              </motion.button>
              <motion.button
                onClick={() => scrollToSection('servicios')}
                className="border-2 border-white text-white font-semibold py-4 px-8 rounded-2xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
                whileHover={{ 
                  scale: 1.05, 
                  y: -2,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }}
              >
                Conocer Servicios
              </motion.button>
            </motion.div>

            {/* Elementos decorativos */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="mt-12 flex items-center justify-center md:justify-start space-x-6 text-white/80"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">+500 Emprendedores</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-sm">3 Años de Experiencia</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Tarjeta flotante con carrusel */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <div className="relative h-96">
                {images.map((img, index) => (
                  <motion.img
                    key={index}
                    src={img}
                    alt={`Slide ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={false}
                    animate={{ opacity: index === currentSlide ? 1 : 0 }}
                    transition={{ duration: 1 }}
                  />
                ))}
                
                {/* Overlay para mejor contraste */}
                <div className="absolute inset-0 bg-black/20"></div>
                
                {/* Indicadores */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentSlide 
                          ? "bg-white scale-125" 
                          : "bg-white/50 hover:bg-white/70"
                      }`}
                    />
                  ))}
                </div>

                {/* Texto superpuesto en el carrusel */}
                <div className="absolute bottom-8 left-6 right-6 text-white">
                  <motion.div
                    key={currentSlide}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                  >
                    <h3 className="text-lg font-semibold mb-2">
                      {[
                        "Capacitación Especializada",
                        "Red de Emprendedores", 
                        "Asesoría Personalizada",
                        "Talleres Prácticos",
                        "Networking Empresarial"
                      ][currentSlide]}
                    </h3>
                    <p className="text-sm text-white/80">
                      {[
                        "Programas diseñados para tu éxito",
                        "Conecta con otros emprendedores",
                        "Acompañamiento profesional",
                        "Aprende haciendo con expertos", 
                        "Amplía tus oportunidades de negocio"
                      ][currentSlide]}
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Elementos decorativos flotantes */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full shadow-lg"
            />
            <motion.div
              animate={{ 
                y: [0, 10, 0],
                rotate: [0, -5, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-400 rounded-full shadow-lg"
            />
          </motion.div>
        </div>

        {/* Flecha de scroll down */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-white cursor-pointer"
            onClick={() => scrollToSection('sobre-nosotros')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <motion.section
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="py-16 bg-white/50 backdrop-blur-sm"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "500+", label: "Emprendedores" },
              { number: "50+", label: "Proyectos" },
              { number: "95%", label: "Satisfacción" },
              { number: "3 años", label: "Experiencia" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center p-6"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Sobre Nosotros Mejorado */}
      <section id="sobre-nosotros" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Sobre Nosotros
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Liderando la transformación emprendedora en el municipio Independencia 
              con más de 3 años de experiencia y compromiso.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: "📚",
                title: "Nuestra Historia",
                description: "Fundados en 2020, hemos acompañado el crecimiento de más de 500 emprendedores en su camino hacia el éxito empresarial.",
                features: ["+500 emprendedores", "3 años de experiencia", "Comunidad activa"]
              },
              {
                icon: "🎯",
                title: "Misión y Visión",
                description: "Potenciar el ecosistema emprendedor local a través de capacitación especializada, mentoría y acceso a redes de negocio.",
                features: ["Capacitación continua", "Redes de contacto", "Mentoría personalizada"]
              },
              {
                icon: "🏛️",
                title: "Nuestra Estructura",
                description: "Contamos con un equipo multidisciplinario de expertos en emprendimiento, finanzas, marketing y desarrollo empresarial.",
                features: ["Equipo especializado", "Alianzas estratégicas", "Recursos modernos"]
              }
            ].map((card, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="text-4xl mb-4">{card.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{card.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{card.description}</p>
                <ul className="space-y-2">
                  {card.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Servicios Mejorados */}
      <section id="servicios" className="py-20 px-4 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Nuestros Servicios
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ofrecemos soluciones integrales para cada etapa de tu emprendimiento
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                icon: "💼",
                title: "Asesorías Emprendedoras",
                description: "Sesiones personalizadas para desarrollar tu modelo de negocio y plan estratégico.",
                features: ["Modelo de negocio", "Plan estratégico", "Análisis de mercado"],
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: "🌐",
                title: "Red de Emprendedores",
                description: "Conecta con una comunidad activa de emprendedores y oportunidades de negocio.",
                features: ["Networking events", "Mentoría entre pares", "Casos de éxito"],
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: "📊",
                title: "Capacitación y Talleres",
                description: "Programas formativos en habilidades empresariales, digitales y de liderazgo.",
                features: ["Talleres prácticos", "Certificaciones", "Sesiones virtuales"],
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: "💰",
                title: "Asesoría Financiera",
                description: "Orientación en gestión financiera, inversión y acceso a fuentes de financiamiento.",
                features: ["Plan financiero", "Fuentes de funding", "Control de gastos"],
                color: "from-orange-500 to-red-500"
              },
              {
                icon: "⚡",
                title: "Aceleración de Negocios",
                description: "Programa intensivo para escalar tu emprendimiento al siguiente nivel.",
                features: ["Programa intensivo", "Mentoría expertos", "Demo Day"],
                color: "from-indigo-500 to-purple-500"
              },
              {
                icon: "🔗",
                title: "Vinculación Empresarial",
                description: "Conectamos tu emprendimiento con empresas establecidas y posibles clientes.",
                features: ["Alianzas estratégicas", "Ruedas de negocio", "Proveeduría"],
                color: "from-teal-500 to-blue-500"
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                whileHover={{ y: -8 }}
              >
                <div className={`h-2 bg-gradient-to-r ${service.color}`}></div>
                <div className="p-8">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{service.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-700">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${service.color} mr-3`}></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Programas Mejorados */}
      <section id="programas" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Nuestros Programas
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Formación especializada diseñada para el éxito de tu emprendimiento
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-8">Programas Disponibles</h3>
              <div className="space-y-6">
                {[
                  {
                    title: "Formación en Gestión Empresarial",
                    duration: "12 semanas",
                    level: "Principiante a Avanzado",
                    icon: "🎓"
                  },
                  {
                    title: "Asesoría Legal y Financiera",
                    duration: "Sesiones personalizadas",
                    level: "Todos los niveles",
                    icon: "⚖️"
                  },
                  {
                    title: "Mentoría para Emprendedores",
                    duration: "6 meses",
                    level: "Emprendedores establecidos",
                    icon: "👥"
                  },
                  {
                    title: "Finanzas para Emprendedores",
                    duration: "8 semanas",
                    level: "Principiante",
                    icon: "💹"
                  },
                  {
                    title: "Marketing Digital",
                    duration: "10 semanas",
                    level: "Intermedio",
                    icon: "📱"
                  },
                  {
                    title: "Plan de Negocios",
                    duration: "6 semanas",
                    level: "Principiante",
                    icon: "📋"
                  }
                ].map((program, index) => (
                  <motion.div
                    key={index}
                    className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">{program.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-2">{program.title}</h4>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {program.duration}
                          </span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            {program.level}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white"
            >
              <div className="text-center mb-8">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold mb-4">¿Listo para comenzar?</h3>
                <p className="text-indigo-100">
                  Únete a nuestra comunidad de emprendedores y transforma tu idea en realidad
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <h4 className="font-semibold mb-3">Próximos Inicios</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Gestión Empresarial</span>
                      <span className="font-semibold">15 de Enero</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Marketing Digital</span>
                      <span className="font-semibold">22 de Enero</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Finanzas</span>
                      <span className="font-semibold">30 de Enero</span>
                    </div>
                  </div>
                </div>

                <motion.button
                  onClick={() => scrollToSection('contacto')}
                  className="block w-full bg-white text-indigo-600 text-center font-semibold py-4 px-6 rounded-2xl hover:bg-gray-100 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Solicitar Información
                </motion.button>

                <div className="text-center text-indigo-200 text-sm">
                  <p>📞 Llámanos: +123 456 7890</p>
                  <p>✉️ WhatsApp: +123 456 7890</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contacto Mejorado */}
      <section id="contacto" className="py-20 px-4 bg-gradient-to-br from-gray-900 to-indigo-900 text-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Contáctanos
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Estamos aquí para ayudarte a hacer crecer tu emprendimiento
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-bold mb-8">Información de Contacto</h3>
              <div className="space-y-6">
                {[
                  {
                    icon: "📍",
                    title: "Dirección",
                    content: "Calle 30, entre 4 y 5 Avenida\nMunicipio Independencia, Estado Yaracuy",
                    sub: "Atención: Lunes a Viernes 8:00 AM - 5:00 PM"
                  },
                  {
                    icon: "📞",
                    title: "Teléfonos",
                    content: "+58 123 456 7890\n+58 123 456 7891",
                    sub: "WhatsApp disponible"
                  },
                  {
                    icon: "✉️",
                    title: "Email",
                    content: "contacto@institutofortalecimiento.cl\ninfo@institutofortalecimiento.cl",
                    sub: "Respuesta en 24 horas"
                  },
                  {
                    icon: "🌐",
                    title: "Redes Sociales",
                    content: "@InstitutoFortalecimiento\n@IFEIndependencia",
                    sub: "Síguenos para updates"
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start space-x-4 p-6 bg-white/5 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                    whileHover={{ x: 5 }}
                  >
                    <div className="text-2xl">{item.icon}</div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                      <p className="text-gray-300 whitespace-pre-line">{item.content}</p>
                      <p className="text-gray-400 text-sm mt-2">{item.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-3xl p-8 text-gray-800"
            >
              <h3 className="text-2xl font-bold mb-6">Envía un Mensaje</h3>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Asunto</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                    placeholder="¿En qué podemos ayudarte?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
                  <textarea 
                    rows="5"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                    placeholder="Describe tu consulta o proyecto..."
                  ></textarea>
                </div>
                <motion.button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Enviar Mensaje
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer Mejorado */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-r from-gray-900 to-indigo-900 text-white py-12 mt-20"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Instituto Fortalecimiento Emprendedor</h3>
              <p className="text-gray-300">
                Impulsando el desarrollo económico del municipio Independencia a través del emprendimiento.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Enlaces Rápidos</h4>
              <div className="space-y-2">
                {["Inicio", "Servicios", "Programas", "Contacto"].map((item) => (
                  <button 
                    key={item} 
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className="block text-gray-300 hover:text-white transition-colors text-left"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <div className="space-y-2 text-gray-300">
                <p>📞 +123 456 7890</p>
                <p>✉️ contacto@instituto.cl</p>
                <p>📍 Municipio Independencia, Yaracuy</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Instituto para el Fortalecimiento al Emprendedor. Todos los derechos reservados.</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

export default App;