import { query } from "../config/database.js";

export const VendasPorFilial = {
  listarPorUnidade: async (unidadeId) => {
    const sql = `
      SELECT v.id, v.total, v.data, v.tipo_pagamento_id, d.desconto AS desconto_valor
      FROM vendas v
      LEFT JOIN descontos d ON v.desconto_id = d.id
      WHERE v.unidade_id = ?
      ORDER BY v.data DESC
    `;
    try {
      return await query(sql, [unidadeId]);
    } catch (err) {
      console.error("Erro ao listar vendas da filial:", err);
      throw err;
    }
  },
};
export { VendasPorFilial };

