// models/notificacoes.js
import { create, readAll, read, update, deleteRecord } from "../config/database.js";

export const Notificacao = {
  create: async (data) => {
    return await create("notificacoes", data);
  },

  getAll: async () => {
    const result = await readAll("notificacoes", "1=1 ORDER BY criada_em DESC");
    return Array.isArray(result) ? result : [];
  },

  getByUsuario: async (usuario_id) => {
    const where = `usuario_id = ${usuario_id} ORDER BY criada_em DESC`;
    const result = await readAll("notificacoes", where);
    return Array.isArray(result) ? result : [];
  },

  getByUnidade: async (unidade_id) => {
    const where = `unidade_id = ${unidade_id} ORDER BY criada_em DESC`;
    const result = await readAll("notificacoes", where);
    return Array.isArray(result) ? result : [];
  },

  markAsRead: async (id) => {
    return await update("notificacoes", { lida: 1 }, `id = ${id}`);
  },

  update: async (id, data) => {
    return await update("notificacoes", data, `id = ${id}`);
  },

  delete: async (id) => {
    return await deleteRecord("notificacoes", `id = ${id}`);
  },

  markAllAsRead: async (usuario_id) => {
  const where = `usuario_id = ${usuario_id} AND lida = 0`;
  return await update("notificacoes", { lida: 1 }, where);
},
};