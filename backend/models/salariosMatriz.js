import { create, update, deleteRecord, query } from "../config/database.js";

export const Salario = {
  create: async (data) => {
    return await create("salarios", data);
  },

 async getAll() {
  const sql = `
    SELECT 
      s.id,
      u.id AS id_funcionario,
      u.registro,
      u.nome AS funcionario,
      u.unidade_id,
      s.departamento_id,
      d.departamento AS departamento,
      s.valor,
      s.status_pagamento,
      s.data_atualizado
    FROM salarios s
    JOIN funcionarios u ON s.id_funcionario = u.id
    JOIN departamento d ON s.departamento_id = d.id
    ORDER BY s.id DESC
  `;


    try {
      return await query(sql);
    } catch (err) {
      console.error("Erro ao buscar salários:", err);
      throw err;
    }
  },

  update: async (id, data) => {
    return await update("salarios", data, `id = ${id}`);
  },

  delete: async (id) => {
    return await deleteRecord("salarios", `id = ${id}`);
  },
};
