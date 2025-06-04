import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import miImagen from "../assets/imagenes/logo_ifemi.jpg";
import { locationData } from "../components/Venezuela";

// Servicios API
import personaService from "../services/api_persona";
import usuarioService from "../services/api_usuario";
import ubicacionService from "../services/api_ubicaciones";
import emprendimientoService from "../services/api_emprendimiento";
import consejoService from "../services/api_consejoComunal";

import "../assets/css/style.css";

const RegistroEmprendedor = () => {
  const [paso, setPaso] = useState(1);
  const navigate = useNavigate();

  const [datos, setDatos] = useState({
    // Datos Personales
    cedula: "",
    nombre_completo: "",
    edad: "",
    telefono: "",
    correo: "",
    tipo_persona: "Emprendedor",

    // Dirección Personal (sin parroquia)
    estado: "",
    municipio: "",
    direccion: "",

    // Datos del emprendimiento
    nombre_emprendimiento: "",
    tipo_sector: "",
    tipo_negocio: "",
    direccion_emprendimiento: "",

    // Consejo comunal
    consejo_nombre: "",
    comuna: "",

    // Datos de usuario
    usuario: "",
    contrasena: "",
    estatus: "Activo",
    rol: "Emprendedor",
    foto_rostro: null,
  });

  const [municipios, setMunicipios] = useState([]);
  const [parroquias, setParroquias] = useState([]); // Aunque no usamos parroquias aquí, lo mantenemos si quieres en el futuro

  // Actualiza municipios según el estado
  useEffect(() => {
    if (datos.estado) {
      const estadoActual = locationData.find((e) => e.estado === datos.estado);
      setMunicipios(estadoActual ? estadoActual.municipios : []);
      setDatos((prev) => ({ ...prev, municipio: "" }));
    }
  }, [datos.estado]);

  // Cuando cambian el municipio, si quieres agregar parroquias en el futuro
  useEffect(() => {
    if (datos.municipio && municipios.length > 0) {
      const municipioActual = municipios.find(
        (m) => m.municipio === datos.municipio
      );
      // setParroquias(municipioActual ? municipioActual.parroquias : []);
      // setDatos((prev) => ({ ...prev, parroquia: "" }));
    }
  }, [datos.municipio, municipios]);

  const handleChange = (campo, valor) => {
    setDatos({ ...datos, [campo]: valor });
  };

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

  const handleNext = () => {
    // Validaciones por paso
    if (paso === 1) {
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
    } else if (paso === 2) {
      if (
        !datos.estado ||
        !datos.municipio ||
        !datos.direccion.trim()
      ) {
        Swal.fire({
          icon: "error",
          title: "Campos incompletos",
          text: "Por favor, ingresa toda la dirección.",
        });
        return;
      }
    } else if (paso === 3) {
      if (
        !datos.consejo_nombre.trim() ||
        !datos.comuna.trim()
      ) {
        Swal.fire({
          icon: "error",
          title: "Campos incompletos",
          text: "Por favor, ingresa toda la info del Consejo Comunal.",
        });
        return;
      }
    } else if (paso === 4) {
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
    } else if (paso === 5) {
      if (!datos.usuario.trim() || !datos.contrasena.trim()) {
        Swal.fire({
          icon: "error",
          title: "Campos incompletos",
          text: "Por favor, ingresa el nombre de usuario y la contraseña.",
        });
        return;
      }
    }

    if (paso < 5) {
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
      // Crear persona
      const nuevaPersona = {
        cedula: datos.cedula,
        nombre_completo: datos.nombre_completo,
        edad: parseInt(datos.edad) || 0,
        telefono: datos.telefono,
        email: datos.correo,
        tipo_persona: datos.tipo_persona,
      };
      await personaService.createPersona(nuevaPersona);

      // Crear ubicación
      const nuevaUbicacion = {
        cedula_persona: datos.cedula,
        estado: datos.estado,
        municipio: datos.municipio,
        direccion_actual: datos.direccion,
      };
      await ubicacionService.createUbicacion(nuevaUbicacion);

      // Crear usuario
      const nuevoUsuario = {
        cedula_usuario: datos.cedula,
        usuario: datos.usuario,
        contrasena: datos.contrasena,
        estatus: datos.estatus,
        rol: "Emprendedor",
        foto_rostro: datos.foto_rostro,
      };
      await usuarioService.createUsuario(nuevoUsuario);

      // Crear emprendimiento
      const nuevoEmprendimiento = {
        cedula_emprendedor: datos.cedula,
        nombre_emprendimiento: datos.nombre_emprendimiento,
        sector: datos.tipo_sector,
        tipo_negocio: datos.tipo_negocio,
        direccion_emprendimiento: datos.direccion_emprendimiento,
      };
      await emprendimientoService.createEmprendimiento(nuevoEmprendimiento);

      // Crear consejo comunal
      const nuevoConsejo = {
        consejo_nombre: datos.consejo_nombre,
        comuna: datos.comuna,
      };
      await consejoService.createConsejo(nuevoConsejo);

      Swal.fire({
        icon: "success",
        title: "Registro completo",
        text: "Tus datos han sido registrados correctamente.",
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
      {/* Lado izquierda con imagen */}
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
              <h3 className="text-xl mb-4">Datos Personales</h3>
              {/* Cedula */}
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-600" htmlFor="cedula">
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
                <label className="block mb-1 text-sm font-medium text-gray-600" htmlFor="nombre_completo">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="nombre_completo"
                  value={datos.nombre_completo}
                  onChange={(e) => handleChange("nombre_completo", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Ingresa tu nombre completo"
                />
              </div>
              {/* Edad */}
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-600" htmlFor="edad">
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
                <label className="block mb-1 text-sm font-medium text-gray-600" htmlFor="telefono">
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
                <label className="block mb-1 text-sm font-medium text-gray-600" htmlFor="correo">
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
                <label className="block mb-1 text-sm font-medium text-gray-600" htmlFor="tipo_persona">
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
              <h3 className="text-xl mb-4">Dirección Personal</h3>
              {/* Estado */}
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-600" htmlFor="estado">
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
                <label className="block mb-1 text-sm font-medium text-gray-600" htmlFor="municipio">
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
                <label className="block mb-1 text-sm font-medium text-gray-600" htmlFor="direccion">
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
              <h3 className="text-xl mb-4">Datos del Consejo Comunal</h3>
              {/* Sector */}
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-600" htmlFor="consejo_nombre">
                  Sector
                </label>
                <input
                  type="text"
                  id="consejo_nombre"
                  value={datos.consejo_nombre}
                  onChange={(e) => handleChange("consejo_nombre", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Sector"
                />
              </div>
              {/* Consejo */}
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-600" htmlFor="consejo_direccion">
                  Consejo Comunal
                </label>
                <input
                  type="text"
                  id="consejo_direccion"
                  value={datos.consejo_direccion}
                  onChange={(e) => handleChange("consejo_direccion", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Dirección del Consejo"
                />
              </div>
              {/* Comunidad */}
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-600" htmlFor="comuna">
                  Comuna
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
              <h3 className="text-xl mb-4">Registro de Emprendimiento</h3>
              {/* Sector */}
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-600" htmlFor="tipo_sector">
                  Sector
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
                <label className="block mb-1 text-sm font-medium text-gray-600" htmlFor="tipo_negocio">
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
                <label className="block mb-1 text-sm font-medium text-gray-600" htmlFor="nombre_emprendimiento">
                  Nombre del Emprendimiento
                </label>
                <input
                  type="text"
                  id="nombre_emprendimiento"
                  value={datos.nombre_emprendimiento}
                  onChange={(e) => handleChange("nombre_emprendimiento", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Nombre del emprendimiento"
                />
              </div>
              {/* Dirección del emprendimiento */}
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-600" htmlFor="direccion_emprendimiento">
                  Dirección del Emprendimiento
                </label>
                <input
                  type="text"
                  id="direccion_emprendimiento"
                  value={datos.direccion_emprendimiento}
                  onChange={(e) => handleChange("direccion_emprendimiento", e.target.value)}
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
              <h3 className="text-xl mb-4">Registro de Usuario</h3>
              {/* Usuario */}
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-600" htmlFor="usuario">
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
                <label className="block mb-1 text-sm font-medium text-gray-600" htmlFor="contrasena">
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
                <label className="block mb-1 text-sm font-medium text-gray-600" htmlFor="foto_rostro">
                  Foto del Rostro
                </label>
                <input
                  type="file"
                  id="foto_rostro"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mb-2"
                />
                {datos.foto_rostro && (
                  <div className="mt-2">
                    <img
                      src={datos.foto_rostro}
                      alt="Foto del Rostro"
                      className="w-32 h-32 object-cover rounded-full border-2 border-gray-300"
                    />
                  </div>
                )}
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