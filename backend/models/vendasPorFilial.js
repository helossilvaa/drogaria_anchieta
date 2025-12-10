import { query } from "../config/database.js";

export const VendasPorFilial = {
  //Produtos mais vendidos 
  async topProdutosMaisVendidos(unidadeId) {
    const sql = `
      SELECT 
        p.id,
        p.nome,
        p.foto,
        p.preco_unitario,
        SUM(iv.quantidade) AS total_vendido
      FROM itens_venda iv
      JOIN vendas v ON v.id = iv.venda_id
      JOIN produtos p ON p.id = iv.produto_id
      WHERE v.unidade_id = ?
      GROUP BY p.id, p.nome, p.foto, p.preco_unitario
      ORDER BY total_vendido DESC
      LIMIT 4;
    `;

    return await query(sql, [unidadeId]);
  },

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

  // Total de vendas por hora da filial
  vendasPorHora: async (unidadeId) => {
    const sql = `
      SELECT HOUR(v.data) AS hora, COUNT(*) AS total_vendas
      FROM vendas v
      WHERE v.unidade_id = ?
      GROUP BY HOUR(v.data)
      ORDER BY HOUR(v.data)
    `;
    try {
      const resultados = await query(sql, [unidadeId]);
      return resultados.map(row => ({
        hora: row.hora,
        total: row.total_vendas,
      }));
    } catch (err) {
      console.error("Erro ao buscar vendas por hora:", err);
      throw err;
    }
  },
};