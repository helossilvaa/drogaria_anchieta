import { create, readAll, update, deleteRecord } from "../config/database.js"; 

export const Conta = { 

  getAllByUnidade: async (unidadeId) => {
    return await readAll("contas", `unidade_id = ${unidadeId}`);
  },

  create: async (data) => {
    return await create("contas", data); 
  }, 

  getAll: async () => { 
    return await readAll("contas"); 
  },

  update: async (id, data) => { 
    return await update("contas", data, `id = ${id}`); 
  },

  delete: async (id) => { 
    return await deleteRecord ("contas", `id = ${id}`);
  }, 
}; 