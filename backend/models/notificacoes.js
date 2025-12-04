import { create, readAll, read, update, deleteRecord } from "../config/database.js";

export const Notificacao = {
  create: async (data) => {
    return await create("notificacoes", data);
  },

  getAll: async () => {
    const result = await readAll("notificacoes");
    return Array.isArray(result) ? result : [];
  },

  getByUsuario: async (usuario_id) => {
    const result = await read("notificacoes", `usuario_id = ${usuario_id}`);
    return Array.isArray(result) ? result : [];
  },

  getByUnidade: async (unidade_id) => {
    const result = await read("notificacoes", `unidade_id = ${unidade_id}`);
    return Array.isArray(result) ? result : [];
  },

  getById: async (id) => {
    const result = await read("notificacoes", `id = ${id}`);
    return result?.[0] || null;
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
};