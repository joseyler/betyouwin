'use strict';

const { buildEquiposSql, buildPartidosSql } = require('./data/bet-7-partidos');

const DDL = `
CREATE TABLE equipos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  codigo_pais CHAR(3) NOT NULL,
  grupo CHAR(1) NOT NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_equipos_codigo_pais (codigo_pais),
  KEY idx_equipos_grupo (grupo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE usuarios (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  nombre_completo VARCHAR(200) NOT NULL,
  dni VARCHAR(20) NOT NULL,
  direccion VARCHAR(300) NOT NULL,
  telefono VARCHAR(30) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_usuarios_email (email),
  UNIQUE KEY uk_usuarios_dni (dni),
  CONSTRAINT chk_usuarios_dni_digitos CHECK (dni REGEXP '^[0-9]+$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE partidos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  numero_oficial INT UNSIGNED NOT NULL,
  equipo_local_id BIGINT UNSIGNED NULL,
  equipo_visitante_id BIGINT UNSIGNED NULL,
  descripcion VARCHAR(200) NULL,
  fecha_hora DATETIME NOT NULL,
  goles_local TINYINT UNSIGNED NULL,
  goles_visitante TINYINT UNSIGNED NULL,
  fase ENUM('grupos', 'dieciseisavos', 'octavos', 'cuartos', 'semifinal', 'tercer_puesto', 'final') NOT NULL,
  grupo CHAR(1) NULL,
  estado ENUM('programado', 'en_curso', 'finalizado', 'cancelado') NOT NULL DEFAULT 'programado',
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_partidos_numero_oficial (numero_oficial),
  KEY idx_partidos_fecha_hora (fecha_hora),
  KEY idx_partidos_estado (estado),
  KEY idx_partidos_fase (fase),
  CONSTRAINT fk_partidos_equipo_local FOREIGN KEY (equipo_local_id) REFERENCES equipos (id),
  CONSTRAINT fk_partidos_equipo_visitante FOREIGN KEY (equipo_visitante_id) REFERENCES equipos (id),
  CONSTRAINT chk_partidos_equipos_distintos CHECK (
    equipo_local_id IS NULL
    OR equipo_visitante_id IS NULL
    OR equipo_local_id <> equipo_visitante_id
  ),
  CONSTRAINT chk_partidos_grupos_equipos CHECK (
    fase <> 'grupos'
    OR (equipo_local_id IS NOT NULL AND equipo_visitante_id IS NOT NULL AND descripcion IS NULL)
  ),
  CONSTRAINT chk_partidos_eliminatoria_descripcion CHECK (
    fase = 'grupos'
    OR descripcion IS NOT NULL
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE apuestas (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id BIGINT UNSIGNED NOT NULL,
  partido_id BIGINT UNSIGNED NOT NULL,
  tipo ENUM('ganador', 'empate', 'resultado_exacto') NOT NULL,
  equipo_elegido_id BIGINT UNSIGNED NULL,
  goles_local_apostados TINYINT UNSIGNED NULL,
  goles_visitante_apostados TINYINT UNSIGNED NULL,
  monto_pesos DECIMAL(15, 2) NOT NULL,
  premio_pesos DECIMAL(15, 2) NULL,
  estado ENUM('pendiente', 'ganada', 'perdida', 'cancelada') NOT NULL DEFAULT 'pendiente',
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_apuestas_usuario_partido (usuario_id, partido_id),
  KEY idx_apuestas_partido (partido_id),
  KEY idx_apuestas_estado (estado),
  CONSTRAINT fk_apuestas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
  CONSTRAINT fk_apuestas_partido FOREIGN KEY (partido_id) REFERENCES partidos (id),
  CONSTRAINT fk_apuestas_equipo_elegido FOREIGN KEY (equipo_elegido_id) REFERENCES equipos (id),
  CONSTRAINT chk_apuestas_monto_positivo CHECK (monto_pesos > 0),
  CONSTRAINT chk_apuestas_ganador CHECK (
    tipo <> 'ganador'
    OR equipo_elegido_id IS NOT NULL
  ),
  CONSTRAINT chk_apuestas_empate CHECK (
    tipo <> 'empate'
    OR equipo_elegido_id IS NULL
  ),
  CONSTRAINT chk_apuestas_resultado_exacto CHECK (
    tipo <> 'resultado_exacto'
    OR (
      goles_local_apostados IS NOT NULL
      AND goles_visitante_apostados IS NOT NULL
      AND equipo_elegido_id IS NULL
    )
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE transacciones (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id BIGINT UNSIGNED NOT NULL,
  apuesta_id BIGINT UNSIGNED NULL,
  tipo ENUM('ingreso', 'retiro', 'apuesta', 'ganancia') NOT NULL,
  monto_pesos DECIMAL(15, 2) NOT NULL,
  descripcion VARCHAR(300) NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_transacciones_usuario_fecha (usuario_id, fecha_creacion),
  KEY idx_transacciones_tipo (tipo),
  KEY idx_transacciones_apuesta (apuesta_id),
  CONSTRAINT fk_transacciones_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
  CONSTRAINT fk_transacciones_apuesta FOREIGN KEY (apuesta_id) REFERENCES apuestas (id),
  CONSTRAINT chk_transacciones_monto_positivo CHECK (monto_pesos > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

const DROP_TABLES = `
DROP TABLE IF EXISTS transacciones;
DROP TABLE IF EXISTS apuestas;
DROP TABLE IF EXISTS partidos;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS equipos;
`;

exports.up = function (db) {
  return db.runSql(DDL)
    .then(() => db.runSql(buildEquiposSql()))
    .then(() => db.runSql(buildPartidosSql()));
};

exports.down = function (db) {
  return db.runSql(DROP_TABLES);
};

exports._meta = {
  version: 1,
};
