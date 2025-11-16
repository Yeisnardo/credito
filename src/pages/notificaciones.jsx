import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import notificacionesApi from '../services/api_notificaciones';
import { TbBell, TbCheck, TbTrash, TbFilter, TbSearch } from 'react-icons/tb';

const Notificaciones = () => {
  const navigate = useNavigate();
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    soloNoLeidas: false,
    categoria: '',
    tipo: ''
  });

  useEffect(() => {
    cargarNotificaciones();
  }, [filtros]);

  const cargarNotificaciones = async () => {
    try {
      const cedula = localStorage.getItem('cedula_usuario');
      const params = {
        limite: 100,
        solo_no_leidas: filtros.soloNoLeidas,
        categoria: filtros.categoria || undefined,
        tipo: filtros.tipo || undefined
      };

      const data = await notificacionesApi.getNotificacionesPorUsuario(cedula, params);
      setNotificaciones(data);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
      Swal.fire('Error', 'No se pudieron cargar las notificaciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLeida = async (id) => {
    try {
      await notificacionesApi.marcarNotificacionLeida(id);
      setNotificaciones(prev => 
        prev.map(notif => 
          notif.id_notificacion === id 
            ? { ...notif, leida: true, fecha_leida: new Date() }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marcando como leída:', error);
    }
  };

  const marcarTodasLeidas = async () => {
    try {
      const cedula = localStorage.getItem('cedula_usuario');
      await notificacionesApi.marcarTodasLeidas(cedula);
      await cargarNotificaciones();
      Swal.fire('Éxito', 'Todas las notificaciones marcadas como leídas', 'success');
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
      Swal.fire('Error', 'No se pudieron marcar todas como leídas', 'error');
    }
  };

  const eliminarNotificacion = async (id) => {
    try {
      await notificacionesApi.eliminarNotificacion(id);
      setNotificaciones(prev => prev.filter(notif => notif.id_notificacion !== id));
      Swal.fire('Éxito', 'Notificación eliminada', 'success');
    } catch (error) {
      console.error('Error eliminando notificación:', error);
      Swal.fire('Error', 'No se pudo eliminar la notificación', 'error');
    }
  };

  const limpiarTodas = async () => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se eliminarán todas las notificaciones',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar todas',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const cedula = localStorage.getItem('cedula_usuario');
        await notificacionesApi.eliminarTodasNotificaciones(cedula);
        setNotificaciones([]);
        Swal.fire('Éxito', 'Todas las notificaciones eliminadas', 'success');
      } catch (error) {
        console.error('Error eliminando todas:', error);
        Swal.fire('Error', 'No se pudieron eliminar todas las notificaciones', 'error');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <TbBell size={32} className="text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-800">Notificaciones</h1>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={marcarTodasLeidas}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <TbCheck size={18} />
            <span>Marcar todas leídas</span>
          </button>
          <button
            onClick={limpiarTodas}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <TbTrash size={18} />
            <span>Limpiar todas</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <TbFilter size={20} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filtrar:</span>
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filtros.soloNoLeidas}
              onChange={(e) => setFiltros(prev => ({ ...prev, soloNoLeidas: e.target.checked }))}
              className="rounded text-indigo-600"
            />
            <span className="text-sm text-gray-700">Solo no leídas</span>
          </label>
          <select
            value={filtros.categoria}
            onChange={(e) => setFiltros(prev => ({ ...prev, categoria: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
          >
            <option value="">Todas las categorías</option>
            <option value="solicitud">Solicitudes</option>
            <option value="credito">Créditos</option>
            <option value="requerimiento">Requerimientos</option>
            <option value="sistema">Sistema</option>
            <option value="general">General</option>
          </select>
        </div>
      </div>

      {/* Lista de notificaciones */}
      <div className="space-y-4">
        {notificaciones.length > 0 ? (
          notificaciones.map(notificacion => (
            <div
              key={notificacion.id_notificacion}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${
                !notificacion.leida ? 'border-l-4 border-l-indigo-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-3">
                    <div className={`text-lg ${
                      notificacion.tipo_notificacion === 'success' ? 'text-green-600' :
                      notificacion.tipo_notificacion === 'warning' ? 'text-yellow-600' :
                      notificacion.tipo_notificacion === 'error' ? 'text-red-600' :
                      'text-blue-600'
                    }`}>
                      {notificacion.tipo_notificacion === 'success' ? '✅' :
                       notificacion.tipo_notificacion === 'warning' ? '⚠️' :
                       notificacion.tipo_notificacion === 'error' ? '❌' : 'ℹ️'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-medium ${
                          notificacion.leida ? 'text-gray-700' : 'text-gray-900'
                        }`}>
                          {notificacion.titulo}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {notificacion.prioridad === 'alta' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Urgente
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {new Date(notificacion.fecha_creacion).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 mt-1">{notificacion.mensaje}</p>
                      {notificacion.categoria && (
                        <span className="inline-block mt-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {notificacion.categoria}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {!notificacion.leida && (
                    <button
                      onClick={() => marcarComoLeida(notificacion.id_notificacion)}
                      className="p-1 text-green-600 hover:text-green-700"
                      title="Marcar como leída"
                    >
                      <TbCheck size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => eliminarNotificacion(notificacion.id_notificacion)}
                    className="p-1 text-red-600 hover:text-red-700"
                    title="Eliminar notificación"
                  >
                    <TbTrash size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <TbBell size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay notificaciones</h3>
            <p className="text-gray-500">No tienes notificaciones en este momento.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notificaciones;