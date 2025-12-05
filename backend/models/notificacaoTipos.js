// models/notificacaoTipos.js
import { read, readAll, create, update } from "../config/database.js";

export const NotificacaoTipos = {
  getByName: async (nome) => {
    const where = `LOWER(TRIM(nome)) = LOWER(TRIM('${nome}'))`;
    return await read("notificacao_tipos", where);
  },

  create: async (data) => {
    return await create("notificacao_tipos", data);
  },

  getOrCreateByName: async (nome, defaults = {}) => {
    const found = await NotificacaoTipos.getByName(nome);
    if (found) return found;
    const id = await NotificacaoTipos.create({
      nome,
      icone: defaults.icone || "Info",
      cor: defaults.cor || "pink",
      acao_texto_padrao: defaults.acao_texto_padrao || null,
      extra_info_padrao: defaults.extra_info_padrao || null,
    });
    return { id, nome, ...defaults };
  },
};