import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from 'axios';
import miImagen from "../assets/imagenes/logo_ifemi.jpg";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (username.trim() === "" || password.trim() === "") {
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
      const response = await axios.post('http://localhost:5000/api/usuarios/login', {
        usuario: username,
        contrasena: password,
      });

      const user = response.data.user;

      localStorage.setItem('usuario', JSON.stringify(user));
      localStorage.setItem('estatus', user.estatus);

      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: response.data.message || "Inicio de sesión exitoso",
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
    <div className="flex min-h-screen">
      {/* Lado izquierdo con la imagen */}
      <div className="w-1/2 hidden md:flex items-center justify-center p-4 bg-logoLoginEfimi">
        <div className="relative rounded-lg overflow-hidden w-max h-max">
          {/* Degradado */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-purple-400 via-pink-500 to-red-500 opacity-50"></div>
          {/* Imagen */}
          <img
            src={miImagen}
            alt="Logo Efemi"
            className="max-w-xs max-h-xs object-cover relative z-10"
          />
        </div>
      </div>

      {/* Lado derecho con formulario */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <h2 className="mb-6 text-2xl font-bold text-center text-gray-700">
            Iniciar Sesión
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Usuario */}
            <div className="relative">
              <label
                htmlFor="username"
                className="block mb-1 text-sm font-medium text-gray-600"
              >
                Nombre de Usuario
              </label>
              <div className="flex items-center border border-gray-300 rounded px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400">
                <i className="bx bxs-user mr-2 text-gray-500"></i>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full outline-none"
                  placeholder="Tu nombre de usuario"
                />
              </div>
            </div>
            {/* Contraseña */}
            <div className="relative">
              <label
                htmlFor="password"
                className="block mb-1 text-sm font-medium text-gray-600"
              >
                Contraseña
              </label>
              <div className="flex items-center border border-gray-300 rounded px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400">
                <i className="bx bxs-lock mr-2 text-gray-500"></i>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full outline-none"
                  placeholder="Tu contraseña"
                />
              </div>
            </div>
            {/* Botón */}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Iniciar Sesión
            </button>
          </form>
          {/* Enlace a registro */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{" "}
              <button
                onClick={handleRegisterRedirect}
                className="text-blue-600 hover:underline focus:outline-none"
              >
                Regístrate aquí
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;