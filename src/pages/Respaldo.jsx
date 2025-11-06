import { useState, useEffect } from "react";
import { 
  TbDatabaseExport, 
  TbDatabaseImport, 
  TbRefresh, 
  TbDownload, 
  TbCheck, 
  TbAlertCircle, 
  TbInfoCircle, 
  TbPlayerPlay, 
  TbFileCheck, 
  TbTrash,
  TbUpload 
} from "react-icons/tb";
import Header from "../components/Header";
import Menu from "../components/Menu";

// Servicios de API para respaldo - NOMBRES ACTUALIZADOS
import { 
  crearRespaldo, 
  restaurarBaseDatos, 
  descargarUltimoRespaldo, 
  obtenerHistorialRespaldos, 
  eliminarRespaldo 
} from "../services/api_backup";

const DatabaseBackup = () => {
  const [menuOpen, setMenuOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [backupStatus, setBackupStatus] = useState("");
  const [restoreStatus, setRestoreStatus] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [backupHistory, setBackupHistory] = useState([]);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Cargar historial al montar el componente
  useEffect(() => {
    loadBackupHistory();
  }, []);

  const loadBackupHistory = async () => {
    try {
      const response = await obtenerHistorialRespaldos();
      if (response.success) {
        setBackupHistory(response.data || []);
      }
    } catch (error) {
      console.error('Error al cargar historial:', error);
    }
  };

  const handleBackup = async () => {
    setIsLoading(true);
    setBackupStatus("iniciando");
    
    try {
      const response = await crearRespaldo();
      
      if (response.success) {
        setBackupStatus("success");
        await loadBackupHistory();
      } else {
        throw new Error(response.message || "Error al crear respaldo");
      }
    } catch (error) {
      setBackupStatus("error");
      console.error('Error al crear respaldo:', error);
    } finally {
      setIsLoading(false);
      setTimeout(() => setBackupStatus(""), 3000);
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) {
      setRestoreStatus("no_file");
      setTimeout(() => setRestoreStatus(""), 3000);
      return;
    }

    setIsLoading(true);
    setRestoreStatus("iniciando");
    
    try {
      const formData = new FormData();
      formData.append('backup_file', selectedFile);
      
      const response = await restaurarBaseDatos(formData);
      
      if (response.success) {
        setRestoreStatus("success");
        setSelectedFile(null);
        
        setTimeout(() => {
          alert("Base de datos restaurada exitosamente. La página se recargará.");
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(response.message || "Error al restaurar base de datos");
      }
    } catch (error) {
      setRestoreStatus("error");
      console.error('Error al restaurar base de datos:', error);
    } finally {
      setIsLoading(false);
      setTimeout(() => setRestoreStatus(""), 3000);
    }
  };

  const handleDownloadBackup = async (backupId = null) => {
    try {
      // Para mantener la funcionalidad de descargar por ID si la necesitas
      // Actualmente solo tenemos descargar último respaldo
      const response = await descargarUltimoRespaldo();
      
      if (response.success) {
        const link = document.createElement('a');
        link.href = response.downloadUrl;
        link.download = response.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => URL.revokeObjectURL(response.downloadUrl), 100);
      }
    } catch (error) {
      console.error('Error al descargar respaldo:', error);
      alert('Error al descargar el respaldo: ' + error.message);
    }
  };

  const handleDeleteBackup = async (backupId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este respaldo?')) {
      return;
    }
    
    try {
      const response = await eliminarRespaldo(backupId);
      if (response.success) {
        await loadBackupHistory();
        alert('Respaldo eliminado exitosamente');
      }
    } catch (error) {
      console.error('Error al eliminar respaldo:', error);
      alert('Error al eliminar respaldo: ' + error.message);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['.sql', '.backup', '.dump'];
      const maxSize = 100 * 1024 * 1024; // 100MB
      
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      const isValidType = validTypes.includes(fileExtension);
      const isValidSize = file.size <= maxSize;
      
      if (isValidType && isValidSize) {
        setSelectedFile(file);
        setRestoreStatus("");
      } else {
        setRestoreStatus(!isValidType ? "invalid_file" : "file_too_large");
        setSelectedFile(null);
      }
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      "success": <TbCheck className="text-green-500" size={20} />,
      "error": <TbAlertCircle className="text-red-500" size={20} />,
      "iniciando": <TbRefresh className="text-blue-500 animate-spin" size={20} />
    };
    return icons[status] || null;
  };

  const getStatusMessage = (type, status) => {
    const messages = {
      backup: {
        iniciando: "Conectando con el servidor y creando respaldo...",
        success: "¡Respaldo creado exitosamente en el servidor!",
        error: "Error de conexión con el servidor al crear respaldo"
      },
      restore: {
        iniciando: "Subiendo archivo y restaurando base de datos...",
        success: "¡Base de datos restaurada exitosamente! El sistema se reiniciará.",
        error: "Error de conexión con el servidor al restaurar",
        no_file: "Por favor selecciona un archivo de respaldo",
        invalid_file: "Archivo no válido. Debe ser .sql, .backup o .dump",
        file_too_large: "Archivo demasiado grande. Máximo 100MB permitido"
      }
    };
    
    return messages[type]?.[status] || "";
  };

  // Componente para mostrar pasos del proceso
  const ProcessSteps = ({ steps, title, currentStatus }) => (
    <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
      <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
        <TbInfoCircle className="mr-2 text-blue-600" />
        {title}
      </h4>
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div key={index} className={`flex items-center space-x-3 p-2 rounded transition-all duration-300 ${
            step.active ? 'bg-white border border-blue-300 shadow-sm' : 'bg-blue-100'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              step.active ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-200 text-blue-700'
            }`}>
              {step.active ? <TbCheck size={12} /> : step.number}
            </div>
            <span className={`text-sm transition-all duration-300 ${
              step.active ? 'text-blue-800 font-medium' : 'text-blue-600'
            }`}>
              {step.text}
            </span>
          </div>
        ))}
      </div>
      {currentStatus && (
        <div className="mt-3 p-2 bg-blue-100 rounded border border-blue-300">
          <p className="text-xs text-blue-700 text-center">
            <strong>Estado actual:</strong> {currentStatus}
          </p>
        </div>
      )}
    </div>
  );

  // Pasos del proceso
  const backupSteps = [
    { number: 1, text: "Usuario hace clic en 'Crear Respaldo'", active: true },
    { number: 2, text: "Sistema se conecta al servidor API", active: backupStatus === "iniciando" || backupStatus === "success" },
    { number: 3, text: "API ejecuta comando de respaldo en servidor", active: backupStatus === "iniciando" || backupStatus === "success" },
    { number: 4, text: "Servidor guarda archivo y responde", active: backupStatus === "success" || backupStatus === "error" },
    { number: 5, text: "Se muestra resultado de la operación", active: backupStatus === "success" || backupStatus === "error" }
  ];

  const restoreSteps = [
    { number: 1, text: "Usuario selecciona archivo .sql, .backup o .dump", active: !!selectedFile || restoreStatus === "iniciando" || restoreStatus === "success" },
    { number: 2, text: "Sistema valida tipo y tamaño del archivo", active: !!selectedFile || restoreStatus === "iniciando" || restoreStatus === "success" },
    { number: 3, text: "Archivo se sube al servidor via API", active: restoreStatus === "iniciando" || restoreStatus === "success" },
    { number: 4, text: "API ejecuta restauración en base de datos", active: restoreStatus === "iniciando" || restoreStatus === "success" },
    { number: 5, text: "Servidor procesa y aplica los datos", active: restoreStatus === "iniciando" || restoreStatus === "success" },
    { number: 6, text: "Sistema se reinicia con nuevos datos", active: restoreStatus === "success" }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {menuOpen && <Menu />}

      <div className={`flex-1 flex flex-col transition-margin duration-300 ${menuOpen ? 'ml-64' : 'ml-0'}`}>
        <Header toggleMenu={toggleMenu} />
        
        <main className="flex-1 p-6 bg-gray-50">
          {/* Encabezado */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 mt-12">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer">
                <TbDatabaseExport size={24} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Respaldo de Base de Datos</h1>
                <p className="text-gray-600">Conexión real con servidor API - PostgreSQL</p>
              </div>
            </div>
          </div>

          {/* Tarjetas de funcionalidades */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Tarjeta de Respaldo */}
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <TbDatabaseExport size={24} className="text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Crear Respaldo</h2>
              </div>
              
              <p className="text-gray-600 mb-4">
                Crea un respaldo completo de PostgreSQL en el servidor.
              </p>

              <ProcessSteps 
                steps={backupSteps} 
                title="📋 Procedimiento: Crear Respaldo (PostgreSQL)" 
                currentStatus={
                  backupStatus === "iniciando" ? "🔄 Conectando con API..." :
                  backupStatus === "success" ? "✅ Respaldo guardado en servidor" :
                  backupStatus === "error" ? "❌ Error de conexión API" :
                  "⏳ Esperando acción del usuario"
                }
              />

              <div className="space-y-3 mt-4">
                <button
                  onClick={handleBackup}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading && backupStatus === "iniciando" ? (
                    <>
                      <TbRefresh className="animate-spin mr-2" size={20} />
                      Conectando con API...
                    </>
                  ) : (
                    <>
                      <TbPlayerPlay className="mr-2" size={20} />
                      Crear Respaldo en Servidor
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => handleDownloadBackup()}
                  className="w-full border border-blue-600 text-blue-600 py-3 px-4 rounded-lg flex items-center justify-center hover:bg-blue-50 transition-colors"
                >
                  <TbDownload className="mr-2" size={20} />
                  Descargar Último Respaldo
                </button>
              </div>

              {backupStatus && (
                <div className={`mt-4 p-3 rounded-lg flex items-center space-x-2 ${
                  backupStatus === "success" ? "bg-green-50 text-green-700 border border-green-200" :
                  backupStatus === "error" ? "bg-red-50 text-red-700 border border-red-200" :
                  "bg-blue-50 text-blue-700 border border-blue-200"
                }`}>
                  {getStatusIcon(backupStatus)}
                  <span className="text-sm font-medium">{getStatusMessage("backup", backupStatus)}</span>
                </div>
              )}
            </div>

            {/* Tarjeta de Restauración */}
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <TbDatabaseImport size={24} className="text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Restaurar Base de Datos</h2>
              </div>
              
              <p className="text-gray-600 mb-4">
                Restaura la base de datos PostgreSQL desde un archivo de respaldo.
              </p>

              <ProcessSteps 
                steps={restoreSteps} 
                title="📋 Procedimiento: Restaurar BD (PostgreSQL)" 
                currentStatus={
                  restoreStatus === "iniciando" ? "🔄 Subiendo archivo al servidor..." :
                  restoreStatus === "success" ? "✅ Restauración completada - Reiniciando" :
                  restoreStatus === "error" ? "❌ Error de conexión API" :
                  restoreStatus === "no_file" ? "📁 Esperando selección de archivo" :
                  restoreStatus === "invalid_file" ? "❌ Archivo no válido" :
                  restoreStatus === "file_too_large" ? "📏 Archivo demasiado grande" :
                  selectedFile ? "✅ Archivo listo para subir al servidor" :
                  "⏳ Esperando selección de archivo"
                }
              />

              <div className="space-y-3 mt-4">
                <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
                  selectedFile ? 'border-green-300 bg-green-50' : 
                  restoreStatus === "invalid_file" || restoreStatus === "file_too_large" ? 'border-red-300 bg-red-50' : 
                  'border-gray-300 bg-gray-50'
                }`}>
                  <input
                    type="file"
                    id="backup-file"
                    accept=".sql,.backup,.dump"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="backup-file"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    {selectedFile ? (
                      <>
                        <TbFileCheck size={32} className="text-green-500 mb-2" />
                        <span className="text-sm font-medium text-green-700">
                          ✅ Archivo listo: {selectedFile.name}
                        </span>
                        <span className="text-xs text-green-600 mt-1">
                          Tamaño: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </>
                    ) : restoreStatus === "invalid_file" || restoreStatus === "file_too_large" ? (
                      <>
                        <TbAlertCircle size={32} className="text-red-400 mb-2" />
                        <span className="text-sm font-medium text-red-700">
                          {restoreStatus === "invalid_file" ? "❌ Formato no válido" : "📏 Archivo muy grande"}
                        </span>
                        <span className="text-xs text-red-600 mt-1">
                          {restoreStatus === "invalid_file" 
                            ? "Solo .sql, .backup y .dump" 
                            : "Máximo 100MB permitido"}
                        </span>
                      </>
                    ) : (
                      <>
                        <TbUpload size={32} className="text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          Seleccionar archivo para subir al servidor
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          Formatos: .sql, .backup, .dump • Máx: 100MB
                        </span>
                      </>
                    )}
                  </label>
                </div>
                
                <button
                  onClick={handleRestore}
                  disabled={isLoading || !selectedFile}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading && restoreStatus === "iniciando" ? (
                    <>
                      <TbRefresh className="animate-spin mr-2" size={20} />
                      Subiendo al servidor...
                    </>
                  ) : (
                    <>
                      <TbPlayerPlay className="mr-2" size={20} />
                      Subir y Restaurar en Servidor
                    </>
                  )}
                </button>
              </div>

              {restoreStatus && (
                <div className={`mt-4 p-3 rounded-lg flex items-center space-x-2 ${
                  restoreStatus === "success" ? "bg-green-50 text-green-700 border border-green-200" :
                  restoreStatus === "error" || restoreStatus === "no_file" || restoreStatus === "invalid_file" || restoreStatus === "file_too_large" ? 
                  "bg-red-50 text-red-700 border border-red-200" :
                  "bg-blue-50 text-blue-700 border border-blue-200"
                }`}>
                  {getStatusIcon(restoreStatus)}
                  <span className="text-sm font-medium">{getStatusMessage("restore", restoreStatus)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Historial de respaldos */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Historial de Respaldos en Servidor</h3>
              <button 
                onClick={loadBackupHistory}
                className="bg-indigo-600 text-white px-3 py-1 rounded-lg flex items-center text-sm hover:bg-indigo-700 transition-colors"
              >
                <TbRefresh size={16} className="mr-1" />
                Actualizar
              </button>
            </div>
            
            <div className="space-y-3">
              {backupHistory.length > 0 ? (
                backupHistory.map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <TbDatabaseExport className="text-gray-400 mr-3" size={20} />
                      <div>
                        <p className="font-medium text-gray-800">{backup.filename}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(backup.created_at).toLocaleString()} • 
                          {(backup.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        backup.status === 'completed' ? 'bg-green-100 text-green-800' :
                        backup.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {backup.status === 'completed' ? 'Completado' : 
                         backup.status === 'failed' ? 'Fallido' : 'En progreso'}
                      </span>
                      <button 
                        onClick={() => handleDownloadBackup(backup.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Descargar
                      </button>
                      <button 
                        onClick={() => handleDeleteBackup(backup.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        <TbTrash size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TbDatabaseExport size={32} className="mx-auto mb-2 text-gray-300" />
                  <p>No hay respaldos en el servidor</p>
                  <p className="text-sm">Crea tu primer respaldo para verlo aquí</p>
                </div>
              )}
            </div>
          </div>
        </main>

        <footer className="mt-auto p-4 bg-white border-t border-gray-200 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Sistema conectado a API de respaldos PostgreSQL
        </footer>
      </div>
    </div>
  );
};

export default DatabaseBackup;