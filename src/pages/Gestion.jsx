import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import Header from "../components/Header";
import Menu from "../components/Menu";

const Gestion = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("asignacion");
  const [empleadores, setEmpleadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [secuencia, setSecuencia] = useState(1);
  const [empleadorModal, setEmpleadorModal] = useState(null);
  const [formData, setFormData] = useState({
    numeroContrato: "",
    cedulaEmprendedor: "",
    montoAprobEuro: "",
    montoBs: "",
    cincoFlat: "",
    diezInteres: "",
    montoDevolver: "",
    fechaDesde: "",
    fechaHasta: "",
    estatus: "Pendiente",
    banco: "",
    cedulaTitular: "",
    nombreCompleto: "",
    numeroCuenta: "",
  });
  const [depositoData, setDepositoData] = useState({
    emprendedorId: "",
    monto: "",
    fecha: new Date().toISOString().split("T")[0],
    referencia: "",
    estado: "Completado",
    comprobante: null,
  });
  const [asignandoContrato, setAsignandoContrato] = useState(null);
  const [gestionandoContrato, setGestionandoContrato] = useState(null);
  const [editandoBancarios, setEditandoBancarios] = useState(null);
  const [contratosAsignados, setContratosAsignados] = useState({});
  const [contratosGestionados, setContratosGestionados] = useState({});
  const [depositos, setDepositos] = useState([]);

  useEffect(() => {
    cargarEmpleadores();
    cargarDepositos();
  }, []);

  const generarNumeroContrato = () => {
    const ano = getAnoActual();
    const secuenciaStr = String(secuencia).padStart(3, "0"); // 001, 002, ...
    const numeroContrato = `IFEMI/CRED-${secuenciaStr}-${ano}`;
    return numeroContrato;
  };

  const asignarNuevoContrato = () => {
    const nuevoNumero = generarNumeroContrato();
    setSecuencia((prev) => prev + 1);
    return nuevoNumero;
  };

  
  const getAnoActual = () => {
    const year = new Date().getFullYear();
    return year.toString().slice(-2);
  };

  // Agrega esta función en tu componente (fuera del componente principal)
  const obtenerEmprendedoresAprobados = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/solicitudes/estatus/aprobada"
      );
      console.log("Respuesta fetch:", response);
      if (!response.ok) {
        throw new Error(`Respuesta no ok: ${response.status}`);
      }
      const data = await response.json();
      console.log("Datos recibidos:", data);
      return data.map((emprendedor) => ({
        id: emprendedor.id || emprendedor.cedula,
        nombre: `${emprendedor.nombre_completo}`,
        detalle: emprendedor.detalle_proyecto || "Sin detalles",
        cedula: emprendedor.cedula_emprendedor,
        tieneContrato: !!emprendedor.numero_contrato,
        numeroContrato: emprendedor.numero_contrato || null,
        tieneDatosBancarios: false,
        datosBancarios: null,
      }));
    } catch (error) {
      console.error("Error en obtenerEmprendedoresAprobados:", error);
      throw error;
    }
  };

  // Agrega esta función en tu componente (fuera del componente principal)
  const asignarNumeroContrato = async (cedula, numeroContrato) => {
    try {
      const response = await fetch("/api/contratos/asignar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cedula_emprendedor: cedula,
          numero_contrato: numeroContrato,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al asignar número de contrato");
      }

      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const cargarEmpleadores = async () => {
    try {
      const data = await obtenerEmprendedoresAprobados();
      setEmpleadores(data);
      setLoading(false);
    } catch (error) {
      console.error("Error cargando emprendedores:", error);
      setLoading(false);
      alert(
        "Error al cargar los emprendedores. Por favor, intenta nuevamente."
      );
    }
  };

  const cargarDepositos = async () => {
    try {
      // Aquí se conectaría a la API real para cargar depósitos
      // const response = await fetch('/api/depositos');
      // const data = await response.json();
      // setDepositos(data);

      // Por ahora, inicializamos con array vacío
      setDepositos([]);
    } catch (error) {
      console.error("Error cargando depósitos:", error);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDepositoChange = (e) => {
    const { name, value } = e.target;
    setDepositoData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const iniciarAsignacionContrato = (empleador) => {
    const numeroContrato = asignarNuevoContrato();
    setAsignandoContrato(empleador);
    setFormData((prev) => ({
      ...prev,
      cedulaEmprendedor: empleador.cedula,
      numeroContrato: numeroContrato,
    }));
  };

  const cancelarAsignacion = () => {
    setAsignandoContrato(null);
    setFormData((prev) => ({
      ...prev,
      numeroContrato: "",
      cedulaEmprendedor: "",
    }));
  };

  const confirmarAsignacionContrato = async () => {
  try {
    if (!formData.numeroContrato) {
      alert("Por favor ingrese el número de contrato");
      return;
    }

    // Llamada a la API para asignar contrato
    const response = await fetch("http://localhost:5000/api/contratos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cedula_emprendedor: formData.cedulaEmprendedor,
        numero_contrato: formData.numeroContrato,
      }),
    });

    if (!response.ok) {
      throw new Error("Error al asignar contrato");
    }

    const data = await response.json();

    // Actualizar estado local
    const updatedEmpleadores = empleadores.map((e) =>
      e.cedula === formData.cedulaEmprendedor
        ? {
            ...e,
            tieneContrato: true,
            numeroContrato: formData.numeroContrato,
          }
        : e
    );

    setEmpleadores(updatedEmpleadores);
    setContratosAsignados((prev) => ({
      ...prev,
      [asignandoContrato.id]: formData.numeroContrato,
    }));

    setAsignandoContrato(null);
    setFormData((prev) => ({
      ...prev,
      numeroContrato: "",
      cedulaEmprendedor: "",
    }));

    alert("Contrato asignado exitosamente");
  } catch (error) {
    console.error("Error asignando contrato:", error);
    alert("Error al asignar contrato");
  }
};

  const iniciarGestionContrato = (empleador) => {
    setGestionandoContrato(empleador);
    // Prellenar el formulario con datos existentes si los hay
    const contratoExistente = contratosGestionados[empleador.id];
    setFormData((prev) => ({
      ...prev,
      cedulaEmprendedor: empleador.cedula,
      numeroContrato:
        empleador.numeroContrato || contratosAsignados[empleador.id] || "",
      montoAprobEuro: contratoExistente?.monto_aprob_euro || "",
      montoBs: contratoExistente?.monto_bs || "",
      cincoFlat: contratoExistente?.cincoflat || "",
      diezInteres: contratoExistente?.diezinteres || "",
      montoDevolver: contratoExistente?.monto_devolver || "",
      fechaDesde: contratoExistente?.fecha_desde || "",
      fechaHasta: contratoExistente?.fecha_hasta || "",
      estatus: contratoExistente?.estatus || "Pendiente",
    }));
  };

  const cancelarGestion = () => {
    setGestionandoContrato(null);
  };

  const confirmarGestionContrato = async () => {
    try {
      if (
        !formData.montoAprobEuro ||
        !formData.fechaDesde ||
        !formData.fechaHasta
      ) {
        alert("Por favor complete los campos obligatorios");
        return;
      }

      // Aquí iría la llamada a la API para guardar en contrato
      const contratoData = {
        numero_contrato:
          gestionandoContrato.numeroContrato ||
          contratosAsignados[gestionandoContrato.id],
        cedula_emprendedor: gestionandoContrato.cedula,
        monto_aprob_euro: formData.montoAprobEuro,
        monto_bs: formData.montoBs,
        cincoflat: formData.cincoFlat,
        diezinteres: formData.diezInteres,
        monto_devolver: formData.montoDevolver,
        fecha_desde: formData.fechaDesde,
        fecha_hasta: formData.fechaHasta,
        estatus: formData.estatus,
      };

      console.log("Gestionando contrato:", contratoData);

      // Guardar en estado local
      setContratosGestionados((prev) => ({
        ...prev,
        [gestionandoContrato.id]: contratoData,
      }));

      setGestionandoContrato(null);
      alert("Contrato gestionado exitosamente");
    } catch (error) {
      console.error("Error gestionando contrato:", error);
      alert("Error al gestionar contrato");
    }
  };

  const iniciarEdicionBancarios = (empleador) => {
    setEditandoBancarios(empleador);
    // Prellenar el formulario con datos existentes si los hay
    setFormData((prev) => ({
      ...prev,
      banco: empleador.datosBancarios?.banco || "",
      cedulaTitular:
        empleador.datosBancarios?.cedulaTitular || empleador.cedula,
      nombreCompleto:
        empleador.datosBancarios?.nombreCompleto || empleador.nombre,
      numeroCuenta: empleador.datosBancarios?.numeroCuenta || "",
    }));
  };

  const cancelarEdicionBancarios = () => {
    setEditandoBancarios(null);
  };

  const confirmarDatosBancarios = async () => {
    try {
      if (
        !formData.banco ||
        !formData.cedulaTitular ||
        !formData.nombreCompleto ||
        !formData.numeroCuenta
      ) {
        alert("Por favor complete todos los campos bancarios");
        return;
      }

      // Aquí iría la llamada a la API para guardar en cuenta
      const datosBancarios = {
        banco: formData.banco,
        cedula_titular: formData.cedulaTitular,
        nombre_completo: formData.nombreCompleto,
        numero_cuenta: formData.numeroCuenta,
      };

      console.log("Guardando datos bancarios:", {
        cedula_emprendedor: editandoBancarios.cedula,
        ...datosBancarios,
      });

      // Actualizar estado local
      const updatedEmpleadores = empleadores.map((e) =>
        e.id === editandoBancarios.id
          ? {
              ...e,
              tieneDatosBancarios: true,
              datosBancarios: datosBancarios,
            }
          : e
      );

      setEmpleadores(updatedEmpleadores);
      setEditandoBancarios(null);

      alert("Datos bancarios guardados exitosamente");
    } catch (error) {
      console.error("Error guardando datos bancarios:", error);
      alert("Error al guardar datos bancarios");
    }
  };

  const registrarDeposito = async () => {
    try {
      if (
        !depositoData.emprendedorId ||
        !depositoData.monto ||
        !depositoData.referencia
      ) {
        alert("Por favor complete todos los campos obligatorios");
        return;
      }

      const emprendedor = empleadores.find(
        (e) => e.id === parseInt(depositoData.emprendedorId)
      );

      // Aquí iría la llamada a la API para guardar el depósito
      const nuevoDeposito = {
        id: Date.now(),
        emprendedorId: parseInt(depositoData.emprendedorId),
        emprendedorNombre: emprendedor.nombre,
        monto: depositoData.monto,
        fecha: depositoData.fecha,
        referencia: depositoData.referencia,
        estado: depositoData.estado,
      };

      console.log("Registrando depósito:", nuevoDeposito);

      // Actualizar estado local
      setDepositos((prev) => [...prev, nuevoDeposito]);

      // Limpiar formulario
      setDepositoData({
        emprendedorId: "",
        monto: "",
        fecha: new Date().toISOString().split("T")[0],
        referencia: "",
        estado: "Completado",
        comprobante: null,
      });

      alert("Depósito registrado exitosamente");
    } catch (error) {
      console.error("Error registrando depósito:", error);
      alert("Error al registrar depósito");
    }
  };

  const verDetalles = (empleador) => {
    setEmpleadorModal(empleador);
  };

  const cerrarModal = () => {
    setEmpleadorModal(null);
  };

  // Modal para ver detalles de contratos gestionados
  const ModalDetalles = ({ empleador, onClose }) => {
    const contratoGestionado = contratosGestionados[empleador.id];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-4xl w-full relative max-h-[80vh] overflow-y-auto">
          <button
            className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
            onClick={onClose}
          >
            ✖
          </button>
          <h2 className="text-xl font-semibold mb-4">
            Detalles de {empleador.nombre}
          </h2>
          <p>
            <strong>Cédula:</strong> {empleador.cedula}
          </p>
          <p>
            <strong>Contrato:</strong>{" "}
            {empleador.tieneContrato ? empleador.numeroContrato : "Sin asignar"}
          </p>
          <p>
            <strong>Datos bancarios:</strong>{" "}
            {empleador.tieneDatosBancarios ? "Registrados" : "No registrados"}
          </p>
          <p className="mt-2 mb-4">{empleador.detalle}</p>

          {empleador.tieneDatosBancarios && (
            <>
              <h3 className="text-lg font-medium mb-3">Información Bancaria</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="font-semibold">Banco:</p>
                  <p>{empleador.datosBancarios.banco}</p>
                </div>
                <div>
                  <p className="font-semibold">Número de Cuenta:</p>
                  <p>{empleador.datosBancarios.numeroCuenta}</p>
                </div>
                <div>
                  <p className="font-semibold">Titular:</p>
                  <p>{empleador.datosBancarios.nombreCompleto}</p>
                </div>
                <div>
                  <p className="font-semibold">Cédula del Titular:</p>
                  <p>{empleador.datosBancarios.cedulaTitular}</p>
                </div>
              </div>
            </>
          )}

          {contratoGestionado ? (
            <>
              <h3 className="text-lg font-medium mb-3">Contrato Gestionado</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Campo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Número de Contrato
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contratoGestionado.numero_contrato}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Monto Aprobado (€)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contratoGestionado.monto_aprob_euro}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Monto (Bs)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contratoGestionado.monto_bs}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        5% Flat
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contratoGestionado.cincoflat}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        10% Interés
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contratoGestionado.diezinteres}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Monto a Devolver
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contratoGestionado.monto_devolver}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Fecha Desde
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contratoGestionado.fecha_desde}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Fecha Hasta
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contratoGestionado.fecha_hasta}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Estatus
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contratoGestionado.estatus}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-gray-500 mt-4">
              No hay contratos gestionados para este emprendedor.
            </p>
          )}
        </div>
      </div>
    );
  };

  // Modal para gestionar contrato
  const ModalGestionContrato = ({ empleador, onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full relative max-h-[80vh] overflow-y-auto">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
          onClick={onClose}
        >
          ✖
        </button>
        <h2 className="text-xl font-semibold mb-4">
          Gestionar contrato de {empleador.nombre}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto aprobado (€)
            </label>
            <input
              type="text"
              name="montoAprobEuro"
              value={formData.montoAprobEuro}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto (Bs)
            </label>
            <input
              type="text"
              name="montoBs"
              value={formData.montoBs}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              5% Flat
            </label>
            <input
              type="text"
              name="cincoFlat"
              value={formData.cincoFlat}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              10% Interés
            </label>
            <input
              type="text"
              name="diezInteres"
              value={formData.diezInteres}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto a devolver
            </label>
            <input
              type="text"
              name="montoDevolver"
              value={formData.montoDevolver}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estatus
            </label>
            <select
              name="estatus"
              value={formData.estatus}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="Pendiente">Pendiente</option>
              <option value="Activo">Activo</option>
              <option value="Completado">Completado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha desde
            </label>
            <input
              type="date"
              name="fechaDesde"
              value={formData.fechaDesde}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha hasta
            </label>
            <input
              type="date"
              name="fechaHasta"
              value={formData.fechaHasta}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={onConfirm}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );

  // Modal para editar datos bancarios
  const ModalDatosBancarios = ({ empleador, onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full relative">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
          onClick={onClose}
        >
          ✖
        </button>
        <h2 className="text-xl font-semibold mb-4">
          {empleador.tieneDatosBancarios
            ? "Actualizar datos bancarios"
            : "Registrar datos bancarios"}{" "}
          de {empleador.nombre}
        </h2>

        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banco
            </label>
            <input
              type="text"
              name="banco"
              value={formData.banco}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cédula del titular
            </label>
            <input
              type="text"
              name="cedulaTitular"
              value={formData.cedulaTitular}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo del titular
            </label>
            <input
              type="text"
              name="nombreCompleto"
              value={formData.nombreCompleto}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de cuenta
            </label>
            <input
              type="text"
              name="numeroCuenta"
              value={formData.numeroCuenta}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={onConfirm}
          >
            {empleador.tieneDatosBancarios ? "Actualizar" : "Registrar"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100 font-serif">
      {menuOpen && <Menu />}

      <div
        className={`flex-1 flex flex-col transition-margin duration-300 ${
          menuOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <Header toggleMenu={toggleMenu} />

        {/* Contenido */}
        <main className="flex-1 p-8 bg-gray-100">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-8 mt-12">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-full shadow-md hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer">
                <i className="bx bx-home text-3xl text-gray-700"></i>
              </div>
              <h1 className="text-3xl font-semibold text-gray-800">
                Gestión de contratos
              </h1>
            </div>
          </div>

          {/* Tabs de navegación */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("asignacion")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "asignacion"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Asignación de contrato
              </button>
              <button
                onClick={() => setActiveTab("gestion")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "gestion"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Gestión de contrato
              </button>
              <button
                onClick={() => setActiveTab("bancarios")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "bancarios"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Datos bancarios
              </button>
              <button
                onClick={() => setActiveTab("depositos")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "depositos"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Gestión de Depósitos
              </button>
            </nav>
          </div>

          {/* Modal de asignación de contrato */}
          {asignandoContrato && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full relative">
                <button
                  className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
                  onClick={cancelarAsignacion}
                >
                  ✖
                </button>
                <h2 className="text-xl font-semibold mb-4">
                  Asignar contrato a {asignandoContrato.nombre}
                </h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de contrato
                  </label>
                  <input
                    type="text"
                    name="cedula"
                    value={formData.cedula}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Ej: CTO-001"
                  />
                  <input
                    type="text"
                    name="numeroContrato"
                    value={formData.numeroContrato}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Ej: CTO-001"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    onClick={cancelarAsignacion}
                  >
                    Cancelar
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={confirmarAsignacionContrato}
                  >
                    Asignar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal de gestión de contrato */}
          {gestionandoContrato && (
            <ModalGestionContrato
              empleador={gestionandoContrato}
              onClose={cancelarGestion}
              onConfirm={confirmarGestionContrato}
            />
          )}

          {/* Modal de datos bancarios */}
          {editandoBancarios && (
            <ModalDatosBancarios
              empleador={editandoBancarios}
              onClose={cancelarEdicionBancarios}
              onConfirm={confirmarDatosBancarios}
            />
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">Cargando emprendedores...</p>
            </div>
          ) : (
            <>
              {/* Contenido según pestaña activa */}
              {activeTab === "asignacion" && (
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {empleadores.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500">
                        No hay emprendedores registrados.
                      </p>
                    </div>
                  ) : (
                    empleadores.map((empleador) => (
                      <div
                        key={empleador.id}
                        className="bg-white rounded-xl shadow-lg p-4 border-t-4 relative"
                        style={{ borderColor: "#0F3C5B" }}
                      >
                        <h2 className="text-xl font-semibold mb-2">
                          {empleador.nombre}
                        </h2>
                        <h2 className="text-xl font-semibold mb-2">
                          {empleador.cedula}
                        </h2>

                        {/* Estado del contrato */}
                        <div className="mb-4">
                          {contratosAsignados[empleador.id] ||
                          empleador.tieneContrato ? (
                            <div className="bg-green-100 text-green-800 px-3 py-2 rounded-md">
                              <p className="font-semibold">
                                Contrato asignado:
                              </p>
                              <p>
                                {contratosAsignados[empleador.id] ||
                                  empleador.numeroContrato}
                              </p>
                            </div>
                          ) : (
                            <button
                              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                              onClick={() =>
                                iniciarAsignacionContrato(empleador)
                              }
                            >
                              Asignar número de contrato
                            </button>
                          )}
                        </div>

                        {/* Botón para ver detalles */}
                        <button
                          className="w-full bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
                          onClick={() => verDetalles(empleador)}
                        >
                          Ver detalles
                        </button>
                      </div>
                    ))
                  )}
                </section>
              )}

              {activeTab === "gestion" && (
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {empleadores.filter(
                    (e) => e.tieneContrato || contratosAsignados[e.id]
                  ).length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500">
                        No hay emprendedores con contratos asignados.
                      </p>
                    </div>
                  ) : (
                    empleadores
                      .filter(
                        (e) => e.tieneContrato || contratosAsignados[e.id]
                      )
                      .map((empleador) => (
                        <div
                          key={empleador.id}
                          className="bg-white rounded-xl shadow-lg p-4 border-t-4 relative"
                          style={{ borderColor: "#0F3C5B" }}
                        >
                          <h2 className="text-xl font-semibold mb-2">
                            {empleador.nombre}
                          </h2>
                          <p className="text-sm text-gray-600 mb-3">
                            Cédula: {empleador.cedula}
                          </p>

                          <div className="mb-4 bg-green-100 text-green-800 px-3 py-2 rounded-md">
                            <p className="font-semibold">Contrato asignado:</p>
                            <p>
                              {contratosAsignados[empleador.id] ||
                                empleador.numeroContrato}
                            </p>
                          </div>

                          <div className="flex flex-col space-y-2">
                            <button
                              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
                              onClick={() => iniciarGestionContrato(empleador)}
                            >
                              Gestionar contrato
                            </button>
                            <button
                              className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
                              onClick={() => verDetalles(empleador)}
                            >
                              Ver detalles
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </section>
              )}

              {activeTab === "bancarios" && (
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {empleadores.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500">
                        No hay emprendedores registrados.
                      </p>
                    </div>
                  ) : (
                    empleadores.map((empleador) => (
                      <div
                        key={empleador.id}
                        className="bg-white rounded-xl shadow-lg p-4 border-t-4 relative"
                        style={{ borderColor: "#0F3C5B" }}
                      >
                        <h2 className="text-xl font-semibold mb-2">
                          {empleador.nombre}
                        </h2>
                        <p className="text-sm text-gray-600 mb-3">
                          Cédula: {empleador.cedula}
                        </p>

                        {/* Estado datos bancarios */}
                        <div className="mb-4">
                          {empleador.tieneDatosBancarios ? (
                            <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-md">
                              <p className="font-semibold">
                                Datos bancarios registrados
                              </p>
                              <p className="text-sm mt-1">
                                <strong>Banco:</strong>{" "}
                                {empleador.datosBancarios.banco}
                              </p>
                              <p className="text-sm">
                                <strong>Cuenta:</strong>{" "}
                                {empleador.datosBancarios.numeroCuenta}
                              </p>
                            </div>
                          ) : (
                            <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-md">
                              <p className="font-semibold">
                                Sin datos bancarios
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col space-y-2">
                          <button
                            className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 transition-colors"
                            onClick={() => iniciarEdicionBancarios(empleador)}
                          >
                            {empleador.tieneDatosBancarios
                              ? "Actualizar datos"
                              : "Registrar datos"}
                          </button>
                          <button
                            className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
                            onClick={() => verDetalles(empleador)}
                          >
                            Ver detalles
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </section>
              )}

              {activeTab === "depositos" && (
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Formulario de registro de depósitos */}
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">
                      Registrar nuevo depósito
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Emprendedor
                        </label>
                        <select
                          name="emprendedorId"
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          value={depositoData.emprendedorId}
                          onChange={handleDepositoChange}
                        >
                          <option value="">Seleccionar emprendedor</option>
                          {empleadores
                            .filter((e) => e.tieneDatosBancarios)
                            .map((emp) => (
                              <option key={emp.id} value={emp.id}>
                                {emp.nombre} - {emp.cedula}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Monto del depósito (Bs)
                        </label>
                        <input
                          type="number"
                          name="monto"
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          value={depositoData.monto}
                          onChange={handleDepositoChange}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Fecha
                        </label>
                        <input
                          type="date"
                          name="fecha"
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          value={depositoData.fecha}
                          onChange={handleDepositoChange}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Número de referencia
                        </label>
                        <input
                          type="text"
                          name="referencia"
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          value={depositoData.referencia}
                          onChange={handleDepositoChange}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Estado
                        </label>
                        <select
                          name="estado"
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          value={depositoData.estado}
                          onChange={handleDepositoChange}
                        >
                          <option value="Completado">Completado</option>
                          <option value="Pendiente">Pendiente</option>
                          <option value="Rechazado">Rechazado</option>
                        </select>
                      </div>

                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        onClick={registrarDeposito}
                      >
                        Registrar Depósito
                      </button>
                    </div>
                  </div>

                  {/* Historial de depósitos */}
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">
                      Historial de Depósitos
                    </h3>

                    {depositos.length === 0 ? (
                      <p className="text-gray-500">
                        No hay depósitos registrados.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Emprendedor
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Monto
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Fecha
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Referencia
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Estado
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {depositos.map((deposito) => (
                              <tr key={deposito.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {deposito.emprendedorNombre}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {deposito.monto} Bs
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {deposito.fecha}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {deposito.referencia}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${
                                      deposito.estado === "Completado"
                                        ? "bg-green-100 text-green-800"
                                        : deposito.estado === "Pendiente"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {deposito.estado}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </>
          )}
        </main>

        {/* Pie */}
        <footer className="mt-auto p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} IFEMI & UPTYAB. Todos los derechos
          reservados.
        </footer>
      </div>

      {/* Mostrar modal si hay un empleador seleccionado */}
      {empleadorModal && (
        <ModalDetalles empleador={empleadorModal} onClose={cerrarModal} />
      )}
    </div>
  );
};

export default Gestion;
