-- Tabla de persona
CREATE TABLE persona (
  cedula VARCHAR(20) NOT NULL PRIMARY KEY,  
  nombre_completo VARCHAR(100) NOT NULL,
  edad INTEGER NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL,
  estado VARCHAR(50) NOT NULL,
  municipio VARCHAR(50) NOT NULL,
  direccion_actual VARCHAR(255) NOT NULL, 
  tipo_persona VARCHAR(20) NOT NULL
);

-- Tabla de emprendimientos
CREATE TABLE emprendimientos (
  cedula_emprendedor VARCHAR(20) NOT NULL PRIMARY KEY,
  tipo_sector VARCHAR(50) NOT NULL,
  tipo_negocio VARCHAR(50) NOT NULL,
  nombre_emprendimiento VARCHAR(100) NOT NULL,
  consejo_nombre VARCHAR(100),
  comuna VARCHAR(50),
  direccion_emprendimiento VARCHAR(255) NOT NULL,
  CONSTRAINT fk_emprendimiento_emprendedor FOREIGN KEY (cedula_emprendedor) REFERENCES persona(cedula) ON DELETE CASCADE
);

-- Tabla de usuario
CREATE TABLE usuario (
  cedula_usuario VARCHAR(20) NOT NULL PRIMARY KEY,
  usuario VARCHAR(20) NOT NULL,
  clave VARCHAR(20) NOT NULL,
  rol VARCHAR(20) NOT NULL,
  estatus VARCHAR(20),
  CONSTRAINT fk_usuario_persona FOREIGN KEY (cedula_usuario) REFERENCES persona(cedula)
);

CREATE TABLE requerimientos (
  cedula_requerimiento VARCHAR(20) PRIMARY KEY,
  fecha VARCHAR (20) NULL NULL,
  carta_solicitud VARCHAR(2),
  postulacion_UBCH VARCHAR(2),
  certificado_emprender VARCHAR(2),
  registro_municipal VARCHAR(2),
  carta_residencia VARCHAR(2),
  copia_cedula VARCHAR(2),
  rif_personal VARCHAR(2),
  fotos_emprendimiento VARCHAR(2),
  rif_emprendimiento VARCHAR(2),
  referencia_bancaria VARCHAR(2),
  CONSTRAINT fk_requerimientos_persona FOREIGN KEY (cedula_requerimiento) REFERENCES persona(cedula) ON DELETE CASCADE
);

CREATE TABLE Solicitud(
  cedula_solicitud VARCHAR (20) PRIMARY KEY,
  Motivo VARCHAR (1000) NOT NULL,
  CONSTRAINT fk_solicitud_persona FOREIGN KEY (cedula_solicitud) REFERENCES persona(cedula) ON DELETE CASCADE
);




-- Insertar datos en la tabla persona
INSERT INTO persona (cedula, nombre_completo, edad, telefono, email, estado, municipio, direccion_actual, tipo_persona) VALUES
('1234567890', 'Juan Pérez', 35, '0414-1234567', 'juan.perez@example.com', 'Estado1', 'Municipio1', 'Calle 123, Casa 4', 'Emprendedor'),
('9876543210', 'María Gómez', 28, '0424-9876543', 'maria.gomez@example.com', 'Estado2', 'Municipio2', 'Avenida 456, Apartamento 8', 'Cliente'),
('1122334455', 'Carlos Ruiz', 40, '0412-5555555', 'carlos.ruiz@example.com', 'Estado1', 'Municipio3', 'Calle 789, Oficina 12', 'Emprendedor');

-- Insertar datos en la tabla emprendimientos
INSERT INTO emprendimientos (cedula_emprendedor, tipo_sector, tipo_negocio, nombre_emprendimiento, consejo_nombre, comuna, direccion_emprendimiento) VALUES
('1234567890', 'Tecnología', 'Software', 'Soluciones TI', 'Consejo Emprendedor 1', 'Comuna1', 'Av. Innovación 100'),
('1122334455', 'Agroindustria', 'Finca', 'AgroFuturo', 'Consejo Emprendedor 2', 'Comuna3', 'Camino Rural 45');

-- Insertar datos en la tabla usuario
INSERT INTO usuario (cedula_usuario, usuario, clave, rol, estatus ) VALUES
('1234567890', 'juanp', 'pass123', 'Emprendedor', 'Activo'),
('9876543210', 'mariag', 'pass456', 'Cliente', 'Activo'),
('1122334455', 'carlosr', 'pass789', 'Emprendedor', 'Activo');