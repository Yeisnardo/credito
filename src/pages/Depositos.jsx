// src/pages/Depositos.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import {
  getCreditosPorCedula,
  actualizarEstatusCredito,
} from "../services/api_credito"; // API para créditos
import { getUsuarioPorCedula } from "../services/api_usuario"; // API para usuarios
import Header from "../components/Header";
import Menu from "../components/Menu";

const Depositos = () => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [depositos, setDepositos] = useState([]);

  const [creditosUsuario, setCreditosUsuario] = useState([]);
  const [loadingCreditosUsuario, setLoadingCreditosUsuario] = useState(false);

  const [error, setError] = useState(null);

  // Función para cargar usuario
  const fetchUsuario = async () => {
    try {
      const cedula = localStorage.getItem("cedula_usuario");
      if (cedula) {
        const usuario = await getUsuarioPorCedula(cedula);
        if (usuario) setUser(usuario);
      }
    } catch (err) {
      console.error("Error al obtener usuario:", err);
      setError("Error al cargar usuario");
    }
  };

  // Función para cargar depósitos
  const fetchDepositos = async () => {
    try {
      if (user?.cedula_usuario) {
        const deposits = await getUsuarioPorCedula(user.cedula_usuario);
        setDepositos(deposits);
      }
    } catch (err) {
      console.error("Error al cargar depósitos:", err);
      setError("Error al cargar depósitos");
    }
  };

  // Función para cargar créditos del usuario
  const fetchCreditosDelUsuario = async () => {
    try {
      if (user?.cedula_usuario) {
        setLoadingCreditosUsuario(true);
        const creditos = await getCreditosPorCedula(user.cedula_usuario);
        setCreditosUsuario(creditos);
      }
    } catch (err) {
      console.error("Error al cargar créditos del usuario:", err);
    } finally {
      setLoadingCreditosUsuario(false);
    }
  };

  // Función para determinar color del estatus
  const getStatusColor = (estatus) => {
    switch (estatus.toLowerCase()) {
      case "recibido":
        return "text-green-600 font-semibold";
      case "rechazado":
        return "text-red-600 font-semibold";
      case "pendiente":
        return "text-yellow-600 font-semibold";
      default:
        return "text-gray-600";
    }
  };

  // Función para actualizar estatus
  const handleActualizarEstatus = async (credito, nuevoEstatus) => {
    try {
      await actualizarEstatusCredito(credito.cedula_credito, nuevoEstatus);
      setCreditosUsuario((prevCreditos) =>
        prevCreditos.map((c) =>
          c.cedula_credito === credito.cedula_credito
            ? { ...c, estatus: nuevoEstatus }
            : c
        )
      );
      Swal.fire(
        "¡Actualizado!",
        `Estatus cambiado a "${nuevoEstatus}"`,
        "success"
      );
    } catch (err) {
      console.error("Error al actualizar el crédito:", err);
      Swal.fire(
        "Error",
        err.response?.data?.error || "No se pudo actualizar el estatus",
        "error"
      );
    }
  };

  // Carga inicial
  useEffect(() => {
    fetchUsuario();
  }, []);

  // Cuando el usuario cambie, cargar datos
  useEffect(() => {
    if (user) {
      fetchDepositos();
      fetchCreditosDelUsuario();
    }
  }, [user]);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div className="flex min-h-screen bg-gray-100 font-serif overflow-hidden">
      {/* Menú */}
      {menuOpen && <Menu />}

      {/* Contenido principal */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          menuOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <Header toggleMenu={toggleMenu} />

        {/* Contenido central */}
        <div className="pt-16 px-8 max-w-7xl mx-auto w-full">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-8 mt-12">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer">
                <i className="bx bx-money-withdraw text-3xl text-gray-700"></i>
              </div>
              <h1 className="text-3xl font-semibold text-gray-800">Mis Depositos</h1>
            </div>
          </div>

          {/* Estado usuario */}
          <div className="mb-4 p-4 border rounded shadow-inner bg-gray-50">
            {user ? (
              <>
                <p>
                  <strong>Cédula:</strong> {user.cedula_usuario}
                </p>
                <p>
                  <strong>Usuario:</strong> {user.usuario}
                </p>
              </>
            ) : (
              <p className="text-red-600 font-semibold">
                No se ha cargado el usuario todavía.
              </p>
            )}
          </div>

          {/* Lista de créditos */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200 transition-shadow hover:shadow-xl">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2 border-gray-300 text-gray-700 flex items-center space-x-3">
              <span>Historial de Depositos</span>
            </h2>

            {loadingCreditosUsuario ? (
              <div className="flex justify-center py-4">
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-300 h-8 w-8 animate-spin"></div>
              </div>
            ) : creditosUsuario.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No hay créditos para este usuario.
              </p>
            ) : (
              <div className="overflow-x-auto max-h-64 border border-gray-300 rounded-lg bg-gray-50 shadow-sm hover:shadow-md transition-shadow">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Referencia
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Monto Euros
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Monto Bs
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Fecha de Pago
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {creditosUsuario.map((credito) => (
                      <tr
                        key={credito.cedula_credito}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">{credito.referencia}</td>
                        <td className="px-4 py-3">{credito.monto_euros}</td>
                        <td className="px-4 py-3">{credito.monto_bs}</td>
                        <td className="px-4 py-3">{credito.fecha_desde}</td>
                        <td
                          className={`px-4 py-3 capitalize ${getStatusColor(
                            credito.estatus
                          )}`}
                        >
                          {credito.estatus}
                        </td>
                        <td className="px-4 py-3 flex space-x-2">
                          {/* Botón para Recibido */}
                          <button
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg shadow-sm transition duration-200"
                            onClick={() => handleActualizarEstatus(credito, "Recibido")}
                          >
                            Recibido
                          </button>
                          {/* Botón para Rechazado */}
                          <button
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg shadow-sm transition duration-200"
                            onClick={() => handleActualizarEstatus(credito, "Rechazado")}
                          >
                            Rechazar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Pie de página */}
        <footer className="mt-auto p-4 bg-gray-50 border-t border-gray-200 text-center text-gray-600 text-sm rounded-t-xl shadow-inner">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default Depositos;