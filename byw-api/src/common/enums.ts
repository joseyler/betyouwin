export enum FasePartido {
  GRUPOS = 'grupos',
  DIECISEISAVOS = 'dieciseisavos',
  OCTAVOS = 'octavos',
  CUARTOS = 'cuartos',
  SEMIFINAL = 'semifinal',
  TERCER_PUESTO = 'tercer_puesto',
  FINAL = 'final',
}

export enum EstadoPartido {
  PROGRAMADO = 'programado',
  EN_CURSO = 'en_curso',
  FINALIZADO = 'finalizado',
  CANCELADO = 'cancelado',
}

export enum TipoApuesta {
  GANADOR = 'ganador',
  EMPATE = 'empate',
  RESULTADO_EXACTO = 'resultado_exacto',
}

export enum EstadoApuesta {
  PENDIENTE = 'pendiente',
  GANADA = 'ganada',
  PERDIDA = 'perdida',
  CANCELADA = 'cancelada',
}

export enum TipoTransaccion {
  INGRESO = 'ingreso',
  RETIRO = 'retiro',
  APUESTA = 'apuesta',
  GANANCIA = 'ganancia',
}
