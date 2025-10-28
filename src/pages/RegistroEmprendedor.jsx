import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { locationData, getEstados, getMunicipiosByEstado } from "../components/Venezuela";
import miImagen from "../assets/imagenes/logo_ifemi.jpg";

import personaService from "../services/api_persona";
import emprendimientoService from "../services/api_emprendimiento";
import usuarioService from "../services/api_usuario";
import clasificacionService from "../services/api_clasificacion";

import "../assets/css/style.css";

const RegistroEmprendedor = () => {
  const [paso, setPaso] = useState(1);
  const navigate = useNavigate();

  const [datos, setDatos] = useState({
    cedula: "",
    nombre_completo: "",
    edad: "",
    telefono: "",
    correo: "",
    estado: "",
    municipio: "",
    direccion: "",
    tipo_persona: "Emprendedor",
    cedula_emprendedor: "",
    consejo_nombre: "",
    comuna: "",
    tipo_sector: "",
    tipo_negocio: "",
    nombre_emprendimiento: "",
    direccion_emprendimiento: "",
    cedula_usuario: "",
    usuario: "",
    clave: "",
    estatus: "Activo",
    rol: "Emprendedor",
  });

  const [clasificaciones, setClasificaciones] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [sectorSeleccionado, setSectorSeleccionado] = useState("");
  const [negocioSeleccionado, setNegocioSeleccionado] = useState("");
  const [municipios, setMunicipios] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados disponibles
  const estados = getEstados();

  // Cargar clasificaciones
  useEffect(() => {
    const fetchClasificaciones = async () => {
      try {
        const data = await clasificacionService.getClasificaciones();
        setClasificaciones(data);
        const sectoresUnicos = [...new Set(data.map((item) => item.sector))];
        setSectores(sectoresUnicos);
      } catch (error) {
        console.error("Error cargando clasificaciones:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar las clasificaciones",
        });
      }
    };
    fetchClasificaciones();
  }, []);

  // Gestionar municipios cuando cambia el estado
  useEffect(() => {
    if (datos.estado) {
      const municipiosEstado = getMunicipiosByEstado(datos.estado);
      setMunicipios(municipiosEstado);
      
      // Si el municipio actual no está en los municipios del nuevo estado, resetearlo
      if (!municipiosEstado.includes(datos.municipio)) {
        setDatos((prev) => ({ 
          ...prev, 
          municipio: municipiosEstado[0] || "" 
        }));
      }
    } else {
      setMunicipios([]);
      setDatos((prev) => ({ ...prev, municipio: "" }));
    }
  }, [datos.estado]);

  const handleChange = (campo, valor) => {
    if (campo === "cedula") {
      const soloNumeros = valor.replace(/\D/g, "");
      if (soloNumeros.length <= 9) {
        setDatos((prev) => ({
          ...prev,
          [campo]: soloNumeros,
          cedula_emprendedor: soloNumeros,
          cedula_usuario: soloNumeros,
        }));
      }
    } else if (campo === "telefono") {
      const soloNumeros = valor.replace(/\D/g, "");
      if (soloNumeros.length <= 11) {
        setDatos((prev) => ({ ...prev, [campo]: soloNumeros }));
      }
    } else {
      setDatos((prev) => ({ ...prev, [campo]: valor }));
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateStep1 = () => {
    if (!datos.cedula.trim() || datos.cedula.length < 6 || datos.cedula.length > 9) {
      Swal.fire({
        icon: "error",
        title: "Cédula inválida",
        text: "La cédula debe tener entre 6 y 9 dígitos",
      });
      return false;
    }

    if (!datos.nombre_completo.trim()) {
      Swal.fire({
        icon: "error",
        title: "Nombre requerido",
        text: "Por favor ingresa tu nombre completo",
      });
      return false;
    }

    if (!datos.edad) {
      Swal.fire({
        icon: "error",
        title: "Fecha requerida",
        text: "Por favor ingresa tu fecha de nacimiento",
      });
      return false;
    }

    if (!datos.telefono.trim() || datos.telefono.length < 10) {
      Swal.fire({
        icon: "error",
        title: "Teléfono inválido",
        text: "El teléfono debe tener al menos 10 dígitos",
      });
      return false;
    }

    if (!datos.correo.trim() || !validateEmail(datos.correo)) {
      Swal.fire({
        icon: "error",
        title: "Correo inválido",
        text: "Por favor ingresa un correo electrónico válido",
      });
      return false;
    }

    if (!datos.estado.trim()) {
      Swal.fire({
        icon: "error",
        title: "Estado requerido",
        text: "Por favor selecciona un estado",
      });
      return false;
    }

    if (!datos.municipio.trim()) {
      Swal.fire({
        icon: "error",
        title: "Municipio requerido",
        text: "Por favor selecciona un municipio",
      });
      return false;
    }

    if (!datos.direccion.trim()) {
      Swal.fire({
        icon: "error",
        title: "Dirección requerida",
        text: "Por favor ingresa tu dirección",
      });
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!sectorSeleccionado) {
      Swal.fire({
        icon: "error",
        title: "Sector requerido",
        text: "Por favor selecciona un sector",
      });
      return false;
    }

    if (!negocioSeleccionado) {
      Swal.fire({
        icon: "error",
        title: "Tipo de negocio requerido",
        text: "Por favor selecciona un tipo de negocio",
      });
      return false;
    }

    if (!datos.nombre_emprendimiento.trim()) {
      Swal.fire({
        icon: "error",
        title: "Nombre requerido",
        text: "Por favor ingresa el nombre de tu emprendimiento",
      });
      return false;
    }

    if (!datos.consejo_nombre.trim()) {
      Swal.fire({
        icon: "error",
        title: "Consejo requerido",
        text: "Por favor selecciona un consejo comunal",
      });
      return false;
    }

    if (!datos.comuna.trim()) {
      Swal.fire({
        icon: "error",
        title: "Comuna requerida",
        text: "Por favor selecciona una comuna",
      });
      return false;
    }

    return true;
  };

  const validateStep3 = () => {
    if (!datos.usuario.trim() || datos.usuario.length < 3) {
      Swal.fire({
        icon: "error",
        title: "Usuario inválido",
        text: "El usuario debe tener al menos 3 caracteres",
      });
      return false;
    }

    if (!datos.clave.trim() || datos.clave.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Contraseña inválida",
        text: "La contraseña debe tener al menos 6 caracteres",
      });
      return false;
    }

    return true;
  };

  const handleNext = () => {
    let isValid = false;

    switch (paso) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      default:
        isValid = false;
    }

    if (isValid && paso < 3) {
      setPaso(paso + 1);
    } else if (isValid && paso === 3) {
      handleFinalizar();
    }
  };

  const handleBack = () => {
    if (paso > 1) setPaso(paso - 1);
  };

  const handleFinalizar = async () => {
    setLoading(true);
    try {
      // Verificar si la cédula ya existe
      try {
        await personaService.getPersonaByCedula(datos.cedula);
        Swal.fire({
          icon: "error",
          title: "Cédula ya registrada",
          text: "Esta cédula ya se encuentra registrada en el sistema",
        });
        setLoading(false);
        return;
      } catch (error) {
        // Cédula disponible
        console.log("Cédula disponible");
      }

      // Verificar si el usuario ya existe
      try {
        await usuarioService.getUsuarioByUser(datos.usuario);
        Swal.fire({
          icon: "error",
          title: "Usuario ya existe",
          text: "Este nombre de usuario ya está en uso, elige otro",
        });
        setLoading(false);
        return;
      } catch (error) {
        // Usuario disponible
        console.log("Usuario disponible");
      }

      // Calcular edad desde fecha de nacimiento
      const edadCalculada = Math.floor(
        (new Date() - new Date(datos.edad)) / (365.25 * 24 * 60 * 60 * 1000)
      );

      const personaData = {
        cedula: datos.cedula,
        nombre_completo: datos.nombre_completo,
        edad: datos.edad,
        telefono: datos.telefono,
        email: datos.correo,
        estado: datos.estado,
        municipio: datos.municipio,
        direccion_actual: datos.direccion,
        tipo_persona: datos.tipo_persona,
      };
      await personaService.createPersona(personaData);

      const usuarioData = {
        cedula_usuario: datos.cedula,
        usuario: datos.usuario,
        clave: datos.clave,
        estatus: datos.estatus,
        rol: datos.rol,
      };
      await usuarioService.createUsuario(usuarioData);

      const emprendimientoData = {
        cedula_emprendedor: datos.cedula,
        tipo_sector: sectorSeleccionado,
        tipo_negocio: negocioSeleccionado,
        nombre_emprendimiento: datos.nombre_emprendimiento,
        consejo_nombre: datos.consejo_nombre,
        comuna: datos.comuna,
        direccion_emprendimiento: datos.direccion_emprendimiento || datos.direccion,
      };
      await emprendimientoService.createEmprendimiento(emprendimientoData);

      await Swal.fire({
        icon: "success",
        title: "¡Registro exitoso!",
        text: "Tu registro se ha completado correctamente",
        timer: 3000,
        showConfirmButton: false
      });

      navigate("/Login");
    } catch (error) {
      console.error("Error en registro:", error);
      let errorMessage = "Hubo un problema al guardar los datos";
      
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      
      Swal.fire({
        icon: "error",
        title: "Error en el registro",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Renderizar campos del formulario
  const renderPaso1 = () => (
    <motion.div
      id="paso-1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-4"
    >
      <h3 className="text-xl mb-4 font-semibold text-[#1A2C5B]">
        Datos Personales
      </h3>
      
      <div className="flex flex-wrap gap-4">
        {/* Cédula */}
        <div className="w-full md:w-[45%]">
          <label htmlFor="cedula" className="block mb-1 text-sm font-medium text-gray-600">
            Cédula de Identidad
          </label>
          <motion.input
            type="text"
            id="cedula"
            value={datos.cedula}
            onChange={(e) => handleChange("cedula", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A2C5B]"
            placeholder="Ingresa tu cédula"
            required
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Nombre Completo */}
        <div className="w-full md:w-[45%]">
          <label htmlFor="nombre_completo" className="block mb-1 text-sm font-medium text-gray-600">
            Nombre Completo
          </label>
          <motion.input
            type="text"
            id="nombre_completo"
            value={datos.nombre_completo}
            onChange={(e) => handleChange("nombre_completo", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A2C5B]"
            placeholder="Ingresa tu nombre completo"
            required
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Fecha de Nacimiento */}
        <div className="w-full md:w-[45%]">
          <label htmlFor="edad" className="block mb-1 text-sm font-medium text-gray-600">
            Fecha de Nacimiento
          </label>
          <motion.input
            type="date"
            id="edad"
            value={datos.edad}
            onChange={(e) => handleChange("edad", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A2C5B]"
            required
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Teléfono */}
        <div className="w-full md:w-[45%]">
          <label htmlFor="telefono" className="block mb-1 text-sm font-medium text-gray-600">
            Número de Teléfono
          </label>
          <motion.input
            type="tel"
            id="telefono"
            value={datos.telefono}
            onChange={(e) => handleChange("telefono", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A2C5B]"
            placeholder="Ingresa tu teléfono"
            required
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Correo */}
        <div className="w-full md:w-[93%]">
          <label htmlFor="correo" className="block mb-1 text-sm font-medium text-gray-600">
            Correo Electrónico
          </label>
          <motion.input
            type="email"
            id="correo"
            value={datos.correo}
            onChange={(e) => handleChange("correo", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A2C5B]"
            placeholder="Ingresa tu correo electrónico"
            required
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Estado */}
        <div className="w-full md:w-[45%]">
          <label htmlFor="estado" className="block mb-1 text-sm font-medium text-gray-600">
            Estado
          </label>
          <select
            id="estado"
            value={datos.estado}
            onChange={(e) => handleChange("estado", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A2C5B]"
          >
            <option value="">Seleccione un estado</option>
            {estados.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>

        {/* Municipio */}
        <div className="w-full md:w-[45%]">
          <label htmlFor="municipio" className="block mb-1 text-sm font-medium text-gray-600">
            Municipio
          </label>
          <select
            id="municipio"
            value={datos.municipio}
            onChange={(e) => handleChange("municipio", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A2C5B]"
            disabled={!datos.estado}
          >
            <option value="">Seleccione un municipio</option>
            {municipios.map((municipio) => (
              <option key={municipio} value={municipio}>
                {municipio}
              </option>
            ))}
          </select>
        </div>

        {/* Dirección */}
        <div className="w-full md:w-[93%]">
          <label htmlFor="direccion" className="block mb-1 text-sm font-medium text-gray-600">
            Dirección Actual
          </label>
          <input
            type="text"
            id="direccion"
            value={datos.direccion}
            onChange={(e) => handleChange("direccion", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A2C5B]"
            placeholder="Ingresa tu dirección actual"
            required
          />
        </div>
      </div>

      <motion.button
        onClick={handleNext}
        whileHover={{ scale: 1.05, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
        transition={{ duration: 0.3 }}
        className="w-full py-3 px-6 bg-blue-900 text-white font-semibold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-300 mt-4"
      >
        Siguiente
      </motion.button>

      <div className="mt-4 flex justify-center">
        <motion.button
          onClick={() => navigate("/Login")}
          whileHover={{ scale: 1.05, textShadow: "0 0 4px #000" }}
          className="text-blue-600 hover:underline font-medium"
        >
          Regresar al login
        </motion.button>
      </div>
    </motion.div>
  );

  const renderPaso2 = () => (
    <motion.div
      id="paso-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-4"
    >
      <h3 className="text-xl mb-4 font-semibold text-[#1A2C5B]">
        Datos del Consejo y Emprendimiento
      </h3>
      
      <div className="flex flex-wrap gap-4">
        {/* Sector */}
        <div className="w-full md:w-[45%]">
          <label className="block mb-1 text-sm font-medium text-gray-600" htmlFor="tipo_sector">
            Tipo de Sector
          </label>
          <select
            id="tipo_sector"
            value={sectorSeleccionado}
            onChange={(e) => {
              setSectorSeleccionado(e.target.value);
              setNegocioSeleccionado("");
            }}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A2C5B]"
          >
            <option value="">Seleccione un sector</option>
            {sectores.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de Negocio */}
        <div className="w-full md:w-[45%]">
          <label className="block mb-1 text-sm font-medium text-gray-600" htmlFor="tipo_negocio">
            Tipo de Negocio
          </label>
          <select
            id="tipo_negocio"
            value={negocioSeleccionado}
            onChange={(e) => {
              setNegocioSeleccionado(e.target.value);
              handleChange("tipo_negocio", e.target.value);
            }}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A2C5B]"
            disabled={!sectorSeleccionado}
          >
            <option value="">Seleccione tipo de negocio</option>
            {sectorSeleccionado &&
              clasificaciones
                .filter((c) => c.sector === sectorSeleccionado)
                .map((c) => (
                  <option key={c.negocio} value={c.negocio}>
                    {c.negocio}
                  </option>
                ))}
          </select>
        </div>

        {/* Nombre del Emprendimiento */}
        <div className="w-full">
          <label className="block mb-1 text-sm font-medium text-gray-600" htmlFor="nombre_emprendimiento">
            Nombre del Emprendimiento
          </label>
          <input
            type="text"
            id="nombre_emprendimiento"
            value={datos.nombre_emprendimiento}
            onChange={(e) => handleChange("nombre_emprendimiento", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A2C5B]"
            placeholder="Ingresa el nombre del emprendimiento"
          />
        </div>

        {/* Dirección del Emprendimiento */}
        <div className="w-full">
          <label className="block mb-1 text-sm font-medium text-gray-600" htmlFor="direccion_emprendimiento">
            Dirección del Emprendimiento
          </label>
          <input
            type="text"
            id="direccion_emprendimiento"
            value={datos.direccion_emprendimiento}
            onChange={(e) => handleChange("direccion_emprendimiento", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A2C5B]"
            placeholder="Ingresa la dirección del emprendimiento"
          />
        </div>

        {/* Consejo Nombre */}
        <div className="w-full md:w-[45%]">
          <label className="block mb-1 text-sm font-medium text-gray-600" htmlFor="consejo_nombre">
            Nombre del Consejo Comunal
          </label>
          <select
            id="consejo_nombre"
            value={datos.consejo_nombre}
            onChange={(e) => handleChange("consejo_nombre", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A2C5B]"
          >
            <option value="">Selecciona el consejo</option>
            <option value="DON JUANCHO">DON JUANCHO</option>
            <option value="ALTO PRADO">ALTO PRADO</option>
            <option value="SECTOR JUVENTUD">SECTOR JUVENTUD</option>
            {/* ... otros consejos ... */}
          </select>
        </div>

        {/* Comuna */}
        <div className="w-full md:w-[45%]">
          <label className="block mb-1 text-sm font-medium text-gray-600" htmlFor="comuna">
            Nombre de la Comuna
          </label>
          <select
            id="comuna"
            value={datos.comuna}
            onChange={(e) => handleChange("comuna", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A2C5B]"
          >
            <option value="">Selecciona la comuna</option>
            <option value="Comuna 1">William Lara Vive</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between mt-4 gap-4">
        <motion.button
          onClick={handleBack}
          whileHover={{ scale: 1.05, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
          transition={{ duration: 0.3 }}
          className="w-full py-3 px-6 bg-blue-900 text-white font-semibold rounded-xl shadow-lg"
        >
          Anterior
        </motion.button>
        <motion.button
          onClick={handleNext}
          whileHover={{ scale: 1.05, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
          transition={{ duration: 0.3 }}
          className="w-full py-3 px-6 bg-blue-900 text-white font-semibold rounded-xl shadow-lg"
        >
          Siguiente
        </motion.button>
      </div>
    </motion.div>
  );

  const renderPaso3 = () => (
    <motion.div
      id="paso-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-4"
    >
      <h3 className="text-xl mb-4 font-semibold text-[#1A2C5B]">
        Datos de Usuario
      </h3>
      
      {/* Usuario */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-600" htmlFor="usuario">
          Nombre de Usuario
        </label>
        <input
          type="text"
          id="usuario"
          value={datos.usuario}
          onChange={(e) => handleChange("usuario", e.target.value)}
          className="w-full max-w-xs border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A2C5B]"
          placeholder="Nombre de usuario"
        />
      </div>

      {/* Contraseña */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-600" htmlFor="clave">
          Contraseña
        </label>
        <input
          type="password"
          id="clave"
          value={datos.clave}
          onChange={(e) => handleChange("clave", e.target.value)}
          className="w-full max-w-xs border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A2C5B]"
          placeholder="Contraseña"
        />
      </div>

      <div className="flex justify-between mt-4 gap-4">
        <motion.button
          onClick={handleBack}
          whileHover={{ scale: 1.05, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
          transition={{ duration: 0.3 }}
          className="w-full py-3 px-6 bg-blue-900 text-white font-semibold rounded-xl shadow-lg"
        >
          Anterior
        </motion.button>
        <motion.button
          onClick={handleFinalizar}
          whileHover={{ scale: 1.05, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
          transition={{ duration: 0.3 }}
          className="w-full py-3 px-6 bg-blue-900 text-white font-semibold rounded-xl shadow-lg"
          disabled={loading}
        >
          {loading ? "Procesando..." : "Finalizar"}
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 font-serif">
      {/* Logo izquierda */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden md:flex w-1/2 items-center justify-center p-4 bg-gray-100 rounded-l-lg shadow-lg"
      >
        <div className="relative w-max h-max rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-900 via-blue-700 to-blue-500 opacity-50 rounded-lg"></div>
          <img
            src={miImagen}
            alt="Logo Institucional"
            className="max-w-xs max-h-xs object-cover relative z-10 rounded-lg shadow-lg"
          />
        </div>
      </motion.aside>

      {/* Formulario */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex-1 flex items-center justify-center p-8"
      >
        <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-8">
          {/* Título */}
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6 text-3xl font-serif text-center text-[#1A2C5B] tracking-wide"
          >
            Registro de Emprendedor
          </motion.h2>

          {/* Indicadores paso */}
          <div className="flex justify-center mb-8 space-x-4">
            {[1, 2, 3].map((n) => (
              <motion.button
                key={n}
                onClick={() => n <= paso && setPaso(n)}
                whileHover={{ scale: 1.1 }}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer ${
                  paso === n ? "bg-[#1A2C5B] scale-125" : "bg-gray-300"
                }`}
              >
                {n < paso ? (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-white font-semibold">{n}</span>
                )}
              </motion.button>
            ))}
          </div>

          {/* Renderizar pasos */}
          {paso === 1 && renderPaso1()}
          {paso === 2 && renderPaso2()}
          {paso === 3 && renderPaso3()}
        </div>
      </motion.div>
    </div>
  );
};

export default RegistroEmprendedor;