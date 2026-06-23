'use strict';

/**
 * Calendario oficial fase de grupos y eliminatorias - FIFA World Cup 2026.
 * Horarios en hora del este (ET). Fuente: calendario publicado post sorteo final.
 */

function parseFecha(dmy, timeEt) {
  const meses = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
  };
  const [dia, mes, anio] = dmy.split('-');
  let [hh, mm] = timeEt.split(':').map(Number);
  let y = 2000 + Number(anio);
  let m = meses[mes];
  let d = Number(dia);
  if (hh >= 24) {
    hh -= 24;
    const dt = new Date(Date.UTC(y, Number(m) - 1, d));
    dt.setUTCDate(dt.getUTCDate() + 1);
    y = dt.getUTCFullYear();
    m = String(dt.getUTCMonth() + 1).padStart(2, '0');
    d = dt.getUTCDate();
  }
  return `${y}-${m}-${String(d).padStart(2, '0')} ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00`;
}

const EQUIPOS = [
  { codigo: 'MEX', nombre: 'Mexico', grupo: 'A' },
  { codigo: 'RSA', nombre: 'Sudafrica', grupo: 'A' },
  { codigo: 'KOR', nombre: 'Corea del Sur', grupo: 'A' },
  { codigo: 'CZE', nombre: 'Republica Checa', grupo: 'A' },
  { codigo: 'CAN', nombre: 'Canada', grupo: 'B' },
  { codigo: 'SUI', nombre: 'Suiza', grupo: 'B' },
  { codigo: 'QAT', nombre: 'Qatar', grupo: 'B' },
  { codigo: 'BIH', nombre: 'Bosnia y Herzegovina', grupo: 'B' },
  { codigo: 'BRA', nombre: 'Brasil', grupo: 'C' },
  { codigo: 'MAR', nombre: 'Marruecos', grupo: 'C' },
  { codigo: 'HAI', nombre: 'Haiti', grupo: 'C' },
  { codigo: 'SCO', nombre: 'Escocia', grupo: 'C' },
  { codigo: 'USA', nombre: 'Estados Unidos', grupo: 'D' },
  { codigo: 'PAR', nombre: 'Paraguay', grupo: 'D' },
  { codigo: 'AUS', nombre: 'Australia', grupo: 'D' },
  { codigo: 'TUR', nombre: 'Turquia', grupo: 'D' },
  { codigo: 'GER', nombre: 'Alemania', grupo: 'E' },
  { codigo: 'CUW', nombre: 'Curazao', grupo: 'E' },
  { codigo: 'CIV', nombre: 'Costa de Marfil', grupo: 'E' },
  { codigo: 'ECU', nombre: 'Ecuador', grupo: 'E' },
  { codigo: 'NED', nombre: 'Paises Bajos', grupo: 'F' },
  { codigo: 'JPN', nombre: 'Japon', grupo: 'F' },
  { codigo: 'TUN', nombre: 'Tunez', grupo: 'F' },
  { codigo: 'SWE', nombre: 'Suecia', grupo: 'F' },
  { codigo: 'BEL', nombre: 'Belgica', grupo: 'G' },
  { codigo: 'EGY', nombre: 'Egipto', grupo: 'G' },
  { codigo: 'IRN', nombre: 'Iran', grupo: 'G' },
  { codigo: 'NZL', nombre: 'Nueva Zelanda', grupo: 'G' },
  { codigo: 'ESP', nombre: 'Espana', grupo: 'H' },
  { codigo: 'CPV', nombre: 'Cabo Verde', grupo: 'H' },
  { codigo: 'KSA', nombre: 'Arabia Saudita', grupo: 'H' },
  { codigo: 'URU', nombre: 'Uruguay', grupo: 'H' },
  { codigo: 'FRA', nombre: 'Francia', grupo: 'I' },
  { codigo: 'SEN', nombre: 'Senegal', grupo: 'I' },
  { codigo: 'NOR', nombre: 'Noruega', grupo: 'I' },
  { codigo: 'IRQ', nombre: 'Iraq', grupo: 'I' },
  { codigo: 'ARG', nombre: 'Argentina', grupo: 'J' },
  { codigo: 'ALG', nombre: 'Argelia', grupo: 'J' },
  { codigo: 'AUT', nombre: 'Austria', grupo: 'J' },
  { codigo: 'JOR', nombre: 'Jordania', grupo: 'J' },
  { codigo: 'POR', nombre: 'Portugal', grupo: 'K' },
  { codigo: 'UZB', nombre: 'Uzbekistan', grupo: 'K' },
  { codigo: 'COL', nombre: 'Colombia', grupo: 'K' },
  { codigo: 'COD', nombre: 'Congo DR', grupo: 'K' },
  { codigo: 'ENG', nombre: 'Inglaterra', grupo: 'L' },
  { codigo: 'CRO', nombre: 'Croacia', grupo: 'L' },
  { codigo: 'GHA', nombre: 'Ghana', grupo: 'L' },
  { codigo: 'PAN', nombre: 'Panama', grupo: 'L' },
];

