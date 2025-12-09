import { query } from "../config/database.js";

export const VendasPorFilial = {
  totalVendasHoje: async (unidadeId) => {
    const sql = `
      SELECT SUM(total) AS total_vendas
      FROM vendas
      WHERE unidade_id = ? AND DATE(data) = CURDATE()
    `;
    try {
      const [resultado] = await query(sql, [unidadeId]);
      return resultado?.total_vendas || 0;
    } catch (err) {
      console.error("Erro ao calcular total de vendas hoje:", err);
      throw err;
    }
  },
};