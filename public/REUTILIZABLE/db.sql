CREATE TABLE requerimiento_emprendedor (
    id_req SERIAL PRIMARY KEY,
    cedula_emprendedor VARCHAR (20) NOT NULL,
    opt_requerimiento TEXT,
    CONSTRAINT fk_persona FOREIGN KEY (id_req) REFERENCES requerimientos(id_requerimientos),
    CONSTRAINT fk_requerimiento FOREIGN KEY (cedula_emprendedor) REFERENCES persona(cedula)
);