const PARTIDOS_GRUPOS = [
  [1, '11-Jun-26', '15:00', 'MEX', 'RSA', 'A'],
  [2, '11-Jun-26', '22:00', 'KOR', 'CZE', 'A'],
  [3, '12-Jun-26', '15:00', 'CAN', 'BIH', 'B'],
  [4, '12-Jun-26', '21:00', 'USA', 'PAR', 'D'],
  [5, '13-Jun-26', '21:00', 'HAI', 'SCO', 'C'],
  [6, '13-Jun-26', '24:00', 'AUS', 'TUR', 'D'],
  [7, '13-Jun-26', '18:00', 'BRA', 'MAR', 'C'],
  [8, '13-Jun-26', '15:00', 'QAT', 'SUI', 'B'],
  [9, '14-Jun-26', '19:00', 'CIV', 'ECU', 'E'],
  [10, '14-Jun-26', '13:00', 'GER', 'CUW', 'E'],
  [11, '14-Jun-26', '16:00', 'NED', 'JPN', 'F'],
  [12, '14-Jun-26', '22:00', 'SWE', 'TUN', 'F'],
  [13, '15-Jun-26', '18:00', 'KSA', 'URU', 'H'],
  [14, '15-Jun-26', '12:00', 'ESP', 'CPV', 'H'],
  [15, '15-Jun-26', '21:00', 'IRN', 'NZL', 'G'],
  [16, '15-Jun-26', '15:00', 'BEL', 'EGY', 'G'],
  [17, '16-Jun-26', '15:00', 'FRA', 'SEN', 'I'],
  [18, '16-Jun-26', '18:00', 'IRQ', 'NOR', 'I'],
  [19, '16-Jun-26', '21:00', 'ARG', 'ALG', 'J'],
  [20, '16-Jun-26', '24:00', 'AUT', 'JOR', 'J'],
  [21, '17-Jun-26', '19:00', 'GHA', 'PAN', 'L'],
  [22, '17-Jun-26', '16:00', 'ENG', 'CRO', 'L'],
  [23, '17-Jun-26', '13:00', 'POR', 'COD', 'K'],
  [24, '17-Jun-26', '22:00', 'UZB', 'COL', 'K'],
  [25, '18-Jun-26', '12:00', 'CZE', 'RSA', 'A'],
  [26, '18-Jun-26', '15:00', 'SUI', 'BIH', 'B'],
  [27, '18-Jun-26', '18:00', 'CAN', 'QAT', 'B'],
  [28, '18-Jun-26', '21:00', 'MEX', 'KOR', 'A'],
  [29, '19-Jun-26', '21:00', 'BRA', 'HAI', 'C'],
  [30, '19-Jun-26', '18:00', 'SCO', 'MAR', 'C'],
  [31, '19-Jun-26', '23:00', 'TUR', 'PAR', 'D'],
  [32, '19-Jun-26', '15:00', 'USA', 'AUS', 'D'],
  [33, '20-Jun-26', '16:00', 'GER', 'CIV', 'E'],
  [34, '20-Jun-26', '20:00', 'ECU', 'CUW', 'E'],
  [35, '20-Jun-26', '13:00', 'NED', 'SWE', 'F'],
  [36, '20-Jun-26', '24:00', 'TUN', 'JPN', 'F'],
  [37, '21-Jun-26', '18:00', 'URU', 'CPV', 'H'],
  [38, '21-Jun-26', '12:00', 'ESP', 'KSA', 'H'],
  [39, '21-Jun-26', '15:00', 'BEL', 'IRN', 'G'],
  [40, '21-Jun-26', '21:00', 'NZL', 'EGY', 'G'],
  [41, '22-Jun-26', '20:00', 'NOR', 'SEN', 'I'],
  [42, '22-Jun-26', '17:00', 'FRA', 'IRQ', 'I'],
  [43, '22-Jun-26', '13:00', 'ARG', 'AUT', 'J'],
  [44, '22-Jun-26', '23:00', 'JOR', 'ALG', 'J'],
  [45, '23-Jun-26', '16:00', 'ENG', 'GHA', 'L'],
  [46, '23-Jun-26', '19:00', 'PAN', 'CRO', 'L'],
  [47, '23-Jun-26', '13:00', 'POR', 'UZB', 'K'],
  [48, '23-Jun-26', '22:00', 'COL', 'COD', 'K'],
  [49, '24-Jun-26', '18:00', 'SCO', 'BRA', 'C'],
  [50, '24-Jun-26', '18:00', 'MAR', 'HAI', 'C'],
  [51, '24-Jun-26', '15:00', 'SUI', 'CAN', 'B'],
  [52, '24-Jun-26', '15:00', 'BIH', 'QAT', 'B'],
  [53, '24-Jun-26', '21:00', 'CZE', 'MEX', 'A'],
  [54, '24-Jun-26', '21:00', 'RSA', 'KOR', 'A'],
  [55, '25-Jun-26', '16:00', 'CUW', 'CIV', 'E'],
  [56, '25-Jun-26', '16:00', 'ECU', 'GER', 'E'],
  [57, '25-Jun-26', '19:00', 'JPN', 'SWE', 'F'],
  [58, '25-Jun-26', '19:00', 'TUN', 'NED', 'F'],
  [59, '25-Jun-26', '22:00', 'TUR', 'USA', 'D'],
  [60, '25-Jun-26', '22:00', 'PAR', 'AUS', 'D'],
  [61, '26-Jun-26', '15:00', 'NOR', 'FRA', 'I'],
  [62, '26-Jun-26', '15:00', 'SEN', 'IRQ', 'I'],
  [63, '26-Jun-26', '23:00', 'EGY', 'IRN', 'G'],
  [64, '26-Jun-26', '23:00', 'NZL', 'BEL', 'G'],
  [65, '26-Jun-26', '20:00', 'CPV', 'KSA', 'H'],
  [66, '26-Jun-26', '20:00', 'URU', 'ESP', 'H'],
  [67, '27-Jun-26', '17:00', 'PAN', 'ENG', 'L'],
  [68, '27-Jun-26', '17:00', 'CRO', 'GHA', 'L'],
  [69, '27-Jun-26', '22:00', 'ALG', 'AUT', 'J'],
  [70, '27-Jun-26', '22:00', 'JOR', 'ARG', 'J'],
  [71, '27-Jun-26', '19:30', 'COL', 'POR', 'K'],
  [72, '27-Jun-26', '19:30', 'COD', 'UZB', 'K'],
];

