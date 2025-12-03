import { create, update, deleteRecord, query } from "../config/database.js";

export const Salario = {
  // 🔹 Criar novo salário
  create: async (data) => {
    return await create("salarios", data);
  },

  getAll: async (unidadeFiltro) => {
  let sql = `
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
    WHERE d.departamento IN ('Gerente', 'Caixa')
  `;

  if (unidadeFiltro) {
    sql += ` AND u.unidade_id = ${unidadeFiltro}`;
  }

  sql += " ORDER BY s.id DESC";

  try {
    return await query(sql);
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
