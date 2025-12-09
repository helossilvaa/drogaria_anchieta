import { query } from "../config/database.js";

export const VendasPorFilial = {
  // Total de vendas em R$
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

  // Total de produtos vendidos (quantidade) hoje
  totalProdutosVendidosHoje: async (unidadeId) => {
    const sql = `
      SELECT SUM(vp.quantidade) AS total_produtos
      FROM vendas_produtos vp
      JOIN vendas v ON vp.venda_id = v.id
      WHERE v.unidade_id = ? AND DATE(v.data) = CURDATE()
    `;
    try {
      const [resultado] = await query(sql, [unidadeId]);
      return resultado?.total_produtos || 0;
    } catch (err) {
      console.error("Erro ao calcular total de produtos vendidos hoje:", err);
      throw err;
    }
  },
};