const PARTIDOS_ELIMINATORIAS = [
  [73, '28-Jun-26', '15:00', 'dieciseisavos', 'Segundo Grupo A v Segundo Grupo B'],
  [74, '29-Jun-26', '16:30', 'dieciseisavos', 'Ganador Grupo E v Tercero Grupo A/B/C/D/F'],
  [75, '29-Jun-26', '21:00', 'dieciseisavos', 'Ganador Grupo F v Segundo Grupo C'],
  [76, '29-Jun-26', '13:00', 'dieciseisavos', 'Ganador Grupo C v Segundo Grupo F'],
  [77, '30-Jun-26', '17:00', 'dieciseisavos', 'Ganador Grupo I v Tercero Grupo C/D/F/G/H'],
  [78, '30-Jun-26', '13:00', 'dieciseisavos', 'Segundo Grupo E v Segundo Grupo I'],
  [79, '30-Jun-26', '21:00', 'dieciseisavos', 'Ganador Grupo A v Tercero Grupo C/E/F/H/I'],
  [80, '01-Jul-26', '12:00', 'dieciseisavos', 'Ganador Grupo L v Tercero Grupo E/H/I/J/K'],
  [81, '01-Jul-26', '20:00', 'dieciseisavos', 'Ganador Grupo D v Tercero Grupo B/E/F/I/J'],
  [82, '01-Jul-26', '16:00', 'dieciseisavos', 'Ganador Grupo G v Tercero Grupo A/E/H/I/J'],
  [83, '02-Jul-26', '19:00', 'dieciseisavos', 'Segundo Grupo K v Segundo Grupo L'],
  [84, '02-Jul-26', '15:00', 'dieciseisavos', 'Ganador Grupo H v Segundo Grupo J'],
  [85, '02-Jul-26', '23:00', 'dieciseisavos', 'Ganador Grupo B v Tercero Grupo E/F/G/I/J'],
  [86, '03-Jul-26', '18:00', 'dieciseisavos', 'Ganador Grupo J v Segundo Grupo H'],
  [87, '03-Jul-26', '21:30', 'dieciseisavos', 'Ganador Grupo K v Tercero Grupo D/E/I/J/L'],
  [88, '03-Jul-26', '14:00', 'dieciseisavos', 'Segundo Grupo D v Segundo Grupo G'],
  [89, '04-Jul-26', '17:00', 'octavos', 'Ganador Partido 74 v Ganador Partido 77'],
  [90, '04-Jul-26', '13:00', 'octavos', 'Ganador Partido 73 v Ganador Partido 75'],
  [91, '05-Jul-26', '16:00', 'octavos', 'Ganador Partido 76 v Ganador Partido 78'],
  [92, '05-Jul-26', '20:00', 'octavos', 'Ganador Partido 79 v Ganador Partido 80'],
  [93, '06-Jul-26', '15:00', 'octavos', 'Ganador Partido 83 v Ganador Partido 84'],
  [94, '06-Jul-26', '20:00', 'octavos', 'Ganador Partido 81 v Ganador Partido 82'],
  [95, '07-Jul-26', '12:00', 'octavos', 'Ganador Partido 86 v Ganador Partido 88'],
  [96, '07-Jul-26', '16:00', 'octavos', 'Ganador Partido 85 v Ganador Partido 87'],
  [97, '09-Jul-26', '16:00', 'cuartos', 'Ganador Partido 89 v Ganador Partido 90'],
  [98, '10-Jul-26', '15:00', 'cuartos', 'Ganador Partido 93 v Ganador Partido 94'],
  [99, '11-Jul-26', '17:00', 'cuartos', 'Ganador Partido 91 v Ganador Partido 92'],
  [100, '11-Jul-26', '21:00', 'cuartos', 'Ganador Partido 95 v Ganador Partido 96'],
  [101, '14-Jul-26', '15:00', 'semifinal', 'Ganador Partido 97 v Ganador Partido 98'],
  [102, '15-Jul-26', '15:00', 'semifinal', 'Ganador Partido 99 v Ganador Partido 100'],
  [103, '18-Jul-26', '17:00', 'tercer_puesto', 'Perdedor Partido 101 v Perdedor Partido 102'],
  [104, '19-Jul-26', '15:00', 'final', 'Ganador Partido 101 v Ganador Partido 102'],
];

