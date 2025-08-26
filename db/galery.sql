-- =========================
-- Base de datos: Art Gallery
-- =========================

CREATE DATABASE art_gallery;
USE art_gallery;

-- =========================
-- Tabla de usuarios
-- =========================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  profile_picture VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- Tabla de obras de arte
-- =========================
CREATE TABLE artworks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  artist VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- Tabla de compras
-- =========================
CREATE TABLE purchases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  artwork_id INT NOT NULL,
  purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (artwork_id) REFERENCES artworks(id)
);

-- =========================
-- Tabla de sesiones (opcional, para login/logout)
-- =========================
CREATE TABLE sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
