import { create, update, deleteRecord, query } from "../config/database.js";

export const Salario = {
  // 🔹 Criar novo salário
  create: async (data) => {
    return await create("salarios", data);
  },

  // 🔹 Buscar todos os salários com JOINs corretos
  getAll: async () => {
    const sql = `
      SELECT 
        s.id,
        u.registro,
        u.nome AS funcionario,
        d.departamento AS departamento,
        s.valor,
        s.status_pagamento,
        s.data_atualizado
      FROM salarios s
      JOIN usuarios u ON s.id_funcionario = u.id
      JOIN departamento d ON s.departamento_id = d.id
      ORDER BY s.id DESC
    `;

    try {
      const result = await query(sql);
      return result;
    } catch (err) {
      console.error("Erro ao buscar salários:", err);
      throw err;
    }
  },

  // 🔹 Atualizar salário
  update: async (id, data) => {
    return await update("salarios", data, `id = ${id}`);
  },

  // 🔹 Deletar salário
  delete: async (id) => {
    return await deleteRecord("salarios", `id = ${id}`);
  },
};
