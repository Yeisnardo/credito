import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { locationData, getEstados, getMunicipiosByEstado } from "../components/Venezuela";
import miImagen from "../assets/image/logo_ifemi.jpg";

import personaService from "../services/api_persona";
import emprendimientoService from "../services/api_emprendimiento";
import usuarioService from "../services/api_usuario";
import clasificacionService from "../services/api_clasificacion";

import "../assets/css/style.css";

// Funciones de formato
const formatCedula = (value) => {
  const soloNumeros = value.replace(/\D/g, "");
  if (soloNumeros.length <= 8) {
    return soloNumeros;
  }
  return soloNumeros.slice(0, 8);
};

const formatTelefono = (value) => {
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  
  if (numbers.length <= 4) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
  } else {
    return `${numbers.slice(0, 4)}-${numbers.slice(4, 7)}-${numbers.slice(7)}`;
  }
};

// FORMATO MEJORADO PARA NOMBRE PERSONAL - Primera letra mayúscula, resto minúscula
// FORMATO MEJORADO PARA NOMBRE PERSONAL - Permite espacios mientras escribe
const formatNombreAvanzado = (value) => {
  // Permitir solo caracteres válidos para nombres, pero mantener espacios normales
  const cleanedValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]/g, '');
  
  // Mantener los espacios exactamente como los escribe el usuario mientras teclea
  // Solo eliminar espacios múltiples al final si es necesario
  const spaceOptimized = cleanedValue;
  
  return spaceOptimized;
};

// Función adicional para formatear el nombre cuando se pierde el foco o se guarda
const formatNombreAutomatico = (value) => {
  // Permitir solo caracteres válidos para nombres
  const cleanedValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]/g, '');
  
  // Aplicar formato: primera letra de cada palabra en mayúscula automáticamente
  const formatted = cleanedValue
    .toLowerCase()
    .replace(/(^\w|\s\w)/g, letra => letra.toUpperCase());
  
  return formatted;
};

// FORMATO PARA EMPRENDIMIENTO - Permite espacios mientras escribe
const formatNombreEmprendimientoFlexible = (value) => {
  // Permitir caracteres amplios para nombres de emprendimientos
  const caracteresPermitidos = /[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\-_&.,()@#$/¿?¡!%]/g;
  const cleanedValue = (value.match(caracteresPermitidos) || []).join('');
  
  // Mantener los espacios exactamente como los escribe el usuario
  return cleanedValue;
};

const formatDireccion = (value) => {
  return value
    .replace(/(av\.|avenida|calle|cll\.|carretera|ctra\.)/gi, (match) => {
      const abreviaciones = {
        'av.': 'Av.', 'avenida': 'Av.',
        'calle': 'Cll.', 'cll.': 'Cll.',
        'carretera': 'Ctra.', 'ctra.': 'Ctra.'
      };
      return abreviaciones[match.toLowerCase()] || match;
    })
    .toUpperCase();
};

const formatUsuario = (value) => {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/\s+/g, ".")
    .substring(0, 20);
};

const calcularEdad = (fechaNacimiento) => {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  
  return edad;
};

const formatFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

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
  const [edadCalculada, setEdadCalculada] = useState("");

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

  // Calcular edad cuando cambia la fecha de nacimiento
  useEffect(() => {
    if (datos.edad) {
      const edad = calcularEdad(datos.edad);
      setEdadCalculada(edad);
    } else {
      setEdadCalculada("");
    }
  }, [datos.edad]);

  const handleChange = (campo, valor) => {
    let valorFormateado = valor;

    switch (campo) {
      case "cedula":
        valorFormateado = formatCedula(valor);
        setDatos((prev) => ({
          ...prev,
          [campo]: valorFormateado,
          cedula_emprendedor: valorFormateado,
          cedula_usuario: valorFormateado,
        }));
        return;
      
      case "nombre_completo":
        // ✅ Formato inteligente: Primera letra mayúscula, resto minúscula
        valorFormateado = formatNombreAutomatico(valor);
        break;
      
      case "nombre_emprendimiento":
        // ✅ Permite espacios normales mientras escribe
        valorFormateado = formatNombreEmprendimientoFlexible(valor);
        break;
      
      case "telefono":
        valorFormateado = formatTelefono(valor);
        break;
      
      case "direccion":
      case "direccion_emprendimiento":
        valorFormateado = formatDireccion(valor);
        break;
      
      case "usuario":
        valorFormateado = formatUsuario(valor);
        break;
      
      case "correo":
        valorFormateado = valor.toLowerCase().trim();
        break;
      
      default:
        valorFormateado = valor;
    }

    setDatos((prev) => ({ ...prev, [campo]: valorFormateado }));
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateStep1 = () => {
    if (!datos.cedula.trim() || datos.cedula.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Cédula inválida",
        text: "La cédula debe tener al menos 6 dígitos",
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

    // Validar que sea mayor de 18 años
    if (edadCalculada < 18) {
      Swal.fire({
        icon: "error",
        title: "Edad insuficiente",
        text: "Debes ser mayor de 18 años para registrarte",
      });
      return false;
    }

    const telefonoLimpio = datos.telefono.replace(/\D/g, "");
    if (!telefonoLimpio || telefonoLimpio.length < 10) {
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

    // Validar fortaleza de contraseña
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!strongPassword.test(datos.clave)) {
      Swal.fire({
        icon: "error",
        title: "Contraseña débil",
        text: "La contraseña debe incluir mayúsculas, minúsculas y números",
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

  const formatDataForAPI = () => {
    return {
      persona: {
        cedula: datos.cedula,
        nombre_completo: datos.nombre_completo,
        edad: datos.edad,
        telefono: datos.telefono.replace(/\D/g, ""),
        email: datos.correo,
        estado: datos.estado,
        municipio: datos.municipio,
        direccion_actual: datos.direccion,
        tipo_persona: datos.tipo_persona
      },
      usuario: {
        cedula_usuario: datos.cedula,
        usuario: datos.usuario,
        clave: datos.clave,
        estatus: datos.estatus,
        rol: datos.rol
      },
      emprendimiento: {
        cedula_emprendedor: datos.cedula,
        tipo_sector: sectorSeleccionado,
        tipo_negocio: negocioSeleccionado,
        nombre_emprendimiento: datos.nombre_emprendimiento.toUpperCase().trim(), // ✅ Se convierte a MAYÚSCULAS al guardar
        consejo_nombre: datos.consejo_nombre,
        comuna: datos.comuna,
        direccion_emprendimiento: datos.direccion_emprendimiento || datos.direccion
      }
    };
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

      const formattedData = formatDataForAPI();

      await personaService.createPersona(formattedData.persona);
      await usuarioService.createUsuario(formattedData.usuario);
      await emprendimientoService.createEmprendimiento(formattedData.emprendimiento);

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

  // Componente para mostrar campos formateados
  const DisplayField = ({ label, value, format = 'text' }) => {
    const formatValue = (val, fmt) => {
      switch (fmt) {
        case 'cedula':
          return `V-${val}`;
        case 'telefono':
          return val;
        case 'fecha':
          return formatFecha(val);
        case 'edad':
          return `${val} años`;
        default:
          return val;
      }
    };

    if (!value) return null;

    return (
      <div className="mb-2 p-2 bg-blue-50 rounded border border-blue-200">
        <span className="text-sm font-medium text-blue-800">{label}: </span>
        <span className="text-sm text-blue-900">{formatValue(value, format)}</span>
      </div>
    );
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
        Datos Personales y ubicacion
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
            placeholder="Ej: 12345678"
            required
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
          <span className="text-xs text-gray-500">Solo números (6-8 dígitos)</span>
        </div>

        {/* Nombre Completo */}
        <div className="w-full md:w-[45%]">
          <label htmlFor="nombre_completo" className="block mb-1 text-sm font-medium text-gray-600">
            Nombre Completo *
          </label>
          <motion.input
            type="text"
            id="nombre_completo"
            value={datos.nombre_completo}
            onChange={(e) => handleChange("nombre_completo", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A2C5B]"
            placeholder="Ej: Maria Jose Gonzalez Rodriguez"
            required
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
          <p className="text-gray-500 text-xs mt-1">
            Se formateará automáticamente a "Primera Letra Mayúscula"
          </p>
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
            max={new Date().toISOString().split('T')[0]}
          />
          {edadCalculada && (
            <span className={`text-xs ${edadCalculada < 18 ? 'text-red-500' : 'text-green-600'}`}>
              Edad: {edadCalculada} años {edadCalculada < 18 ? '(Debe ser mayor de 18)' : ''}
            </span>
          )}
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
            placeholder="Ej: 0412-123-4567"
            required
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
          <span className="text-xs text-gray-500">Formato: 0412-123-4567</span>
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
            placeholder="ejemplo@correo.com"
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
            placeholder="Ej: Av. Principal, Edificio Los Pinos"
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
      
      {/* Resumen del emprendimiento */}
      {(sectorSeleccionado || negocioSeleccionado || datos.nombre_emprendimiento) && (
        <div className="bg-gray-50 p-3 rounded-lg mb-4">
          <h4 className="font-medium text-gray-700 mb-2">Resumen Emprendimiento:</h4>
          {sectorSeleccionado && (
            <DisplayField label="Sector" value={sectorSeleccionado} />
          )}
          {negocioSeleccionado && (
            <DisplayField label="Tipo de Negocio" value={negocioSeleccionado} />
          )}
          {datos.nombre_emprendimiento && (
            <>
              <DisplayField label="Nombre (como se ve)" value={datos.nombre_emprendimiento} />
              <div className="mb-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                <span className="text-sm font-medium text-yellow-800">Se guardará como: </span>
                <span className="text-sm text-yellow-900 font-medium uppercase">
                  {datos.nombre_emprendimiento.toUpperCase()}
                </span>
              </div>
            </>
          )}
        </div>
      )}
      
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
            Nombre del Emprendimiento *
          </label>
          <input
            type="text"
            id="nombre_emprendimiento"
            value={datos.nombre_emprendimiento}
            onChange={(e) => handleChange("nombre_emprendimiento", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A2C5B]"
            placeholder="Ej: Mi Tienda Online, Panadería La Esperanza, etc."
            required
          />
          <p className="text-gray-500 text-xs mt-1">
            ✅ Puedes usar espacios, letras, números y caracteres especiales normalmente
          </p>
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
            placeholder="Ej: Av. Bolívar, Local #5"
          />
          <span className="text-xs text-gray-500">Si es igual a tu dirección personal, déjalo vacío</span>
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
      
      {/* Resumen de credenciales */}
      {(datos.usuario || datos.clave) && (
        <div className="bg-gray-50 p-3 rounded-lg mb-4">
          <h4 className="font-medium text-gray-700 mb-2">Resumen Credenciales:</h4>
          {datos.usuario && (
            <DisplayField label="Usuario" value={datos.usuario} />
          )}
          {datos.clave && (
            <div className="mb-2 p-2 bg-blue-50 rounded border border-blue-200">
              <span className="text-sm font-medium text-blue-800">Contraseña: </span>
              <span className="text-sm text-blue-900">••••••••</span>
            </div>
          )}
        </div>
      )}
      
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
          placeholder="Ej: maria.gonzalez"
        />
        <span className="text-xs text-gray-500">Solo letras, números, . y _</span>
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
          placeholder="Mínimo 6 caracteres"
        />
        <span className="text-xs text-gray-500">Debe incluir mayúsculas, minúsculas y números</span>
      </div>

      {/* Indicador de fortaleza de contraseña */}
      {datos.clave && (
        <div className="max-w-xs">
          <div className="flex justify-between text-xs mb-1">
            <span>Fortaleza:</span>
            <span className={`
              ${datos.clave.length >= 6 && /[a-z]/.test(datos.clave) && /[A-Z]/.test(datos.clave) && /\d/.test(datos.clave) 
                ? 'text-green-600' 
                : 'text-red-600'
              }
            `}>
              {datos.clave.length >= 6 && /[a-z]/.test(datos.clave) && /[A-Z]/.test(datos.clave) && /\d/.test(datos.clave) 
                ? 'Fuerte' 
                : 'Débil'
              }
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`
                h-2 rounded-full 
                ${datos.clave.length >= 6 && /[a-z]/.test(datos.clave) && /[A-Z]/.test(datos.clave) && /\d/.test(datos.clave) 
                  ? 'bg-green-600 w-full' 
                  : datos.clave.length >= 4 
                  ? 'bg-yellow-500 w-2/3' 
                  : 'bg-red-500 w-1/3'
                }
              `}
            ></div>
          </div>
        </div>
      )}

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