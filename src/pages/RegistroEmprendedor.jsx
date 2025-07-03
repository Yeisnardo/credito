import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
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

  const [clasificaciones, setClasificaciones] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [sectorSeleccionado, setSectorSeleccionado] = useState("");
  const [negocioSeleccionado, setNegocioSeleccionado] = useState("");

  const [municipios, setMunicipios] = useState([]);

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
      // Paso 1: Datos Personales
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
      // Paso 2: Sector, Negocio, Consejo y Comuna
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
      // Paso 3: Datos Usuario
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
      {/* Logo Izquierda */}
      <div className="w-1/2 hidden md:flex items-center justify-center p-4 bg-logoLoginEfimi">
        <img src={miImagen} alt="Logo" className="max-w-full h-auto" />
      </div>
      {/* Formulario paso a paso */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-2xl">
          <h2 className="mb-6 text-2xl font-bold text-center text-gray-700">
            Registro de Emprendedor
          </h2>
          {/* Indicadores */}
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

          {/* Paso 1 */}
          {paso === 1 && (
            <div id="paso-1" className="space-y-4">
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
                  <div
                    key={id}
                    className={id === "estado" ? "w-full" : "w-[300px]"}
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
                ))}
              </div>
              <button
                onClick={handleNext}
                className="w-full py-2 px-4 mt-4 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Siguiente
              </button>
            </div>
          )}

          {/* Paso 2 */}
          {paso === 2 && (
            <div id="paso-2" className="space-y-4">
              <h3 className="text-xl mb-4 font-semibold">
                Datos del Consejo y Emprendimiento
              </h3>
              {/* Campos */}
              <div className="flex flex-wrap gap-4">
                {/* Cédula del Emprendedor (solo lectura) */}
                <div className="w-[510px]">
                  <label
                    className="block mb-1 text-sm font-medium text-gray-600"
                    htmlFor="cedula_emprendedor"
                  >
                    Cédula del Emprendedor
                  </label>
                  <input
                    type="text"
                    id="cedula_emprendedor"
                    value={datos.cedula}
                    readOnly
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                  />
                </div>

                {/* Sector */}
                <div className="w-[250px]">
                  <label
                    className="block mb-1 text-sm font-medium text-gray-600"
                    htmlFor="tipo_sector"
                  >
                    Sector
                  </label>
                  <select
                    id="tipo_sector"
                    value={sectorSeleccionado}
                    onChange={(e) => {
                      setSectorSeleccionado(e.target.value);
                      setNegocioSeleccionado("");
                    }}
                    className="w-full border border-gray-300 rounded px-3 py-2"
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
                <div className="w-[250px]">
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
                    className="w-full border border-gray-300 rounded px-3 py-2"
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
                <div className="w-[250px]">
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
                    placeholder="Ingresa el nombre del emprendimiento"
                  />
                </div>
                {/* Dirección del Emprendimiento */}
                <div className="w-[250px]">
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
                    placeholder="Ingresa la dirección del emprendimiento"
                  />
                </div>
                {/* Consejo Nombre */}
                <div className="w-[250px]">
                  <label
                    className="block mb-1 text-sm font-medium text-gray-600"
                    htmlFor="consejo_nombre"
                  >
                    Nombre del Consejo Comunitario
                  </label>
                  <input
                    type="text"
                    id="consejo_nombre"
                    value={datos.consejo_nombre}
                    onChange={(e) =>
                      handleChange("consejo_nombre", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="Ingresa el nombre del consejo"
                  />
                </div>

                {/* Comuna */}
                <div className="w-[250px]">
                  <label
                    className="block mb-1 text-sm font-medium text-gray-600"
                    htmlFor="comuna"
                  >
                    Comuna
                  </label>
                  <input
                    type="text"
                    id="comuna"
                    value={datos.comuna}
                    onChange={(e) => handleChange("comuna", e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="Ingresa la comuna"
                  />
                </div>
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

          {/* Paso 3 */}
          {paso === 3 && (
            <div id="paso-3" className="space-y-4">
              <h3 className="text-xl mb-4 font-semibold">Datos de Usuario</h3>
              {/* Cédula del Emprendedor */}
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
                  className="w-full border border-gray-300 rounded px-3 py-2"
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
