CREATE DATABASE IF NOT EXISTS rayen_profesionales;
CREATE DATABASE IF NOT EXISTS rayen_pacientes;


USE rayen_profesionales;

CREATE TABLE IF NOT EXISTS especialidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS profesionales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rut VARCHAR(12) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    especialidad_id INT,
    FOREIGN KEY (especialidad_id) REFERENCES especialidades(id)
);

CREATE TABLE IF NOT EXISTS bloques_disponibles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profesional_id INT,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    disponible BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (profesional_id) REFERENCES profesionales(id)
);



USE rayen_pacientes;

CREATE TABLE IF NOT EXISTS pacientes (
    rut VARCHAR(12) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS agendas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_rut VARCHAR(12),
    bloque_id INT NOT NULL,
    fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'confirmada',
    FOREIGN KEY (paciente_rut) REFERENCES pacientes(rut)
);