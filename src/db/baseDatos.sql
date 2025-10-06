--Nombre de la base de datos: siccee

----------------------------------------------------------------------------------
--  Registro emprededor ----------------------------------------------------------
----------------------------------------------------------------------------------

-- Tabla de persona
CREATE TABLE persona (
  cedula VARCHAR(20) PRIMARY KEY,  
  nombre_completo VARCHAR(100),
  edad VARCHAR (20),
  telefono VARCHAR(20),
  email VARCHAR(100),
  estado VARCHAR(50),
  municipio VARCHAR(50),
  direccion_actual VARCHAR(255), 
  tipo_persona VARCHAR(20)
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
  rol VARCHAR(100) NOT NULL,
  estatus VARCHAR(20),
  CONSTRAINT fk_usuario_persona FOREIGN KEY (cedula_usuario) REFERENCES persona(cedula)
);




----------------------------------------------------------------------------------
--  Administrador ----------------------------------------------------------------
----------------------------------------------------------------------------------

--TABLAS DE REQUEIMIENTOS
CREATE TABLE requerimientos (
    id_requerimientos SERIAL PRIMARY KEY,
    nombre_requerimiento VARCHAR (100)
);


----------------------------------------------------------------------------------
--  Emprendedor -------------------------------------------------------------------
----------------------------------------------------------------------------------

-- Tabla intermedia para relacionar requerimientos y emprendedores
CREATE TABLE requerimiento_emprendedor (
  id_req SERIAL PRIMARY KEY,
  cedula_emprendedor VARCHAR(20) NOT NULL,
  opt_requerimiento TEXT,
  vereficacion TEXT,
  CONSTRAINT fk_emprendedor FOREIGN KEY (cedula_emprendedor) REFERENCES persona(cedula),
  CONSTRAINT fk_requerimiento FOREIGN KEY (id_req) REFERENCES requerimientos(id_requerimientos)
);

CREATE TABLE requerimiento_archivo (
  id_archivo SERIAL PRIMARY KEY,
  cedula_emprendedor VARCHAR(20) NOT NULL,
  archivo TEXT,
  fecha_llevar DATE
);

--TABLA DE SOLICITUD
CREATE TABLE solicitud (
  id_contrato SERIAL PRIMARY KEY,
  cedula_emprendedor VARCHAR(20) ,
  motivo VARCHAR (1000) NOT NULL,
  estatus VARCHAR (20),
  motivo_rechazo TEXT,
  CONSTRAINT fk_solicitud_persona FOREIGN KEY (cedula_emprendedor) REFERENCES persona(cedula) ON DELETE CASCADE
);

-- Cuenta Bancaria
CREATE TABLE cuenta (
  cedula_emprendedor VARCHAR (20) NOT NULL PRIMARY KEY,
  banco TEXT,
  cedula_titular VARCHAR (20) NOT NULL,
  nombre_completo VARCHAR (255) NOT NULL,
  numero_cuenta VARCHAR (50) NOT NULL
);


----------------------------------------------------------------------------------
--  Administrador ----------------------------------------------------------------
----------------------------------------------------------------------------------

--TABLA DE CLASIFICACION
CREATE TABLE clasificacion (
  id_clasificacion SERIAL PRIMARY KEY,
  sector VARCHAR(100) NOT NULL,
  negocio VARCHAR(100) NOT NULL
);

CREATE TABLE n_contrato(
  cedula_emprendedor VARCHAR (20) NOT NULL PRIMARY KEY,
  numero_contrato VARCHAR(20) NOT NULL
);

CREATE TABLE contrato (
  id_contrato INT PRIMARY KEY,
  numero_contrato VARCHAR(20) NOT NULL,
  cedula_emprendedor VARCHAR(20),
  monto_aprob_euro TEXT,
  monto_bs TEXT,
  cincoflat TEXT,
  diezinteres TEXT,
  monto_devolver TEXT,
  monto_semanal TEXT,
  monto_cuota TEXT,
  fecha_desde DATE,
  fecha_hasta DATE,
  estatus VARCHAR(20),
  FOREIGN KEY (cedula_emprendedor) REFERENCES n_contrato (cedula_emprendedor)
); 

CREATE TABLE deposito(
  id_deposito SERIAL PRIMARY KEY,
  cedula_emprendedor VARCHAR (20) NOT NULL,
  comprobante text,
  estado VARCHAR,
  FOREIGN KEY (id_deposito) REFERENCES contrato (id_contrato)
);

