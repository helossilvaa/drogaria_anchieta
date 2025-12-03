import { create, readAll, read, update, deleteRecord } from "../config/database.js";

export const Filiado = {
  create: async (data) => {
    return await create("filiados", data);
  },

  getAll: async () => {
    const result = await readAll("filiados");
    return Array.isArray(result) ? result : [];
  },

  getByCPF: async (cpf) => {
    const result = await read("filiados", `cpf = '${cpf}'`);
    return result || null;

  },


  update: async (id, data) => {
    return await update("filiados", data, `id = ${id}`);
  },

  delete: async (id) => {
    return await deleteRecord("filiados", `id = ${id}`);
  },
};