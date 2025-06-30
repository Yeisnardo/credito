import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { locationData } from "../components/Venezuela";
import miImagen from "../assets/imagenes/logo_ifemi.jpg";

import personaService from "../services/api_persona";
import emprendimientoService from "../services/api_emprendimiento";
import usuarioService from "../services/api_usuario";

import "../assets/css/style.css";

const RegistroEmprendedor = () => {
  const [paso, setPaso] = useState(1);
  const navigate = useNavigate();

  const [datos, setDatos] = useState({
    // Datos Persona
    cedula: "",
    nombre_completo: "",
    edad: "",
    telefono: "",
    correo: "",
    estado: "Yaracuy",
    municipio: "Independencia",
    direccion: "",
    tipo_persona: "Emprendedor",

    // Consejo Comunitario
    cedula_emprendedor: "",
    sector: "",
    consejo_nombre: "",
    comuna: "",
    tipo_sector: "",
    tipo_negocio: "",
    nombre_emprendimiento: "",
    direccion_emprendimiento: "",

    // Usuario
    cedula_usuario: "",
    usuario: "",
    clave: "",
    estatus: "Activo",
    rol: "Emprendedor",
  });

  const [municipios, setMunicipios] = useState([]);

  // Actualiza municipios al cambiar estado
  useEffect(() => {
    if (datos.estado) {
      const estadoActual = locationData.find((e) => e.estado === datos.estado);
      setMunicipios(estadoActual ? estadoActual.municipios : []);
      setDatos((prev) => ({ ...prev, municipio: "" }));
    }
  }, [datos.estado]);

  // Manejar cambios en los inputs
  const handleChange = (campo, valor) => {
    if (campo === "cedula") {
      const soloNumeros = valor.replace(/\D/g, "");
      if (soloNumeros.length <= 9) {
        setDatos((prev) => ({ ...prev, [campo]: soloNumeros }));
      }
    } else {
      setDatos((prev) => ({ ...prev, [campo]: valor }));
    }
  };

  // Validar y avanzar en el formulario
  const handleNext = () => {
    const validations = [
      // Validaciones paso 1
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
      // Validaciones paso 2
      () => {
        if (
          !datos.consejo_nombre.trim() ||
          !datos.comuna.trim() ||
          !datos.sector.trim() ||
          !datos.tipo_sector.trim() ||
          !datos.tipo_negocio.trim() ||
          !datos.nombre_emprendimiento.trim() ||
          !datos.direccion_emprendimiento.trim()
        ) {
          Swal.fire({
            icon: "error",
            title: "Campos incompletos",
            text: "Por favor, ingresa toda la información requerida.",
          });
          return false;
        }
        return true;
      },
      // Validaciones paso 3
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

  // Volver al paso anterior
  const handleBack = () => {
    if (paso > 1) setPaso(paso - 1);
  };

  // Finalizar y guardar datos
  const handleFinalizar = async () => {
    try {
      // Crear Persona
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

      // Crear Usuario
      const usuarioData = {
        cedula_usuario: datos.cedula,
        usuario: datos.usuario,
        clave: datos.clave,
        estatus: datos.estatus,
        rol: datos.rol,
      };
      await usuarioService.createUsuario(usuarioData);

      // Crear Emprendimiento
      const emprendimientoData = {
        cedula_emprendedor: datos.cedula,
        tipo_sector: datos.tipo_sector,
        tipo_negocio: datos.tipo_negocio,
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
      navigate("/");
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
    <div className="flex min-h-screen">
      {/* Lado izquierdo con imagen (solo en md y superior) */}
      <div className="w-1/2 hidden md:flex items-center justify-center p-4 bg-logoLoginEfimi">
        <img src={miImagen} alt="Logo" className="max-w-full h-auto" />
      </div>

      {/* Formulario paso a paso */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-2xl">
          {/* Título */}
          <h2 className="mb-6 text-2xl font-bold text-center text-gray-700">
            Registro de Emprendedor
          </h2>

          {/* Indicadores de pasos */}
          <div className="flex justify-center mb-4 space-x-3">
            {[1, 2, 3].map((n) => (
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

          {/* Paso 1 - Datos Personales */}
          {paso === 1 && (
            <div id="paso-1" className="space-y-4">
              <h3 className="text-xl mb-4 font-semibold">Datos Personales</h3>
              {/* Contenedor flexible para los campos en fila */}
              <div className="flex flex-wrap gap-4">
                {[
                  { label: "Cédula de Identidad", type: "text", id: "cedula" },
                  { label: "Nombre Completo", type: "text", id: "nombre_completo" },
                  { label: "Edad", type: "number", id: "edad", min: "0" },
                  { label: "Número de Teléfono", type: "tel", id: "telefono" },
                  { label: "Correo Electrónico", type: "email", id: "correo" },
                  { label: "Estado", type: "text", id: "estado" },
                  { label: "Municipio", type: "text", id: "municipio" },
                  { label: "Dirección Actual", type: "text", id: "direccion" },
                ].map(({ label, type, id, min }) => {
                  const isHidden = id === "estado";

                  const isDireccion = id === "direccion";

                  return (
                    <div
                      key={id}
                      className={isDireccion ? "w-full" : "w-[300px]"}
                      style={{ display: isHidden ? "none" : "block" }}
                    >
                      <label
                        htmlFor={id}
                        className="block mb-1 text-sm font-medium text-gray-600"
                      >
                        {label}
                      </label>
                      <input
                        type={type}
                        id={id}
                        value={datos[id]}
                        onChange={(e) => handleChange(id, e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        placeholder={`Ingresa ${label.toLowerCase()}`}
                        min={min}
                        required
                      />
                    </div>
                  );
                })}
              </div>
              {/* Campo oculto */}
              <div style={{ display: "none" }}>
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
                  className="w-[300px] border border-gray-300 rounded px-3 py-2"
                >
                  <option value="Emprendedor">Emprendedor</option>
                </select>
              </div>
              {/* Botón Siguiente */}
              <button
                onClick={handleNext}
                className="w-full py-2 px-4 mt-4 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Siguiente
              </button>
            </div>
          )}

          {/* Paso 2 - Datos del Consejo y Emprendimiento */}
          {paso === 2 && (
            <div id="paso-2" className="space-y-4">
              <h3 className="text-xl mb-4 font-semibold">Datos del Consejo y Emprendimiento</h3>
              {/* Contenedor flexible para colocar campos en fila */}
              <div className="flex flex-wrap gap-4">
                {[
                  {
                    label: "Cédula del Emprendedor",
                    type: "text",
                    id: "cedula_emprendedor",
                    value: datos.cedula,
                    readOnly: true,
                  },
                  { label: "Sector", type: "text", id: "sector" },
                  { label: "Consejo Nombre", type: "text", id: "consejo_nombre" },
                  { label: "Comuna", type: "text", id: "comuna" },
                  { label: "Tipo de Sector", type: "text", id: "tipo_sector" },
                  { label: "Tipo de Negocio", type: "text", id: "tipo_negocio" },
                  { label: "Nombre del Emprendimiento", type: "text", id: "nombre_emprendimiento" },
                  { label: "Dirección del Emprendimiento", type: "text", id: "direccion_emprendimiento" },
                ].map(({ label, type, id, value, readOnly }) => (
                  <div key={id} className="w-[250px]">
                    <label
                      className="block mb-1 text-sm font-medium text-gray-600"
                      htmlFor={id}
                    >
                      {label}
                    </label>
                    <input
                      type={type}
                      id={id}
                      value={value !== undefined ? value : datos[id]}
                      onChange={(e) => handleChange(id, e.target.value)}
                      className={`w-full border border-gray-300 rounded px-3 py-2 ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      placeholder={`Ingresa ${label.toLowerCase()}`}
                      required
                      readOnly={readOnly}
                    />
                  </div>
                ))}
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
                  onClick={handleNext}
                  className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {/* Paso 3 - Datos de Usuario */}
          {paso === 3 && (
            <div id="paso-3" className="space-y-4">
              <h3 className="text-xl mb-4 font-semibold">Datos de Usuario</h3>
              {/* Cédula del Emprendedor (solo lectura) */}
              <div>
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
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
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
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Nombre de usuario"
                  required
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
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Contraseña"
                  required
                />
              </div>
              {/* Estatus (oculto) */}
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
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Selecciona un estatus</option>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
              {/* Rol (oculto) */}
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
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="Emprendedor">Emprendedor</option>
                </select>
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