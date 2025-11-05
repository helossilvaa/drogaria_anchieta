import { readAll, create, update, deleteRecord } from "../config/database.js";

export const Salario = {
  create: async (data) => {
    return await create("salarios", data);
  },

getAll: async () => {
  const query = `
    SELECT 
      s.id,
      u.registro,
      u.nome AS funcionario,
      d.nome AS departamento,
      st.nome AS setor,
      un.nome AS unidade,
      s.valor,
      s.status_pagamento,
      s.data_atualizado
    FROM salarios s
    JOIN usuarios u ON s.id_funcionario = u.id
    JOIN departamento d ON s.departamento_id = d.id
    JOIN setor st ON s.setor_id = st.id
    JOIN unidade un ON s.unidade_id = un.id
    ORDER BY s.id DESC
  `;

  const result = await readAll("salarios");
  console.log("Resultado do readAll:", result);
  return result;
},

  update: async (id, data) => {
    return await update("salarios", data, `id = ${id}`);
  },

  delete: async (id) => {
    return await deleteRecord("salarios", `id = ${id}`);
  },
};
