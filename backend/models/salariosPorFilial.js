import { query } from "../config/database.js";

export const SalariosPorFilial = {
    listarPorUnidade: async (unidadeId) => {
        const sql = `
      SELECT s.id, s.valor, s.status_pagamento, s.data_atualizado, f.nome AS funcionario
      FROM salarios s
      JOIN funcionarios f ON s.id_funcionario = f.id
      WHERE f.unidade_id = ?
      ORDER BY s.data_atualizado DESC
    `;
        try {
            return await query(sql, [unidadeId]);
        } catch (err) {
            console.error("Erro ao listar salários da filial:", err);
            throw err;
        }
    },
};

export { SalariosPorFilial };