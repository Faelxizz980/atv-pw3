create database if not exists gerenciador_tarefas;

use gerenciador_tarefas;


CREATE TABLE if not exists usuarios (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE if not exists tarefas (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    fk_usuario_id INT UNSIGNED NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    `status` ENUM('PENDENTE', 'CONCLUIDA') DEFAULT 'PENDENTE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fk_usuario_id) REFERENCES usuarios(id)
);


