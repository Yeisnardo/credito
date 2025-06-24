import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import miImagen from '../assets/imagenes/logo_ifemi.jpg';

const Login = ({ setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!username || !password) {
      Swal.fire({
        icon: 'error',
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos.',
      });
      return;
    }
    if (username.length < 5) {
      Swal.fire({
        icon: 'error',
        title: 'Nombre de usuario inválido',
        text: 'El nombre de usuario debe tener al menos 5 caracteres.',
      });
      return;
    }
    if (password.length < 6) {
      Swal.fire({
        icon: 'error',
        title: 'Contraseña inválida',
        text: 'La contraseña debe tener al menos 6 caracteres.',
      });
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/usuarios/login', {
        usuario: username,
        clave: password,
      });

      const user = response.data.user; // Asegúrate que backend devuelve así

      // Guardar en localStorage
      localStorage.setItem('cedula_usuario', user.cedula_usuario);
      localStorage.setItem('usuario', JSON.stringify(user));
      localStorage.setItem('estatus', user.estatus);

      // Actualizar estado en componente superior
      if (setUser) setUser(user);

      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: response.data.message || 'Inicio de sesión exitoso',
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        navigate('/dashboard');
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Error al iniciar sesión',
      });
    }
  };

  const handleRegisterRedirect = () => {
    navigate('/RegistroEmprendedor');
  };

  return (
    <div className="flex min-h-screen font-sans bg-gray-50">
      {/* Lado izquierdo con la imagen */}
      <div className="hidden md:flex w-1/2 items-center justify-center p-4 bg-logoLoginEfimi rounded-l-lg shadow-lg">
        <div className="relative rounded-lg overflow-hidden w-max h-max">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-purple-400 via-pink-500 to-red-500 opacity-50"></div>
          <img
            src={miImagen}
            alt="Logo Efemi"
            className="max-w-xs max-h-xs object-cover relative z-10 rounded-lg shadow-lg"
          />
        </div>
      </div>

      {/* Formulario */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
          <h2 className="mb-8 text-3xl font-bold text-center text-gray-700">Iniciar Sesión</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Usuario */}
            <div>
              <label
                htmlFor="username"
                className="block mb-2 text-sm font-medium text-gray-600"
              >
                Nombre de Usuario
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-blue-400 transition duration-300">
                <span className="p-2 text-gray-400">
                  <i className="bx bxs-user"></i>
                </span>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent outline-none px-3 py-2 rounded-r-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0"
                  placeholder="Tu nombre de usuario"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-600"
              >
                Contraseña
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-blue-400 transition duration-300">
                <span className="p-2 text-gray-400">
                  <i className="bx bxs-lock"></i>
                </span>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent outline-none px-3 py-2 rounded-r-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0"
                  placeholder="Tu contraseña"
                />
              </div>
            </div>

            {/* Botón */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#07142A] text-white font-semibold rounded-lg shadow hover:scale-105 transform transition duration-300 hover:shadow-xl"
            >
              Iniciar Sesión
            </button>
          </form>

          {/* Enlace a registro */}
          <p className="mt-6 text-center text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <button
              onClick={handleRegisterRedirect}
              className="text-blue-600 hover:underline font-medium focus:outline-none"
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;