-- Tabla de personas (datos personales vinculados a usuario)
CREATE TABLE persona (
  cedula VARCHAR(20) NOT NULL PRIMARY KEY,  
  nombre_completo VARCHAR(100) NOT NULL,
  edad INTEGER NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL,
  tipo_persona VARCHAR(20) NOT NULL
);

-- Tabla de usuario (cuentas y autenticación), que depende de persona
CREATE TABLE usuario (
  cedula_usuario VARCHAR(20) NOT NULL,
  usuario VARCHAR(50) NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  estatus VARCHAR(20) NOT NULL,
  rol VARCHAR(20) NOT NULL,
  foto_rostro BYTEA,
  CONSTRAINT fk_usuario_persona FOREIGN KEY (cedula_usuario) REFERENCES persona(cedula) ON DELETE CASCADE
);

-- Tabla de ubicaciones (estado, municipio, dirección), sin parroquia
CREATE TABLE ubicacion (
  cedula_persona VARCHAR(20) PRIMARY KEY NOT NULL,
  estado VARCHAR(50) NOT NULL,
  municipio VARCHAR(50) NOT NULL,
  direccion_actual VARCHAR(255) NOT NULL,
  CONSTRAINT fk_ubicacion_persona FOREIGN KEY (cedula_persona) REFERENCES persona(cedula) ON DELETE CASCADE
);

-- Tabla de emprendimientos
CREATE TABLE emprendimientos (
  cedula_emprendedor VARCHAR(20) NOT NULL PRIMARY KEY,
  tipo_sector VARCHAR(50) NOT NULL,
  tipo_negocio VARCHAR(50) NOT NULL,
  nombre_emprendimiento VARCHAR(100) NOT NULL,
  direccion_emprendimiento VARCHAR(255) NOT NULL,
  CONSTRAINT fk_emprendimiento_emprendedor FOREIGN KEY (cedula_emprendedor) REFERENCES persona(cedula) ON DELETE CASCADE
);

-- Tabla del consejo comunal, cuya PRIMARY KEY es la cédula de la persona
CREATE TABLE consejo_comunal (
  cedula_persona VARCHAR(20) PRIMARY KEY,
  sector VARCHAR(100),
  consejo_nombre VARCHAR(100),
  comuna VARCHAR(50),
  CONSTRAINT fk_consejo_persona FOREIGN KEY (cedula_persona) REFERENCES persona(cedula) ON DELETE CASCADE
);

-- Inserciones de datos en la tabla persona
INSERT INTO persona (cedula, nombre_completo, edad, telefono, email, tipo_persona) VALUES
('1234567890', 'Juan Pérez', 35, '0414-5551234', 'juan.perez@mail.com', 'Emprendedor'),
('0987654321', 'María Gómez', 42, '0412-5555678', 'maria.gomez@mail.com', 'Cliente'),
('1122334455', 'Carlos Ramírez', 29, '0416-5557890', 'carlos.ramirez@mail.com', 'Emprendedor');

-- Inserciones en la tabla usuario
INSERT INTO usuario (cedula_usuario, usuario, contrasena, estatus, rol, foto_rostro) VALUES
('1234567890', 'juanp', 'hash_contrasena_juan', 'Activo', 'Emprendedor', NULL),
('0987654321', 'mariag', 'hash_contrasena_maria', 'Activo', 'Cliente', NULL),
('1122334455', 'carlosr', 'hash_contrasena_carlos', 'Activo', 'Emprendedor', NULL);

-- Inserciones en la tabla ubicacion
INSERT INTO ubicacion (cedula_persona, estado, municipio, direccion_actual) VALUES
('1234567890', 'Carabobo', 'Valencia', 'Av. Universidad, Edificio A'),
('1122334455', 'Zulia', 'Maracaibo', 'Calle 23, Casa 45');

-- Inserciones en la tabla emprendimientos
INSERT INTO emprendimientos (cedula_emprendedor, tipo_sector, tipo_negocio, nombre_emprendimiento, direccion_emprendimiento) VALUES
('1234567890', 'Tecnología', 'Software', 'PuntoTech', 'Av. Universidad, Edificio A'),
('1122334455', 'Alimentos', 'Restaurante', 'Sabores Locales', 'Calle 23, Casa 45');

-- Inserciones en la tabla consejo_comunal
INSERT INTO consejo_comunal (cedula_persona, sector, consejo_nombre, comuna) VALUES
('1234567890', 'Tecnología', 'Consejo de Innovación Tecnológica', 'Candelaria'),
('1122334455', 'Desarrollo Comunitario', 'Consejo de Desarrollo Comunitario', 'Santa Lucía');