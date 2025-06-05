import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import miImagen from "../assets/imagenes/logo_ifemi.jpg";
import { locationData } from "../components/Venezuela";

// Servicios API
import personaService from "../services/api_persona";
import ubicacionService from "../services/api_ubicaciones";
import usuarioService from "../services/api_usuario";
import emprendimientoService from "../services/api_emprendimiento";
import consejoService from "../services/api_consejoComunal";

import "../assets/css/style.css";

const RegistroEmprendedor = () => {
  const [paso, setPaso] = useState(1);
  const navigate = useNavigate();

  // Estado de los datos del formulario
  const [datos, setDatos] = useState({
    // Datos Personales
    cedula: "",
    nombre_completo: "",
    edad: "",
    telefono: "",
    correo: "",
    tipo_persona: "Emprendedor",

    // Dirección Personal
    estado: "",
    municipio: "",
    direccion: "",

    // Datos del emprendimiento
    nombre_emprendimiento: "",
    tipo_sector: "",
    tipo_negocio: "",
    direccion_emprendimiento: "",

    // Consejo comunal
    sector: "", // Nuevo campo
    consejo_nombre: "",
    comuna: "",

    // Datos de usuario
    usuario: "",
    contrasena: "",
    estatus: "Activo(a)",
    rol: "Emprendedor",
    foto_rostro: null,
  });

  const [municipios, setMunicipios] = useState([]);

  // Actualiza municipios según el estado seleccionado
  useEffect(() => {
    if (datos.estado) {
      const estadoActual = locationData.find((e) => e.estado === datos.estado);
      setMunicipios(estadoActual ? estadoActual.municipios : []);
      setDatos((prev) => ({ ...prev, municipio: "" }));
    }
  }, [datos.estado]);

  // Función para manejar cambios en los inputs
  const handleChange = (campo, valor) => {
    setDatos({ ...datos, [campo]: valor });
  };

  // Función para manejar cambio de imagen y convertirla a base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setDatos((prevDatos) => ({
          ...prevDatos,
          foto_rostro: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para avanzar en los pasos del formulario con validaciones
  const handleNext = () => {
    switch (paso) {
      case 1:
        if (
          !datos.cedula.trim() ||
          !datos.nombre_completo.trim() ||
          !datos.telefono.trim() ||
          !datos.correo.trim()
        ) {
          Swal.fire({
            icon: "error",
            title: "Campos incompletos",
            text: "Por favor, completa todos los datos personales.",
          });
          return;
        }
        break;
      case 2:
        if (!datos.estado || !datos.municipio || !datos.direccion.trim()) {
          Swal.fire({
            icon: "error",
            title: "Campos incompletos",
            text: "Por favor, ingresa toda la dirección.",
          });
          return;
        }
        break;
      case 3:
        if (
          !datos.consejo_nombre.trim() ||
          !datos.comuna.trim() ||
          !datos.sector.trim()
        ) {
          Swal.fire({
            icon: "error",
            title: "Campos incompletos",
            text: "Por favor, ingresa toda la info del Consejo Comunal y Sector.",
          });
          return;
        }
        break;
      case 4:
        if (
          !datos.tipo_sector.trim() ||
          !datos.tipo_negocio.trim() ||
          !datos.nombre_emprendimiento.trim() ||
          !datos.direccion_emprendimiento.trim()
        ) {
          Swal.fire({
            icon: "error",
            title: "Campos incompletos",
            text: "Por favor, ingresa toda la info del Emprendimiento.",
          });
          return;
        }
        break;
      case 5:
        if (!datos.usuario.trim() || !datos.contrasena.trim()) {
          Swal.fire({
            icon: "error",
            title: "Campos incompletos",
            text: "Por favor, ingresa el nombre de usuario y la contraseña.",
          });
          return;
        }
        break;
      default:
        break;
    }

    // Avanza o finaliza
    if (paso < 5) {
      setPaso(paso + 1);
    } else {
      handleFinalizar();
    }
  };

  // Función para volver en los pasos
  const handleBack = () => {
    if (paso > 1) setPaso(paso - 1);
  };

  // Función para finalizar y guardar los datos en backend
  const handleFinalizar = async () => {
    try {
      console.log("Iniciando registro...");
      // Crear Persona
      const personaData = {
        cedula: datos.cedula,
        nombre_completo: datos.nombre_completo,
        edad: parseInt(datos.edad) || 0,
        telefono: datos.telefono,
        email: datos.correo,
        tipo_persona: datos.tipo_persona,
      };
      const personaResponse = await personaService.createPersona(personaData);
      console.log("Persona creada:", personaResponse);

      // Crear Ubicación
      const ubicacionData = {
        cedula_persona: datos.cedula,
        estado: datos.estado,
        municipio: datos.municipio,
        direccion_actual: datos.direccion,
      };
      const ubicacionResponse = await ubicacionService.createUbicacion(
        ubicacionData
      );
      console.log("Ubicación creada:", ubicacionResponse);

      // Crear Usuario
      const usuarioData = {
        cedula_usuario: datos.cedula,
        usuario: datos.usuario,
        contrasena: datos.contrasena,
        estatus: datos.estatus,
        rol: datos.rol,
        foto_rostro: datos.foto_rostro,
      };
      const usuarioResponse = await usuarioService.createUsuario(usuarioData);
      console.log("Usuario creado:", usuarioResponse);

      const emprendimientoData = {
        cedula_emprendedor: datos.cedula,
        tipo_sector: datos.tipo_sector,
        tipo_negocio: datos.tipo_negocio,
        nombre_emprendimiento: datos.nombre_emprendimiento,
        direccion_emprendimiento: datos.direccion_emprendimiento,
      };
      const emprendimientoResponse =
        await emprendimientoService.createEmprendimiento(emprendimientoData);
      console.log("Emprendimiento creado:", emprendimientoResponse);

      // Crear Consejo
      const consejoData = {
        cedula_persona: datos.cedula,
        consejo_nombre: datos.consejo_nombre,
        comuna: datos.comuna,
        sector: datos.sector,
      };
      const consejoResponse = await consejoService.createConsejo(consejoData);
      console.log("Consejo creado:", consejoResponse);

      Swal.fire({
        icon: "success",
        title: "Registro completo",
        text: "Todos los datos han sido registrados correctamente.",
      });
      navigate("/");
    } catch (error) {
      console.error("Error en registro:", error);
      Swal.fire({
        icon: "error",
        title: "Error en el registro",
        text: "Hubo un problema al guardar los datos. Intenta nuevamente.",
      });
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Lado izquierdo con imagen */}
      <div className="w-1/2 hidden md:flex items-center justify-center p-4 bg-logoLoginEfimi">
        <img src={miImagen} alt="Logo" className="max-w-full h-auto" />
      </div>

      {/* Contenido paso a paso */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-2xl">
          {/* Título */}
          <h2 className="mb-6 text-2xl font-bold text-center text-gray-700">
            Registro de Emprendedor
          </h2>

          {/* Indicadores de pasos */}
          <div className="flex justify-center mb-4 space-x-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => {
                  if (n <= paso) {
                    setPaso(n);
                    document
                      .querySelector(`#paso-${n}`)
                      ?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer ${
                  paso === n ? "bg-blue-500 scale-125" : "bg-gray-400"
                }`}
              >
                {n < paso ? (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span className="text-white font-semibold">{n}</span>
                )}
              </button>
            ))}
          </div>

          {/* Secciones por paso */}
          {paso === 1 && (
            <div>
              {/* Datos Personales */}
              <h3 className="text-xl mb-4">Datos Personales</h3>
              {/* Cedula */}
              <div className="mb-4">
                <label
                  className="block mb-1 text-sm font-medium text-gray-600"
                  htmlFor="cedula"
                >
                  Cédula
                </label>
                <input
                  type="text"
                  id="cedula"
                  value={datos.cedula}
                  onChange={(e) => handleChange("cedula", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Ingresa tu cédula"
                />
              </div>
              {/* Nombre */}
              <div className="mb-4">
                <label
                  className="block mb-1 text-sm font-medium text-gray-600"
                  htmlFor="nombre_completo"
                >
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="nombre_completo"
                  value={datos.nombre_completo}
                  onChange={(e) =>
                    handleChange("nombre_completo", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Ingresa tu nombre completo"
                />
              </div>
              {/* Edad */}
              <div className="mb-4">
                <label
                  className="block mb-1 text-sm font-medium text-gray-600"
                  htmlFor="edad"
                >
                  Edad
                </label>
                <input
                  type="number"
                  id="edad"
                  value={datos.edad}
                  onChange={(e) => handleChange("edad", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Edad en años"
                  min="0"
                />
              </div>
              {/* Teléfono */}
              <div className="mb-4">
                <label
                  className="block mb-1 text-sm font-medium text-gray-600"
                  htmlFor="telefono"
                >
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="telefono"
                  value={datos.telefono}
                  onChange={(e) => handleChange("telefono", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Número de teléfono"
                />
              </div>
              {/* Correo */}
              <div className="mb-4">
                <label
                  className="block mb-1 text-sm font-medium text-gray-600"
                  htmlFor="correo"
                >
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="correo"
                  value={datos.correo}
                  onChange={(e) => handleChange("correo", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="ejemplo@correo.com"
                />
              </div>
              {/* Tipo de Persona */}
              <div className="mb-4">
                <label
                  className="block mb-1 text-sm font-medium text-gray-600"
                  htmlFor="tipo_persona"
                >
                  Tipo de Persona
                </label>
                <select
                  id="tipo_persona"
                  value={datos.tipo_persona}
                  onChange={(e) => handleChange("tipo_persona", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="Emprendedor">Emprendedor</option>
                </select>
              </div>
              {/* Botón Siguiente */}
              <button
                onClick={handleNext}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Siguiente
              </button>
            </div>
          )}

          {paso === 2 && (
            <div>
              {/* Dirección Personal */}
              <h3 className="text-xl mb-4">Dirección Personal</h3>
              {/* Estado */}
              <div className="mb-4">
                <label
                  className="block mb-1 text-sm font-medium text-gray-600"
                  htmlFor="estado"
                >
                  Estado
                </label>
                <select
                  id="estado"
                  value={datos.estado}
                  onChange={(e) => handleChange("estado", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">-- Selecciona un Estado --</option>
                  {locationData.map((estado) => (
                    <option key={estado.estado} value={estado.estado}>
                      {estado.estado}
                    </option>
                  ))}
                </select>
              </div>
              {/* Municipio */}
              <div className="mb-4">
                <label
                  className="block mb-1 text-sm font-medium text-gray-600"
                  htmlFor="municipio"
                >
                  Municipio
                </label>
                <select
                  id="municipio"
                  value={datos.municipio}
                  onChange={(e) => handleChange("municipio", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  disabled={!datos.estado}
                >
                  <option value="">-- Selecciona un Municipio --</option>
                  {municipios.map((m) => (
                    <option key={m.municipio} value={m.municipio}>
                      {m.municipio}
                    </option>
                  ))}
                </select>
              </div>
              {/* Dirección */}
              <div className="mb-4">
                <label
                  className="block mb-1 text-sm font-medium text-gray-600"
                  htmlFor="direccion"
                >
                  Dirección
                </label>
                <input
                  type="text"
                  id="direccion"
                  value={datos.direccion}
                  onChange={(e) => handleChange("direccion", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Dirección actual"
                />
              </div>
              {/* Botones */}
              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="py-2 px-4 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Anterior
                </button>
                <button
                  onClick={handleNext}
                  className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {paso === 3 && (
            <div>
              {/* Datos del Consejo Comunal */}
              <h3 className="text-xl mb-4">Datos del Consejo Comunal</h3>
              {/* Sector */}
              <div className="mb-4">
                <label
                  className="block mb-1 text-sm font-medium text-gray-600"
                  htmlFor="sector"
                >
                  Sector
                </label>
                <input
                  type="text"
                  id="sector"
                  value={datos.sector}
                  onChange={(e) => handleChange("sector", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Sector del Consejo"
                />
              </div>
              {/* Nombre del Consejo */}
              <div className="mb-4">
                <label
                  className="block mb-1 text-sm font-medium text-gray-600"
                  htmlFor="consejo_nombre"
                >
                  Consejo Nombre
                </label>
                <input
                  type="text"
                  id="consejo_nombre"
                  value={datos.consejo_nombre}
                  onChange={(e) =>
                    handleChange("consejo_nombre", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Nombre del Consejo"
                />
              </div>
              {/* Comunidad */}
              <div className="mb-4">
                <label
                  className="block mb-1 text-sm font-medium text-gray-600"
                  htmlFor="comuna"
                >
                  Comunidad
                </label>
                <input
                  type="text"
                  id="comuna"
                  value={datos.comuna}
                  onChange={(e) => handleChange("comuna", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Nombre de la Comunidad"
                />
              </div>
              {/* Botones */}
              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="py-2 px-4 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Anterior
                </button>
                <button
                  onClick={handleNext}
                  className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {paso === 4 && (
            <div>
              {/* Registro de Emprendimiento */}
              <h3 className="text-xl mb-4">Registro de Emprendimiento</h3>
              {/* Tipo de Sector */}
              <div className="mb-4">
                <label
                  className="block mb-1 text-sm font-medium text-gray-600"
                  htmlFor="tipo_sector"
                >
                  Tipo de Sector
                </label>
                <input
                  type="text"
                  id="tipo_sector"
                  value={datos.tipo_sector}
                  onChange={(e) => handleChange("tipo_sector", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Ej: Agroindustrial, Comercial..."
                />
              </div>
              {/* Tipo de Negocio */}
              <div className="mb-4">
                <label
                  className="block mb-1 text-sm font-medium text-gray-600"
                  htmlFor="tipo_negocio"
                >
                  Tipo de Negocio
                </label>
                <input
                  type="text"
                  id="tipo_negocio"
                  value={datos.tipo_negocio}
                  onChange={(e) => handleChange("tipo_negocio", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Venta, Producción, Servicios..."
                />
              </div>
              {/* Nombre del Emprendimiento */}
              <div className="mb-4">
                <label
                  className="block mb-1 text-sm font-medium text-gray-600"
                  htmlFor="nombre_emprendimiento"
                >
                  Nombre del Emprendimiento
                </label>
                <input
                  type="text"
                  id="nombre_emprendimiento"
                  value={datos.nombre_emprendimiento}
                  onChange={(e) =>
                    handleChange("nombre_emprendimiento", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Nombre del emprendimiento"
                />
              </div>
              {/* Dirección del emprendimiento */}
              <div className="mb-4">
                <label
                  className="block mb-1 text-sm font-medium text-gray-600"
                  htmlFor="direccion_emprendimiento"
                >
                  Dirección del Emprendimiento
                </label>
                <input
                  type="text"
                  id="direccion_emprendimiento"
                  value={datos.direccion_emprendimiento}
                  onChange={(e) =>
                    handleChange("direccion_emprendimiento", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Dirección del emprendimiento"
                />
              </div>
              {/* Botones */}
              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="py-2 px-4 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Anterior
                </button>
                <button
                  onClick={handleNext}
                  className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {paso === 5 && (
            <div>
              {/* Registro de Usuario */}
              <h3 className="text-xl mb-4">Registro de Usuario</h3>
              {/* Nombre de Usuario */}
              <div className="mb-4">
                <label
                  className="block mb-1 text-sm font-medium text-gray-600"
                  htmlFor="usuario"
                >
                  Nombre de Usuario
                </label>
                <input
                  type="text"
                  id="usuario"
                  value={datos.usuario}
                  onChange={(e) => handleChange("usuario", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Nombre de usuario"
                />
              </div>
              {/* Contraseña */}
              <div className="mb-4">
                <label
                  className="block mb-1 text-sm font-medium text-gray-600"
                  htmlFor="contrasena"
                >
                  Contraseña
                </label>
                <input
                  type="password"
                  id="contrasena"
                  value={datos.contrasena}
                  onChange={(e) => handleChange("contrasena", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Contraseña"
                />
              </div>
              {/* Foto del rostro */}
              <div className="mb-4">
                <label
                  className="block mb-1 text-sm font-medium text-gray-600"
                  htmlFor="foto_rostro"
                >
                  Foto del Rostro
                </label>
                <input
                  type="file"
                  id="foto_rostro"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mb-2 w-full border border-gray-300 rounded px-3 py-2"
                />
                {datos.foto_rostro && (
                  <div className="mt-2">
                    <img
                      src={datos.foto_rostro}
                      alt="Foto del Rostro"
                      className="w-32 h-32 rounded-full border-2 border-gray-300"
                    />
                  </div>
                )}
              </div>
              {/* Campos ocultos */}
              <div className="mb-4 hidden">
                <input
                  type="hidden"
                  id="estatus"
                  value={datos.estatus}
                  onChange={(e) => handleChange("estatus", e.target.value)}
                />
                <input
                  type="hidden"
                  id="rol"
                  value={datos.rol}
                  onChange={(e) => handleChange("rol", e.target.value)}
                />
              </div>
              {/* Botones */}
              <div className="flex justify-between mt-4">
                <button
                  onClick={handleBack}
                  className="py-2 px-4 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Anterior
                </button>
                <button
                  onClick={handleFinalizar}
                  className="py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Finalizar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistroEmprendedor;
