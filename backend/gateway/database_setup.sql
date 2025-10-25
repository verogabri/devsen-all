-- Script SQL per creare database e tabella di test
-- Esegui questo script nel tuo MySQL per testare l'API

CREATE DATABASE IF NOT EXISTS gateway_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gateway_db;

-- Tabella di esempio: users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_aggiornamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    attivo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

-- Inserimento dati di esempio
INSERT INTO users (nome, email, telefono) VALUES
('Mario Rossi', 'mario.rossi@email.com', '+39 123 456 7890'),
('Laura Bianchi', 'laura.bianchi@email.com', '+39 098 765 4321'),
('Giuseppe Verdi', 'giuseppe.verdi@email.com', '+39 111 222 3333'),
('Anna Neri', 'anna.neri@email.com', '+39 444 555 6666'),
('Francesco Romano', 'francesco.romano@email.com', '+39 777 888 9999');

-- Tabella di esempio: prodotti
CREATE TABLE IF NOT EXISTS prodotti (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    descrizione TEXT,
    prezzo DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    categoria VARCHAR(50),
    disponibile BOOLEAN DEFAULT TRUE,
    data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Inserimento dati di esempio per prodotti
INSERT INTO prodotti (nome, descrizione, prezzo, categoria) VALUES
('Laptop Dell XPS 13', 'Laptop ultrabook con processore Intel i7', 1299.99, 'Elettronica'),
('Mouse Wireless Logitech', 'Mouse wireless ergonomico', 29.99, 'Accessori'),
('Tastiera Meccanica', 'Tastiera meccanica RGB per gaming', 89.99, 'Accessori'),
('Monitor 4K Samsung', 'Monitor 27 pollici risoluzione 4K', 399.99, 'Elettronica'),
('Cuffie Sony WH-1000XM4', 'Cuffie wireless con cancellazione rumore', 249.99, 'Audio');

-- Verifica dei dati inseriti
SELECT 'Users' as tabella, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'Prodotti' as tabella, COUNT(*) as record_count FROM prodotti;