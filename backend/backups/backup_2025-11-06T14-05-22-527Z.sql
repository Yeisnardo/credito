-- Backup generado el: 2025-11-06T14:05:22.881Z
-- Base de datos: Unknown
-- Tablas respaldadas: 17

-- Table: backup_history
DROP TABLE IF EXISTS "backup_history" CASCADE;

CREATE TABLE "backup_history" (
  "id" INTEGER NOT NULL DEFAULT nextval('backup_history_id_seq'::regclass),
  "filename" CHARACTER VARYING NOT NULL,
  "path" TEXT NOT NULL,
  "size" BIGINT NOT NULL,
  "status" CHARACTER VARYING DEFAULT 'completed'::character varying,
  "created_by" CHARACTER VARYING,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "database" CHARACTER VARYING
);

-- No hay datos en la tabla backup_history


-- Table: bitacora
DROP TABLE IF EXISTS "bitacora" CASCADE;

CREATE TABLE "bitacora" (
  "id_bitacora" INTEGER NOT NULL DEFAULT nextval('bitacora_id_bitacora_seq'::regclass),
  "cedula_usuario" CHARACTER VARYING NOT NULL,
  "usuario" CHARACTER VARYING NOT NULL,
  "accion" CHARACTER VARYING NOT NULL,
  "metodo" CHARACTER VARYING NOT NULL,
  "ruta" CHARACTER VARYING NOT NULL,
  "estado" INTEGER NOT NULL,
  "ip" CHARACTER VARYING,
  "datos_adicionales" JSONB,
  "fecha" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- No hay datos en la tabla bitacora


-- Table: clasificacion
DROP TABLE IF EXISTS "clasificacion" CASCADE;

CREATE TABLE "clasificacion" (
  "id_clasificacion" INTEGER NOT NULL DEFAULT nextval('clasificacion_id_clasificacion_seq'::regclass),
  "sector" CHARACTER VARYING NOT NULL,
  "negocio" CHARACTER VARYING
);

-- Data for clasificacion (91 registros)
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (6, 'Ganadería', 'Cría de ganado vacuno');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (7, 'Ganadería', 'Cría de aves');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (8, 'Ganadería', 'Cría de cerdos');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (9, 'Ganadería', 'Cría de ovinos y caprinos');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (10, 'Ganadería', 'Apicultura');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (11, 'Pesca', 'Acuicultura');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (12, 'Pesca', 'Pesca comercial');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (13, 'Pesca', 'Pesca recreativa');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (14, 'Pesca', 'Pesca artesanal');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (15, 'Minería', 'Extracción de minerales metálicos');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (16, 'Minería', 'Extracción de minerales no metálicos');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (17, 'Minería', 'Extracción de recursos energéticos');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (18, 'Minería', 'Minería de metales preciosos');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (19, 'Minería', 'Minería de minerales industriales');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (20, 'Industria Manufacturera', 'Producción de alimentos y bebidas');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (21, 'Industria Manufacturera', 'Fabricación de productos químicos');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (22, 'Industria Manufacturera', 'Fabricación de maquinaria y equipo');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (23, 'Industria Manufacturera', 'Producción de textiles y confección');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (24, 'Industria Manufacturera', 'Fabricación de productos electrónicos');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (25, 'Industria Manufacturera', 'Fabricación de muebles');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (26, 'Industria Manufacturera', 'Producción de papel y productos de papel');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (27, 'Industria Manufacturera', 'Fabricación de productos de plástico');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (28, 'Construcción', 'Desarrollo de viviendas');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (29, 'Construcción', 'Construcción de infraestructuras');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (30, 'Construcción', 'Obras públicas');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (31, 'Construcción', 'Renovación y rehabilitación de edificios');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (32, 'Energía', 'Producción de energía solar');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (33, 'Energía', 'Producción de energía eólica');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (34, 'Energía', 'Producción de energía hidroeléctrica');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (35, 'Energía', 'Producción de biocombustibles');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (36, 'Energía', 'Energía geotérmica');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (37, 'Comercio', 'Tiendas de abarrotes');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (38, 'Comercio', 'Comercio electrónico');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (39, 'Comercio', 'Mayoristas y minoristas');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (41, 'Comercio', 'Comercio al por menor');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (42, 'Transporte', 'Servicios de mensajería');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (43, 'Transporte', 'Transporte de pasajeros');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (44, 'Transporte', 'Transporte de carga');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (45, 'Transporte', 'Transporte ferroviario');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (46, 'Transporte', 'Transporte aéreo');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (47, 'Turismo', 'Agencias de viajes');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (48, 'Turismo', 'Hoteles y alojamientos');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (49, 'Turismo', 'Restaurantes y servicios de alimentación');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (50, 'Turismo', 'Actividades recreativas y de ocio');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (51, 'Educación', 'Escuelas privadas');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (52, 'Educación', 'Clases particulares');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (53, 'Educación', 'Universidades y centros de formación');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (54, 'Educación', 'Educación en línea');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (55, 'Salud', 'Clínicas privadas');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (56, 'Salud', 'Servicios de bienestar');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (57, 'Salud', 'Farmacias y distribución de medicamentos');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (58, 'Salud', 'Servicios de atención domiciliaria');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (59, 'Tecnología de la Información', 'Desarrollo de software');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (60, 'Tecnología de la Información', 'Servicios de ciberseguridad');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (61, 'Tecnología de la Información', 'Consultoría en tecnología');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (62, 'Tecnología de la Información', 'Desarrollo de aplicaciones móviles');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (63, 'Consultoría', 'Consultoría empresarial');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (64, 'Consultoría', 'Consultoría en marketing digital');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (65, 'Consultoría', 'Consultoría financiera');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (66, 'Consultoría', 'Consultoría en recursos humanos');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (67, 'Investigación y Desarrollo', 'Laboratorios de investigación');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (68, 'Investigación y Desarrollo', 'Startups tecnológicas');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (69, 'Investigación y Desarrollo', 'Innovación en biotecnología');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (70, 'Investigación y Desarrollo', 'Investigación en ciencias sociales');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (71, 'Organizaciones No Gubernamentales (ONG)', 'Proyectos de desarrollo comunitario');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (72, 'Organizaciones No Gubernamentales (ONG)', 'Iniciativas medioambientales');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (73, 'Organizaciones No Gubernamentales (ONG)', 'Programas de derechos humanos');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (74, 'Servicios Comunitarios', 'Programas de apoyo a la comunidad');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (75, 'Servicios Comunitarios', 'Actividades culturales');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (76, 'Servicios Comunitarios', 'Servicios de voluntariado');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (77, 'Cultura y Arte', 'Producción de eventos culturales');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (78, 'Cultura y Arte', 'Creación de contenido artístico');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (79, 'Cultura y Arte', 'Actividades recreativas y deportivas');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (80, 'Economía Digital', 'Comercio electrónico');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (81, 'Economía Digital', 'Marketing digital');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (82, 'Economía Digital', 'Criptomonedas y blockchain');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (83, 'Economía Digital', 'Servicios de streaming');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (84, 'Economía Verde', 'Energías renovables');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (85, 'Economía Verde', 'Agricultura sostenible');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (86, 'Economía Verde', 'Gestión de residuos');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (87, 'Economía Verde', 'Conservación de recursos naturales');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (88, 'Economía Colaborativa', 'Plataformas de economía compartida');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (89, 'Economía Colaborativa', 'Servicios de coworking');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (90, 'Economía Colaborativa', 'Intercambio de bienes y servicios');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (92, 'Aguacate', NULL);
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (93, 'Comercio', 'Comercio al por mayor');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (4, 'Agricultura', 'Cultivo de flores y plantas ornamentales');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (5, 'Agricultura', 'Cultivo de legumbres');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (2, 'Agricultura', 'Cultivo de verduras');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (3, 'Agricultura', 'Cultivo de cereales');
INSERT INTO "clasificacion" ("id_clasificacion", "sector", "negocio") VALUES (1, 'Agricultura', 'Cultivo de frutas');


-- Table: configuracion_contratos
DROP TABLE IF EXISTS "configuracion_contratos" CASCADE;

CREATE TABLE "configuracion_contratos" (
  "id" INTEGER NOT NULL DEFAULT nextval('configuracion_contratos_id_seq'::regclass),
  "moneda" TEXT NOT NULL,
  "porcentaje_flat" TEXT,
  "porcentaje_interes" TEXT,
  "porcentaje_mora" TEXT,
  "numero_cuotas" TEXT NOT NULL,
  "cuotasgracias" TEXT NOT NULL,
  "frecuencia_pago" TEXT NOT NULL,
  "dias_personalizados" TEXT,
  "fecha_creacion" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "fecha_actualizacion" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Data for configuracion_contratos (1 registros)
INSERT INTO "configuracion_contratos" ("id", "moneda", "porcentaje_flat", "porcentaje_interes", "porcentaje_mora", "numero_cuotas", "cuotasgracias", "frecuencia_pago", "dias_personalizados", "fecha_creacion", "fecha_actualizacion") VALUES (1, 'USD', '5', '10', '2', '12', '2', 'quincenal', '0', '2025-11-03T12:48:39.672Z', '2025-11-03T15:06:24.135Z');


-- Table: contrato
DROP TABLE IF EXISTS "contrato" CASCADE;

CREATE TABLE "contrato" (
  "id_contrato" INTEGER NOT NULL,
  "numero_contrato" CHARACTER VARYING NOT NULL,
  "cedula_emprendedor" CHARACTER VARYING,
  "monto_aprob_euro" NUMERIC,
  "monto_bs" NUMERIC,
  "monto_bs_neto" NUMERIC,
  "monto_restado" NUMERIC,
  "diezinteres" NUMERIC,
  "monto_devolver" NUMERIC,
  "monto_semanal" NUMERIC,
  "monto_cuota" NUMERIC,
  "frecuencia_pago_contrato" CHARACTER VARYING,
  "cuotas" CHARACTER VARYING,
  "gracia" CHARACTER VARYING,
  "interes" CHARACTER VARYING,
  "morosidad" CHARACTER VARYING,
  "dias_personalizados" TEXT,
  "fecha_desde" DATE,
  "fecha_hasta" DATE,
  "estatus" CHARACTER VARYING
);

-- Data for contrato (1 registros)
INSERT INTO "contrato" ("id_contrato", "numero_contrato", "cedula_emprendedor", "monto_aprob_euro", "monto_bs", "monto_bs_neto", "monto_restado", "diezinteres", "monto_devolver", "monto_semanal", "monto_cuota", "frecuencia_pago_contrato", "cuotas", "gracia", "interes", "morosidad", "dias_personalizados", "fecha_desde", "fecha_hasta", "estatus") VALUES (1, 'IFEMI/CRED-001-25', '30608696', '300.00', '67188.00', '63828.60', '3359.40', '30.00', '330.00', '27.50', '27.50', 'quincenal', '12', '2', '10', '2', NULL, '2025-11-03T04:00:00.000Z', '2026-05-02T04:00:00.000Z', 'aceptado');


-- Table: cuenta
DROP TABLE IF EXISTS "cuenta" CASCADE;

CREATE TABLE "cuenta" (
  "cedula_emprendedor" CHARACTER VARYING NOT NULL,
  "banco" TEXT,
  "cedula_titular" CHARACTER VARYING NOT NULL,
  "nombre_completo" CHARACTER VARYING NOT NULL,
  "numero_cuenta" CHARACTER VARYING NOT NULL
);

-- Data for cuenta (1 registros)
INSERT INTO "cuenta" ("cedula_emprendedor", "banco", "cedula_titular", "nombre_completo", "numero_cuenta") VALUES ('30608696', 'Banco de Venezuela (0102)', '123456', 'Ramon Jose Guillermo Pinto', '0102 0743 0000 0822 8676');


-- Table: cuota
DROP TABLE IF EXISTS "cuota" CASCADE;

CREATE TABLE "cuota" (
  "id_cuota" INTEGER NOT NULL,
  "id_cuota_c" INTEGER NOT NULL,
  "cedula_emprendedor" CHARACTER VARYING NOT NULL,
  "semana" CHARACTER VARYING NOT NULL,
  "monto" CHARACTER VARYING NOT NULL,
  "monto_ves" CHARACTER VARYING NOT NULL,
  "fecha_pagada" TEXT NOT NULL,
  "estado_cuota" CHARACTER VARYING NOT NULL,
  "dias_mora_cuota" INTEGER DEFAULT 0,
  "interes_acumulado" CHARACTER VARYING,
  "monto_morosidad" TEXT,
  "confirmacionifemi" CHARACTER VARYING,
  "comprobante" TEXT
);

-- Data for cuota (12 registros)
INSERT INTO "cuota" ("id_cuota", "id_cuota_c", "cedula_emprendedor", "semana", "monto", "monto_ves", "fecha_pagada", "estado_cuota", "dias_mora_cuota", "interes_acumulado", "monto_morosidad", "confirmacionifemi", "comprobante") VALUES (1, 1, '30608696', 'Semana 1', '27.50', '27.50', '', 'Pendiente', 0, '0', NULL, 'En Espera', NULL);
INSERT INTO "cuota" ("id_cuota", "id_cuota_c", "cedula_emprendedor", "semana", "monto", "monto_ves", "fecha_pagada", "estado_cuota", "dias_mora_cuota", "interes_acumulado", "monto_morosidad", "confirmacionifemi", "comprobante") VALUES (2, 1, '30608696', 'Semana 2', '27.50', '27.50', '', 'Pendiente', 0, '0', NULL, 'En Espera', NULL);
INSERT INTO "cuota" ("id_cuota", "id_cuota_c", "cedula_emprendedor", "semana", "monto", "monto_ves", "fecha_pagada", "estado_cuota", "dias_mora_cuota", "interes_acumulado", "monto_morosidad", "confirmacionifemi", "comprobante") VALUES (3, 1, '30608696', 'Semana 3', '27.50', '27.50', '', 'Pendiente', 0, '0', NULL, 'En Espera', NULL);
INSERT INTO "cuota" ("id_cuota", "id_cuota_c", "cedula_emprendedor", "semana", "monto", "monto_ves", "fecha_pagada", "estado_cuota", "dias_mora_cuota", "interes_acumulado", "monto_morosidad", "confirmacionifemi", "comprobante") VALUES (4, 1, '30608696', 'Semana 4', '27.50', '27.50', '', 'Pendiente', 0, '0', NULL, 'En Espera', NULL);
INSERT INTO "cuota" ("id_cuota", "id_cuota_c", "cedula_emprendedor", "semana", "monto", "monto_ves", "fecha_pagada", "estado_cuota", "dias_mora_cuota", "interes_acumulado", "monto_morosidad", "confirmacionifemi", "comprobante") VALUES (5, 1, '30608696', 'Semana 5', '27.50', '27.50', '', 'Pendiente', 0, '0', NULL, 'En Espera', NULL);
INSERT INTO "cuota" ("id_cuota", "id_cuota_c", "cedula_emprendedor", "semana", "monto", "monto_ves", "fecha_pagada", "estado_cuota", "dias_mora_cuota", "interes_acumulado", "monto_morosidad", "confirmacionifemi", "comprobante") VALUES (6, 1, '30608696', 'Semana 6', '27.50', '27.50', '', 'Pendiente', 0, '0', NULL, 'En Espera', NULL);
INSERT INTO "cuota" ("id_cuota", "id_cuota_c", "cedula_emprendedor", "semana", "monto", "monto_ves", "fecha_pagada", "estado_cuota", "dias_mora_cuota", "interes_acumulado", "monto_morosidad", "confirmacionifemi", "comprobante") VALUES (7, 1, '30608696', 'Semana 7', '27.50', '27.50', '', 'Pendiente', 0, '0', NULL, 'En Espera', NULL);
INSERT INTO "cuota" ("id_cuota", "id_cuota_c", "cedula_emprendedor", "semana", "monto", "monto_ves", "fecha_pagada", "estado_cuota", "dias_mora_cuota", "interes_acumulado", "monto_morosidad", "confirmacionifemi", "comprobante") VALUES (8, 1, '30608696', 'Semana 8', '27.50', '27.50', '', 'Pendiente', 0, '0', NULL, 'En Espera', NULL);
INSERT INTO "cuota" ("id_cuota", "id_cuota_c", "cedula_emprendedor", "semana", "monto", "monto_ves", "fecha_pagada", "estado_cuota", "dias_mora_cuota", "interes_acumulado", "monto_morosidad", "confirmacionifemi", "comprobante") VALUES (9, 1, '30608696', 'Semana 9', '27.50', '27.50', '', 'Pendiente', 0, '0', NULL, 'En Espera', NULL);
INSERT INTO "cuota" ("id_cuota", "id_cuota_c", "cedula_emprendedor", "semana", "monto", "monto_ves", "fecha_pagada", "estado_cuota", "dias_mora_cuota", "interes_acumulado", "monto_morosidad", "confirmacionifemi", "comprobante") VALUES (10, 1, '30608696', 'Semana 10', '27.50', '27.50', '', 'Pendiente', 0, '0', NULL, 'En Espera', NULL);
INSERT INTO "cuota" ("id_cuota", "id_cuota_c", "cedula_emprendedor", "semana", "monto", "monto_ves", "fecha_pagada", "estado_cuota", "dias_mora_cuota", "interes_acumulado", "monto_morosidad", "confirmacionifemi", "comprobante") VALUES (11, 1, '30608696', 'Semana 11', '27.50', '27.50', '', 'Pendiente', 0, '0', NULL, 'En Espera', NULL);
INSERT INTO "cuota" ("id_cuota", "id_cuota_c", "cedula_emprendedor", "semana", "monto", "monto_ves", "fecha_pagada", "estado_cuota", "dias_mora_cuota", "interes_acumulado", "monto_morosidad", "confirmacionifemi", "comprobante") VALUES (12, 1, '30608696', 'Semana 12', '27.50', '27.50', '', 'Pendiente', 0, '0', NULL, 'En Espera', NULL);


-- Table: deposito
DROP TABLE IF EXISTS "deposito" CASCADE;

CREATE TABLE "deposito" (
  "id_deposito" INTEGER NOT NULL DEFAULT nextval('deposito_id_deposito_seq'::regclass),
  "cedula_emprendedor" CHARACTER VARYING NOT NULL,
  "comprobante" TEXT,
  "estado" CHARACTER VARYING
);

-- Data for deposito (1 registros)
INSERT INTO "deposito" ("id_deposito", "cedula_emprendedor", "comprobante", "estado") VALUES (1, '30608696', '/uploads/comprobante-1762182563180-471253854.PNG', 'Recibido');


-- Table: emprendimientos
DROP TABLE IF EXISTS "emprendimientos" CASCADE;

CREATE TABLE "emprendimientos" (
  "cedula_emprendedor" CHARACTER VARYING NOT NULL,
  "tipo_sector" CHARACTER VARYING NOT NULL,
  "tipo_negocio" CHARACTER VARYING NOT NULL,
  "nombre_emprendimiento" CHARACTER VARYING NOT NULL,
  "consejo_nombre" CHARACTER VARYING,
  "comuna" CHARACTER VARYING,
  "direccion_emprendimiento" CHARACTER VARYING NOT NULL
);

-- Data for emprendimientos (1 registros)
INSERT INTO "emprendimientos" ("cedula_emprendedor", "tipo_sector", "tipo_negocio", "nombre_emprendimiento", "consejo_nombre", "comuna", "direccion_emprendimiento") VALUES ('30608696', 'Comercio', 'Microempresa', 'EMPRENDIMIENTO  YEIS CODEX X', 'ALTO PRADO', 'Comuna 1', 'CLL. LIBERTADOR SECTOR GUARABAITO');


-- Table: historial_configuracion_contratos
DROP TABLE IF EXISTS "historial_configuracion_contratos" CASCADE;

CREATE TABLE "historial_configuracion_contratos" (
  "id" INTEGER NOT NULL DEFAULT nextval('historial_configuracion_contratos_id_seq'::regclass),
  "configuracion_id" INTEGER,
  "moneda" CHARACTER VARYING NOT NULL,
  "porcentaje_flat" NUMERIC NOT NULL,
  "porcentaje_interes" NUMERIC NOT NULL,
  "porcentaje_mora" NUMERIC NOT NULL,
  "numero_cuotas" INTEGER NOT NULL,
  "frecuencia_pago" CHARACTER VARYING NOT NULL,
  "cuotasgracias" TEXT NOT NULL,
  "dias_personalizados" INTEGER,
  "fecha_cambio" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Data for historial_configuracion_contratos (1 registros)
INSERT INTO "historial_configuracion_contratos" ("id", "configuracion_id", "moneda", "porcentaje_flat", "porcentaje_interes", "porcentaje_mora", "numero_cuotas", "frecuencia_pago", "cuotasgracias", "dias_personalizados", "fecha_cambio") VALUES (1, 1, 'USD', '5.00', '10.00', '2.00', 12, 'quincenal', '2', 0, '2025-11-03T15:06:24.264Z');


-- Table: n_contrato
DROP TABLE IF EXISTS "n_contrato" CASCADE;

CREATE TABLE "n_contrato" (
  "cedula_emprendedor" CHARACTER VARYING NOT NULL,
  "numero_contrato" CHARACTER VARYING NOT NULL
);

-- Data for n_contrato (1 registros)
INSERT INTO "n_contrato" ("cedula_emprendedor", "numero_contrato") VALUES ('30608696', 'IFEMI/CRED-001-25');


-- Table: persona
DROP TABLE IF EXISTS "persona" CASCADE;

CREATE TABLE "persona" (
  "cedula" CHARACTER VARYING NOT NULL,
  "nombre_completo" CHARACTER VARYING,
  "edad" CHARACTER VARYING,
  "telefono" CHARACTER VARYING,
  "email" CHARACTER VARYING,
  "estado" CHARACTER VARYING,
  "municipio" CHARACTER VARYING,
  "direccion_actual" CHARACTER VARYING,
  "tipo_persona" CHARACTER VARYING
);

-- Data for persona (2 registros)
INSERT INTO "persona" ("cedula", "nombre_completo", "edad", "telefono", "email", "estado", "municipio", "direccion_actual", "tipo_persona") VALUES ('31234567', 'Carlos Alberto Mendoza Ruiz', '1990-03-25', '555-9876', 'carlos.mendoza@example.com', 'Activo', 'MunicipioY', 'Calle Luna 456', 'Administrador');
INSERT INTO "persona" ("cedula", "nombre_completo", "edad", "telefono", "email", "estado", "municipio", "direccion_actual", "tipo_persona") VALUES ('30608696', 'Yeisnardo Eliander Bravo Colina', '21', '04125154866', 'yeisnardo06@gmail.com', 'Yaracuy', 'La Trinidad', 'CLL. LIBERTADOR SECTOR GUARABAITO', 'Emprendedor');


-- Table: requerimiento_archivo
DROP TABLE IF EXISTS "requerimiento_archivo" CASCADE;

CREATE TABLE "requerimiento_archivo" (
  "id_archivo" INTEGER NOT NULL DEFAULT nextval('requerimiento_archivo_id_archivo_seq'::regclass),
  "cedula_emprendedor" CHARACTER VARYING NOT NULL,
  "archivo" TEXT,
  "fecha_llevar" DATE
);

-- Data for requerimiento_archivo (1 registros)
INSERT INTO "requerimiento_archivo" ("id_archivo", "cedula_emprendedor", "archivo", "fecha_llevar") VALUES (1, '30608696', 'uploads\1762174931681-440954948.png', '2025-11-12T04:00:00.000Z');


-- Table: requerimiento_emprendedor
DROP TABLE IF EXISTS "requerimiento_emprendedor" CASCADE;

CREATE TABLE "requerimiento_emprendedor" (
  "id_req" INTEGER NOT NULL DEFAULT nextval('requerimiento_emprendedor_id_req_seq'::regclass),
  "cedula_emprendedor" CHARACTER VARYING NOT NULL,
  "opt_requerimiento" TEXT,
  "vereficacion" TEXT
);

-- Data for requerimiento_emprendedor (1 registros)
INSERT INTO "requerimiento_emprendedor" ("id_req", "cedula_emprendedor", "opt_requerimiento", "vereficacion") VALUES (1, '30608696', '{"1","2","3","4","5","6","7","8","9","10"}', NULL);


-- Table: requerimientos
DROP TABLE IF EXISTS "requerimientos" CASCADE;

CREATE TABLE "requerimientos" (
  "id_requerimientos" INTEGER NOT NULL DEFAULT nextval('requerimientos_id_requerimientos_seq'::regclass),
  "nombre_requerimiento" CHARACTER VARYING
);

-- Data for requerimientos (10 registros)
INSERT INTO "requerimientos" ("id_requerimientos", "nombre_requerimiento") VALUES (1, 'Carta de Motivo para Solicitar Crédito');
INSERT INTO "requerimientos" ("id_requerimientos", "nombre_requerimiento") VALUES (2, 'Postulación UBCH');
INSERT INTO "requerimientos" ("id_requerimientos", "nombre_requerimiento") VALUES (3, 'Certificado de emprender juntos');
INSERT INTO "requerimientos" ("id_requerimientos", "nombre_requerimiento") VALUES (4, 'Registro Municipal');
INSERT INTO "requerimientos" ("id_requerimientos", "nombre_requerimiento") VALUES (5, 'Carta de residencia');
INSERT INTO "requerimientos" ("id_requerimientos", "nombre_requerimiento") VALUES (6, 'Copia de cédula');
INSERT INTO "requerimientos" ("id_requerimientos", "nombre_requerimiento") VALUES (7, 'RIF personal');
INSERT INTO "requerimientos" ("id_requerimientos", "nombre_requerimiento") VALUES (8, 'Fotos del emprendimiento');
INSERT INTO "requerimientos" ("id_requerimientos", "nombre_requerimiento") VALUES (9, 'RIF de emprendimiento');
INSERT INTO "requerimientos" ("id_requerimientos", "nombre_requerimiento") VALUES (10, 'Referencia bancaria');


-- Table: solicitud
DROP TABLE IF EXISTS "solicitud" CASCADE;

CREATE TABLE "solicitud" (
  "id_contrato" INTEGER NOT NULL DEFAULT nextval('solicitud_id_contrato_seq'::regclass),
  "cedula_emprendedor" CHARACTER VARYING,
  "motivo" CHARACTER VARYING NOT NULL,
  "estatus" CHARACTER VARYING,
  "motivo_rechazo" TEXT
);

-- Data for solicitud (1 registros)
INSERT INTO "solicitud" ("id_contrato", "cedula_emprendedor", "motivo", "estatus", "motivo_rechazo") VALUES (1, '30608696', 'Quiero un credito para crear mi emprendimiento', 'Aprobada', NULL);


-- Table: usuario
DROP TABLE IF EXISTS "usuario" CASCADE;

CREATE TABLE "usuario" (
  "cedula_usuario" CHARACTER VARYING NOT NULL,
  "usuario" CHARACTER VARYING NOT NULL,
  "clave" CHARACTER VARYING NOT NULL,
  "rol" CHARACTER VARYING NOT NULL,
  "estatus" CHARACTER VARYING
);

-- Data for usuario (2 registros)
INSERT INTO "usuario" ("cedula_usuario", "usuario", "clave", "rol", "estatus") VALUES ('31234567', 'CarlosMendoza', 'Administrador', 'Administrador', 'Activo');
INSERT INTO "usuario" ("cedula_usuario", "usuario", "clave", "rol", "estatus") VALUES ('30608696', 'Yeisnardo06', '123456', 'Emprendedor', 'Activo');


