import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { motion } from "framer-motion"; // Importar motion
import { locationData } from "../components/Venezuela";
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
    estado: "Yaracuy",
    municipio: "Independencia",
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

  // Cargar clasificaciones y gestionar municipios
  useEffect(() => {
    const fetchClasificaciones = async () => {
      try {
        const data = await clasificacionService.getClasificaciones();
        setClasificaciones(data);
        const sectoresUnicos = [...new Set(data.map((item) => item.sector))];
        setSectores(sectoresUnicos);
      } catch (error) {
        console.error("Error cargando clasificaciones:", error);
      }
    };
    fetchClasificaciones();

    if (datos.estado) {
      const estadoActual = locationData.find((e) => e.estado === datos.estado);
      if (estadoActual) {
        setMunicipios(estadoActual.municipios);
        if (
          datos.estado === "Yaracuy" &&
          (!datos.municipio || datos.municipio === "")
        ) {
          setDatos((prev) => ({ ...prev, municipio: "Independencia" }));
        }
      } else {
        setMunicipios([]);
        setDatos((prev) => ({ ...prev, municipio: "" }));
      }
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
    } else {
      setDatos((prev) => ({ ...prev, [campo]: valor }));
    }
  };

  const handleNext = () => {
    const validations = [
      () => {
        if (
          !datos.cedula.trim() ||
          datos.cedula.length < 6 ||
          datos.cedula.length > 9 ||
          !datos.nombre_completo.trim() ||
          !datos.edad.toString().trim() ||
          !datos.telefono.trim() ||
          !datos.correo.trim()
        ) {
          Swal.fire({
            icon: "error",
            title: "Campos incompletos",
            text: "Por favor, completa todos los datos personales correctamente. La cédula debe tener entre 6 y 9 dígitos y solo números.",
          });
          return false;
        }
        return true;
      },
      () => {
        if (
          !sectorSeleccionado ||
          !negocioSeleccionado ||
          !datos.consejo_nombre.trim() ||
          !datos.comuna.trim()
        ) {
          Swal.fire({
            icon: "error",
            title: "Campos incompletos",
            text: "Por favor, completa todos los campos del paso 2, incluyendo consejo y comuna.",
          });
          return false;
        }
        return true;
      },
      () => {
        if (!datos.usuario.trim() || !datos.clave.trim()) {
          Swal.fire({
            icon: "error",
            title: "Campos incompletos",
            text: "Por favor, ingresa usuario y contraseña.",
          });
          return false;
        }
        return true;
      },
    ];

    if (validations[paso - 1] && !validations[paso - 1]()) return;

    if (paso < 3) {
      setPaso(paso + 1);
    } else {
      handleFinalizar();
    }
  };

  const handleBack = () => {
    if (paso > 1) setPaso(paso - 1);
  };

  const handleFinalizar = async () => {
    try {
      const personaData = {
        cedula: datos.cedula,
        nombre_completo: datos.nombre_completo,
        edad: parseInt(datos.edad) || 0,
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
        direccion_emprendimiento: datos.direccion_emprendimiento,
      };
      await emprendimientoService.createEmprendimiento(emprendimientoData);

      Swal.fire({
        icon: "success",
        title: "Registro completo",
        text: "Todos los datos han sido registrados.",
      });
      navigate("/Login");
    } catch (error) {
      console.error("Error en registro:", error);
      Swal.fire({
        icon: "error",
        title: "Error en el registro",
        text: "Hubo un problema al guardar los datos.",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-serif">
      {/* Logo izquierda con animación */}
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

      {/* Formulario paso a paso con animación */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex-1 flex items-center justify-center p-8"
      >
        <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-8 ">
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
                onClick={() => {
                  if (n <= paso) {
                    setPaso(n);
                    document
                      .querySelector(`#paso-${n}`)
                      ?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                whileHover={{ scale: 1.1 }}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer ${
                  paso === n ? "bg-[#1A2C5B] scale-125" : "bg-gray-300"
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
              </motion.button>
            ))}
          </div>

          {/* Paso 1 */}
          {paso === 1 && (
            <motion.div
              id="paso-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              {/* Campos paso 1 */}
              <div className="flex flex-wrap gap-4">
                {[
                  { label: "Cédula de Identidad", type: "text", id: "cedula" },
                  {
                    label: "Nombre Completo",
                    type: "text",
                    id: "nombre_completo",
                  },
                  { label: "Edad", type: "number", id: "edad", min: "0" },
                  { label: "Número de Teléfono", type: "tel", id: "telefono" },
                  { label: "Correo Electrónico", type: "email", id: "correo" },
                  { label: "Dirección Actual", type: "text", id: "direccion" },
                ].map(({ label, type, id, min }) => (
                  <div key={id} className="w-full md:w-[45%]">
                    <label
                      htmlFor={id}
                      className="block mb-1 text-sm font-medium text-gray-600"
                    >
                      {label}
                    </label>
                    <motion.input
                      type={type}
                      id={id}
                      value={datos[id]}
                      onChange={(e) => handleChange(id, e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A2C5B]"
                      placeholder={`Ingresa ${label.toLowerCase()}`}
                      min={min}
                      required
                      whileFocus={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                ))}
              </div>
              {/* Botón Siguiente */}
              <motion.button
                onClick={handleNext}
                whileHover={{ scale: 1.05, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
                transition={{ duration: 0.3 }}
                className="w-full py-3 px-6 bg-blue-900 text-white font-semibold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-300"
              >
                Siguiente
              </motion.button>
              {/* Regresar al login */}
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
          )}

          {/* Paso 2 */}
          {paso === 2 && (
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
              {/* Campos paso 2 */}
              <div className="flex flex-wrap gap-4">
                {/* Sector */}
                <div className="w-[45%]">
                  <label
                    className="block mb-1 text-sm font-medium text-gray-600"
                    htmlFor="tipo_sector"
                  >
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
                <div className="w-[45%]">
                  <label
                    className="block mb-1 text-sm font-medium text-gray-600"
                    htmlFor="tipo_negocio"
                  >
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
                <div className="w-[180%]">
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
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A2C5B]"
                    placeholder="Ingresa el nombre del emprendimiento"
                  />
                </div>
                {/* Dirección del Emprendimiento */}
                <div className="w-[200%]">
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
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A2C5B]"
                    placeholder="Ingresa la dirección del emprendimiento"
                  />
                </div>
                {/* Consejo Nombre */}
                <div className="w-[45%]">
                  <label
                    className="block mb-1 text-sm font-medium text-gray-600"
                    htmlFor="consejo_nombre"
                  >
                    Nombre del Consejo Comunal
                  </label>
                  <input
                    type="text"
                    id="consejo_nombre"
                    value={datos.consejo_nombre}
                    onChange={(e) =>
                      handleChange("consejo_nombre", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A2C5B]"
                    placeholder="Ingresa el nombre del consejo"
                  />
                </div>
                {/* Comuna */}
                <div className="w-[45%]">
                  <label
                    className="block mb-1 text-sm font-medium text-gray-600"
                    htmlFor="comuna"
                  >
                    Nombre de la Comuna
                  </label>
                  <input
                    type="text"
                    id="comuna"
                    value={datos.comuna}
                    onChange={(e) => handleChange("comuna", e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A2C5B]"
                    placeholder="Ingresa la comuna"
                  />
                </div>
              </div>
              {/* Botones paso */}
              <div className="flex justify-between mt-4">
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
          )}

          {/* Paso 3 */}
          {paso === 3 && (
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
              {/* Cédula del Emprendedor */}
              <div style={{ display: "none" }}>
                <label
                  className="block mb-1 text-sm font-medium text-gray-600"
                  htmlFor="cedula_usuario"
                >
                  Cédula del Emprendedor
                </label>
                <input
                  type="text"
                  id="cedula_usuario"
                  value={datos.cedula}
                  readOnly
                  className="w-full max-w-xs border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                  placeholder="Cédula del emprendedor"
                />
              </div>
              {/* Usuario */}
              <div>
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
                  className="w-full max-w-xs border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A2C5B]"
                  placeholder="Nombre de usuario"
                />
              </div>
              {/* Contraseña */}
              <div>
                <label
                  className="block mb-1 text-sm font-medium text-gray-600"
                  htmlFor="clave"
                >
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
              {/* Ocultos */}
              <div style={{ display: "none" }}>
                <label
                  htmlFor="estatus"
                  className="block mb-1 text-sm font-medium text-gray-600"
                >
                  Estatus
                </label>
                <select
                  id="estatus"
                  value={datos.estatus}
                  onChange={(e) => handleChange("estatus", e.target.value)}
                  className="w-full max-w-xs border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A2C5B]"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
              <div style={{ display: "none" }}>
                <label
                  htmlFor="rol"
                  className="block mb-1 text-sm font-medium text-gray-600"
                >
                  Rol
                </label>
                <select
                  id="rol"
                  value={datos.rol}
                  onChange={(e) => handleChange("rol", e.target.value)}
                  className="w-full max-w-xs border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A2C5B]"
                >
                  <option value="Emprendedor">Emprendedor</option>
                </select>
              </div>
              {/* Botones */}
              <div className="flex justify-between mt-4">
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
                >
                  Finalizar
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default RegistroEmprendedor;