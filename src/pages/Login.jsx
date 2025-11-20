import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { motion } from "framer-motion";
// Importar Tabler Icons
import { TbUser, TbLock, TbLogin, TbAlertCircle } from "react-icons/tb";
import miImagen from "../assets/image/logo_ifemi.jpg";

const Login = ({ setUser }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!username || !password) {
      Swal.fire({
        icon: "error",
        title: "Campos incompletos",
        text: "Por favor, completa todos los campos.",
      });
      setLoading(false);
      return;
    }
    if (username.length < 5) {
      Swal.fire({
        icon: "error",
        title: "Nombre de usuario inválido",
        text: "El nombre de usuario debe tener al menos 5 caracteres.",
      });
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Contraseña inválida",
        text: "La contraseña debe tener al menos 6 caracteres.",
      });
      setLoading(false);
      return;
    }
    // Validación de longitud máxima
  if (username.length > 25) {
    Swal.fire({
      icon: "error",
      title: "Usuario muy largo",
      text: "El usuario no puede exceder los 25 caracteres.",
    });
    setLoading(false);
    return;
  }

  if (password.length > 30) {
    Swal.fire({
      icon: "error",
      title: "Contraseña muy larga",
      text: "La contraseña no puede exceder los 30 caracteres.",
    });
    setLoading(false);
    return;
  }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/usuarios/login",
        {
          usuario: username,
          clave: password,
        }
      );

      const user = response.data.user;

      // 🔒 CONDICIÓN: Verificar que sea un emprendedor
      if (user.rol !== "Emprendedor") {
        Swal.fire({
          icon: "error",
          title: "Acceso restringido",
          html: `
            <div class="text-center">
              <div class="text-red-500 text-6xl mb-4">
                <i class="fas fa-user-lock"></i>
              </div>
              <p class="text-lg mb-2">Solo los emprendedores pueden acceder a esta plataforma.</p>
              <p class="text-sm text-gray-600">Si eres administrativo, utiliza el sistema correspondiente.</p>
            </div>
          `,
          confirmButtonColor: "#dc2626",
          confirmButtonText: "Entendido"
        });
        setLoading(false);
        return;
      }

      // Verificar también el estatus del usuario
      if (user.estatus !== "Activo") {
        Swal.fire({
          icon: "warning",
          title: "Cuenta inactiva",
          text: "Tu cuenta no está activa. Por favor, contacta al administrador.",
        });
        setLoading(false);
        return;
      }

      // Guardar datos en localStorage
      localStorage.setItem("cedula_usuario", user.cedula_usuario);
      localStorage.setItem("usuario", JSON.stringify(user));
      localStorage.setItem("estatus", user.estatus);
      localStorage.setItem("rol", user.rol);

      if (setUser) setUser(user);

      Swal.fire({
        icon: "success",
        title: "¡Bienvenido Emprendedor!",
        text: response.data.message || "Inicio de sesión exitoso",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        navigate("/dashboard");
      });
    } catch (error) {
      console.error("Error en login:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.error || "Error al iniciar sesión",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterRedirect = () => {
    navigate("/RegistroEmprendedor");
  };

  const handleAdminRedirect = () => {
    Swal.fire({
      icon: "info",
      title: "Acceso administrativo",
      text: "Los usuarios administrativos deben utilizar el sistema correspondiente.",
      confirmButtonText: "Entendido"
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      {/* Panel izquierdo con logo */}
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

      {/* Área de inicio de sesión */}
      <motion.main
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex-1 flex items-center justify-center p-8 bg-gray-200"
      >
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8 text-4xl font-serif text-center text-gray-800 tracking-wide"
          >
            Inicio de sesión
          </motion.h2>
          
          {/* Información de acceso */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200"
          >
            <div className="flex items-start">
              <TbAlertCircle className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                <strong>Acceso exclusivo para emprendedores</strong>
              </p>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Usuario */}
            <div>
              <label
                htmlFor="username"
                className="block mb-2 text-sm font-semibold text-gray-700"
              >
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <TbUser size={20} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingrese su usuario"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition duration-200 bg-gray-50 hover:bg-gray-100 placeholder-gray-400 text-gray-700 text-lg"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-semibold text-gray-700"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <TbLock size={20} className="text-gray-500" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition duration-200 bg-gray-50 hover:bg-gray-100 placeholder-gray-400 text-gray-700 text-lg"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Botón de ingreso */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.05, boxShadow: loading ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "0 4px 20px rgba(0, 0, 0, 0.2)" }}
              transition={{ duration: 0.3 }}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-blue-900 text-white font-semibold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <TbLogin size={20} />
                  <span>Ingresar</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Enlace para registrarse */}
          <p className="mt-6 text-center text-sm text-gray-600">
            ¿No tienes cuenta?{" "}
            <button
              onClick={handleRegisterRedirect}
              disabled={loading}
              className="text-blue-600 hover:underline font-medium focus:outline-none disabled:opacity-50"
            >
              Regístrate aquí
            </button>
          </p>

          {/* Información administrativa */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              ¿Eres usuario administrativo?{" "}
              <button
                onClick={handleAdminRedirect}
                className="text-gray-600 hover:text-gray-800 underline font-medium"
              >
                Contacta al administrador
              </button>
            </p>
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default Login;