function buildPartidosSql() {
  const filasGrupos = PARTIDOS_GRUPOS.map(([numero, fecha, hora, local, visitante, grupo]) => {
    const fechaHora = parseFecha(fecha, hora);
    return `(${numero}, (SELECT id FROM equipos WHERE codigo_pais = '${local}'), (SELECT id FROM equipos WHERE codigo_pais = '${visitante}'), NULL, '${fechaHora}', 'grupos', '${grupo}')`;
  });

  const filasEliminatorias = PARTIDOS_ELIMINATORIAS.map(([numero, fecha, hora, fase, descripcion]) => {
    const fechaHora = parseFecha(fecha, hora);
    const desc = descripcion.replace(/'/g, "''");
    return `(${numero}, NULL, NULL, '${desc}', '${fechaHora}', '${fase}', NULL)`;
  });

  return `INSERT INTO partidos (numero_oficial, equipo_local_id, equipo_visitante_id, descripcion, fecha_hora, fase, grupo) VALUES\n${filasGrupos.concat(filasEliminatorias).join(',\n')};`;
}

function buildEquiposSql() {
  const filas = EQUIPOS.map((e) => `('${e.nombre}', '${e.codigo}', '${e.grupo}')`);
  return `INSERT INTO equipos (nombre, codigo_pais, grupo) VALUES\n${filas.join(',\n')};`;
}

module.exports = {
  EQUIPOS,
  buildEquiposSql,
  buildPartidosSql,
};
