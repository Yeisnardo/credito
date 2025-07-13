import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { motion } from "framer-motion"; // Importar motion
import miImagen from "../assets/imagenes/logo_ifemi.jpg";

const Login = ({ setUser }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      Swal.fire({
        icon: "error",
        title: "Campos incompletos",
        text: "Por favor, completa todos los campos.",
      });
      return;
    }
    if (username.length < 5) {
      Swal.fire({
        icon: "error",
        title: "Nombre de usuario inválido",
        text: "El nombre de usuario debe tener al menos 5 caracteres.",
      });
      return;
    }
    if (password.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Contraseña inválida",
        text: "La contraseña debe tener al menos 6 caracteres.",
      });
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

      localStorage.setItem("cedula_usuario", user.cedula_usuario);
      localStorage.setItem("usuario", JSON.stringify(user));
      localStorage.setItem("estatus", user.estatus);

      if (setUser) setUser(user);

      Swal.fire({
        icon: "success",
        title: "¡Bienvenido!",
        text: response.data.message || "Inicio de sesión exitoso",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        navigate("/dashboard");
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.error || "Error al iniciar sesión",
      });
    }
  };

  const handleRegisterRedirect = () => {
    navigate("/RegistroEmprendedor");
  };

  return (
    <div className="flex min-h-screen font-serif bg-gray-50 overflow-hidden">
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
            Inicio de Sesión
          </motion.h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Usuario */}
            <div>
              <label
                htmlFor="username"
                className="block mb-2 text-sm font-serif text-gray-700"
              >
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <i className="bx bxs-user text-xl"></i>
                </div>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingrese su usuario"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition duration-200 bg-gray-50 hover:bg-gray-100 placeholder-gray-400 text-gray-700 text-lg"
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
                  <i className="bx bxs-lock text-xl"></i>
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition duration-200 bg-gray-50 hover:bg-gray-100 placeholder-gray-400 text-gray-700 text-lg"
                />
              </div>
            </div>

            {/* Botón de ingreso */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05, boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)" }}
              transition={{ duration: 0.3 }}
              className="w-full py-3 px-6 bg-blue-900 text-white font-semibold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-300"
            >
              Ingresar
            </motion.button>
          </form>

          {/* Enlace para registrarse */}
          <p className="mt-6 text-center text-sm text-gray-600">
            ¿No tienes cuenta?{" "}
            <button
              onClick={handleRegisterRedirect}
              className="text-blue-600 hover:underline font-medium focus:outline-none"
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </motion.main>
    </div>
  );
};

export default Login;