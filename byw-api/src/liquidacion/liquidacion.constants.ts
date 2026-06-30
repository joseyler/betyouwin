import { TipoApuesta } from '../common/enums';

export const COEFICIENTE_PREMIO: Record<TipoApuesta, number> = {
  [TipoApuesta.GANADOR]: 2,
  [TipoApuesta.EMPATE]: 3,
  [TipoApuesta.RESULTADO_EXACTO]: 6,
};