CREATE TABLE cuota (
  id_cuota INT PRIMARY KEY,
  id_cuota_c INT NOT NULL, 
  cedula_emprendedor VARCHAR(20) NOT NULL,
  semana VARCHAR(255) NOT NULL,
  monto VARCHAR(255) NOT NULL,
  monto_ves VARCHAR(255) NOT NULL,
  fecha_pagada TEXT NOT NULL,
  estado_cuota VARCHAR(50) NOT NULL, -- Ejemplo: 'Pendiente', 'Pagado'
  dias_mora_cuota INT DEFAULT 0,
  interes_acumulado VARCHAR(255),
  monto_morosidad TEXT,
  confirmacionIFEMI VARCHAR(255), -- Puede ser un código o estado de confirmación
  comprobante TEXT, -- Ruta o nombre del archivo almacenado
  FOREIGN KEY (id_cuota_c) REFERENCES contrato (id_contrato)
);


CREATE TABLE configuracion_contratos (
    id SERIAL PRIMARY KEY,
    moneda TEXT NOT NULL,
    porcentaje_flat TEXT,
    porcentaje_interes TEXT,
    porcentaje_mora TEXT,
    numero_cuotas TEXT NOT NULL ,
    cuotasGracia TEXT NOT NULL,
    frecuencia_pago TEXT NOT NULL ,
    dias_personalizados TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para el historial de cambios en la configuración
CREATE TABLE historial_configuracion_contratos (
    id SERIAL PRIMARY KEY,
    configuracion_id INTEGER REFERENCES configuracion_contratos(id),
    moneda VARCHAR(3) NOT NULL,
    porcentaje_flat NUMERIC(5, 2) NOT NULL,
    porcentaje_interes NUMERIC(5, 2) NOT NULL,
    porcentaje_mora NUMERIC(5, 2) NOT NULL,
    numero_cuotas INTEGER NOT NULL,
    frecuencia_pago VARCHAR(20) NOT NULL,
    dias_personalizados INTEGER,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

----------------------------------------------------------------------------------
--  Inserciones ----------------------------------------------------------------
----------------------------------------------------------------------------------


INSERT INTO requerimientos (nombre_requerimiento) VALUES
('Carta de Motivo para Solicitar Crédito'),
('Postulación UBCH'),
('Certificado de emprender juntos'),
('Registro Municipal'),
('Carta de residencia'),
('Copia de cédula'),
('RIF personal'),
('Fotos del emprendimiento'),
('RIF de emprendimiento'),
('Referencia bancaria');

INSERT INTO clasificacion (sector, negocio) VALUES
-- Sector Primario
('Agricultura', 'Cultivo de frutas'),
('Agricultura', 'Cultivo de verduras'),
('Agricultura', 'Cultivo de cereales'),
('Agricultura', 'Cultivo de flores y plantas ornamentales'),
('Agricultura', 'Cultivo de legumbres'),
('Ganadería', 'Cría de ganado vacuno'),
('Ganadería', 'Cría de aves'),
('Ganadería', 'Cría de cerdos'),
('Ganadería', 'Cría de ovinos y caprinos'),
('Ganadería', 'Apicultura'),
('Pesca', 'Acuicultura'),
('Pesca', 'Pesca comercial'),
('Pesca', 'Pesca recreativa'),
('Pesca', 'Pesca artesanal'),
('Minería', 'Extracción de minerales metálicos'),
('Minería', 'Extracción de minerales no metálicos'),
('Minería', 'Extracción de recursos energéticos'),
('Minería', 'Minería de metales preciosos'),
('Minería', 'Minería de minerales industriales'),
('Industria Manufacturera', 'Producción de alimentos y bebidas'),
('Industria Manufacturera', 'Fabricación de productos químicos'),
('Industria Manufacturera', 'Fabricación de maquinaria y equipo'),
('Industria Manufacturera', 'Producción de textiles y confección'),
('Industria Manufacturera', 'Fabricación de productos electrónicos'),
('Industria Manufacturera', 'Fabricación de muebles'),
('Industria Manufacturera', 'Producción de papel y productos de papel'),
('Industria Manufacturera', 'Fabricación de productos de plástico'),
('Construcción', 'Desarrollo de viviendas'),
('Construcción', 'Construcción de infraestructuras'),
('Construcción', 'Obras públicas'),
('Construcción', 'Renovación y rehabilitación de edificios'),
('Energía', 'Producción de energía solar'),
('Energía', 'Producción de energía eólica'),
('Energía', 'Producción de energía hidroeléctrica'),
('Energía', 'Producción de biocombustibles'),
('Energía', 'Energía geotérmica'),
('Comercio', 'Tiendas de abarrotes'),
('Comercio', 'Comercio electrónico'),
('Comercio', 'Mayoristas y minoristas'),
('Comercio', 'Comercio al por mayor'),
('Comercio', 'Comercio al por menor'),
('Transporte', 'Servicios de mensajería'),
('Transporte', 'Transporte de pasajeros'),
('Transporte', 'Transporte de carga'),
('Transporte', 'Transporte ferroviario'),
('Transporte', 'Transporte aéreo'),
('Turismo', 'Agencias de viajes'),
('Turismo', 'Hoteles y alojamientos'),
('Turismo', 'Restaurantes y servicios de alimentación'),
('Turismo', 'Actividades recreativas y de ocio'),
('Educación', 'Escuelas privadas'),
('Educación', 'Clases particulares'),
('Educación', 'Universidades y centros de formación'),
('Educación', 'Educación en línea'),
('Salud', 'Clínicas privadas'),
('Salud', 'Servicios de bienestar'),
('Salud', 'Farmacias y distribución de medicamentos'),
('Salud', 'Servicios de atención domiciliaria'),
('Tecnología de la Información', 'Desarrollo de software'),
('Tecnología de la Información', 'Servicios de ciberseguridad'),
('Tecnología de la Información', 'Consultoría en tecnología'),
('Tecnología de la Información', 'Desarrollo de aplicaciones móviles'),
('Consultoría', 'Consultoría empresarial'),
('Consultoría', 'Consultoría en marketing digital'),
('Consultoría', 'Consultoría financiera'),
('Consultoría', 'Consultoría en recursos humanos'),
('Investigación y Desarrollo', 'Laboratorios de investigación'),
('Investigación y Desarrollo', 'Startups tecnológicas'),
('Investigación y Desarrollo', 'Innovación en biotecnología'),
('Investigación y Desarrollo', 'Investigación en ciencias sociales'),
('Organizaciones No Gubernamentales (ONG)', 'Proyectos de desarrollo comunitario'),
('Organizaciones No Gubernamentales (ONG)', 'Iniciativas medioambientales'),
('Organizaciones No Gubernamentales (ONG)', 'Programas de derechos humanos'),
('Servicios Comunitarios', 'Programas de apoyo a la comunidad'),
('Servicios Comunitarios', 'Actividades culturales'),
('Servicios Comunitarios', 'Servicios de voluntariado'),
('Cultura y Arte', 'Producción de eventos culturales'),
('Cultura y Arte', 'Creación de contenido artístico'),
('Cultura y Arte', 'Actividades recreativas y deportivas'),
('Economía Digital', 'Comercio electrónico'),
('Economía Digital', 'Marketing digital'),
('Economía Digital', 'Criptomonedas y blockchain'),
('Economía Digital', 'Servicios de streaming'),
('Economía Verde', 'Energías renovables'),
('Economía Verde', 'Agricultura sostenible'),
('Economía Verde', 'Gestión de residuos'),
('Economía Verde', 'Conservación de recursos naturales'),
('Economía Colaborativa', 'Plataformas de economía compartida'),
('Economía Colaborativa', 'Servicios de coworking'),
('Economía Colaborativa', 'Intercambio de bienes y servicios');




----------------------------------------------------------------------------------
--  Datos del Administrador ------------------------------------------------------
----------------------------------------------------------------------------------


INSERT INTO persona (cedula, nombre_completo, edad, telefono, email, estado, municipio, direccion_actual, tipo_persona)
VALUES ('31234567', 'Carlos Alberto Mendoza Ruiz', '1990-03-25', '555-9876', 'carlos.mendoza@example.com', 'Activo', 'MunicipioY', 'Calle Luna 456', 'Administrador');

INSERT INTO usuario (cedula_usuario, usuario, clave, rol, estatus)
VALUES ('31234567', 'CarlosMendoza', 'carlos2024', 'Administrador', 'Activo');

INSERT INTO configuracion_contratos ( moneda, porcentaje_flat, porcentaje_interes, porcentaje_mora, numero_cuotas, cuotasGracia, frecuencia_pago, dias_personalizados) 
VALUES ('USD', 5, 10, 2, 12, 2, 'Mensual', 0 );
