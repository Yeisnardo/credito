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

CREATE TABLE solicitud (
  cedula_solicitud VARCHAR(20) PRIMARY KEY,
  motivo VARCHAR (1000) NOT NULL,
  estatus VARCHAR (20),
  CONSTRAINT fk_solicitud_persona FOREIGN KEY (cedula_solicitud) REFERENCES persona(cedula) ON DELETE CASCADE
);

CREATE TABLE clasificacion (
  id_clasificacion SERIAL PRIMARY KEY,
  sector VARCHAR(100) NOT NULL,
  negocio VARCHAR(100) NOT NULL
);

CREATE TABLE aprobacion (
  cedula_aprobacion VARCHAR (20) PRIMARY KEY,
  contrato VARCHAR (50) NOT NULL,
  estatus VARCHAR (10) NOT NULL,
  fecha_aprobacion VARCHAR (20) NOT NULL,
  CONSTRAINT fk_solicitud_persona FOREIGN KEY (cedula_aprobacion) REFERENCES persona(cedula) ON DELETE CASCADE
);


CREATE TABLE fondo (
  id_fondo SERIAL PRIMARY KEY,
  fecha VARCHAR (40),
  tipo_movimiento VARCHAR (10),
  monto VARCHAR (100),
  Saldo VARCHAR (100)
);

CREATE TABLE credito (
  aprobacion_id SERIAL PRIMARY KEY,
  cedula_credito VARCHAR(20) NOT NULL,
  referencia VARCHAR(5) NOT NULL,
  monto_euros VARCHAR(255) NOT NULL,
  monto_bs VARCHAR(255) NOT NULL,
  diez_euros VARCHAR(255) NOT NULL,
  fecha_desde VARCHAR(15) NOT NULL,
  fecha_hasta VARCHAR(15) NOT NULL,
  estatus VARCHAR(40) NOT NULL,
  cuota VARCHAR(40) NOT NULL,
  CONSTRAINT fk_cedula FOREIGN KEY (cedula_credito) REFERENCES aprobacion(cedula_aprobacion)
);