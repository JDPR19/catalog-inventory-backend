CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    imagen TEXT
);


CREATE TABLE autobuses (
    id SERIAL PRIMARY KEY,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    uso VARCHAR(100),
    descripcion TEXT,
    motor TEXT,
    puertas TEXT,
    asientos TEXT,
    transmision TEXT,
    combustible TEXT,
    neumaticos TEXT,
    direccion TEXT,
    imagen TEXT
);

CREATE TABLE repuestos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(100),
    modelo VARCHAR(100),
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    descripcion TEXT,    
    imagen TEXT,
    cantidad INTEGER DEFAULT 0
);

