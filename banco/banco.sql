CREATE DATABASE IF NOT EXISTS cadastro;

USE cadastro;

CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    usuario VARCHAR(50),
    telefone VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    senha VARCHAR(20)
);

CREATE TABLE admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    usuario VARCHAR(50),
    telefone VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    senha VARCHAR(20)
);


CREATE TABLE produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    preco DECIMAL(10, 2),
    quantidade DECIMAL(10, 2),
    validade DATE
); 