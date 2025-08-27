CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    password_md5 VARCHAR(32) NOT NULL,
    foto_perfil VARCHAR(255) DEFAULT 'default_profile.jpg',
    saldo DECIMAL(10,2) DEFAULT 100.00
);

CREATE TABLE obras_arte (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    autor VARCHAR(100) NOT NULL,
    año_publicacion INT,
    imagen_url VARCHAR(255) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    disponible BOOLEAN DEFAULT true
);

CREATE TABLE obras_adquiridas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    obra_id INT,
    fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (obra_id) REFERENCES obras_arte(id) ON DELETE CASCADE
);

INSERT INTO usuarios (username, nombre_completo, password_md5, saldo) VALUES
('juan123', 'Juan Pérez', MD5('password123'), 1000.00),
('maria456', 'María García', MD5('password456'), 750.00);

INSERT INTO obras_arte (titulo, autor, año_publicacion, imagen_url, precio) VALUES
('Paisaje Montañoso', 'Ana Gómez', 2023, 'Fotos_Publicadas/paisaje.jpg', 150.00),
('Retrato Abstracto', 'Carlos López', 2022, 'Fotos_Publicadas/retrato.jpg', 200.00),
('Naturaleza Muerta', 'Laura Martínez', 2024, 'Fotos_Publicadas/naturaleza.jpg', 175.00),
('Atardecer Tropical', 'Pedro Sánchez', 2023, 'Fotos_Publicadas/atardecer.jpg', 225.00);