import { query } from '../config/database.js';
import { VendasPorFilial } from "../models/vendasPorFilial.js";

export const totalVendasHoje = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    // ADICIONAR ESTE CONSOLE PARA CHECAR O ID DO USUÁRIO
    console.log("Usuario ID:", usuarioId);

    const sqlUnidade = `
      SELECT f.unidade_id
      FROM usuarios u
      JOIN funcionarios f ON f.id = u.funcionario_id
      WHERE u.id = ?
    `;
    const resultado = await query(sqlUnidade, [usuarioId]);

    // ADICIONAR ESTE CONSOLE PARA CHECAR SE A UNIDADE FOI ENCONTRADA
    console.log("Resultado SQL unidade:", resultado);

    if (!resultado.length) return res.status(404).json({ error: "Usuário não encontrado" });

    const unidadeId = resultado[0].unidade_id;

    // CONSOLE PARA CHECAR O ID DA UNIDADE
    console.log("Unidade ID:", unidadeId);

    const sqlTotalVendas = `
      SELECT SUM(total) AS totalVendas
      FROM vendas
      WHERE unidade_id = ? AND DATE(data) = CURDATE()
    `;
    const [totalRes] = await query(sqlTotalVendas, [unidadeId]);

    // CONSOLE PARA CHECAR O RESULTADO DO TOTAL DE VENDAS
    console.log("Total vendas:", totalRes);

    const sqlTotalProdutos = `
      SELECT SUM(quantidade) AS totalProdutosVendidos
FROM itens_venda iv
JOIN vendas v ON v.id = iv.venda_id
WHERE v.unidade_id = ? AND DATE(v.data) = CURDATE()
    `;
    const [produtosRes] = await query(sqlTotalProdutos, [unidadeId]);

    // CONSOLE PARA CHECAR O RESULTADO DO TOTAL DE PRODUTOS VENDIDOS
    console.log("Total produtos vendidos:", produtosRes);

    res.json({
      totalVendas: totalRes?.totalVendas || 0,
      totalProdutosVendidos: produtosRes?.totalProdutosVendidos || 0,
    });
  } catch (err) {
    console.error("Erro ao buscar totais:", err);
    res.status(500).json({ error: "Erro ao buscar totais" });
  }
};

export const vendasPorHora = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    // Pegar unidade do usuário
    const sqlUnidade = `
      SELECT f.unidade_id
      FROM usuarios u
      JOIN funcionarios f ON f.id = u.funcionario_id
      WHERE u.id = ?
    `;
    const resultado = await query(sqlUnidade, [usuarioId]);

    if (!resultado.length) return res.status(404).json({ error: "Usuário não encontrado" });

    const unidadeId = resultado[0].unidade_id;

    const dados = await VendasPorFilial.vendasPorHora(unidadeId);

    res.json(dados);
  } catch (err) {
    console.error("Erro ao buscar vendas por hora:", err);
    res.status(500).json({ error: "Erro ao buscar vendas por hora" });
  }
};

export const topProdutos = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const sqlUnidade = `
      SELECT f.unidade_id
      FROM usuarios u
      JOIN funcionarios f ON f.id = u.funcionario_id
      WHERE u.id = ?
    `;
    const resultado = await query(sqlUnidade, [usuarioId]);

    if (!resultado.length)
      return res.status(404).json({ error: "Usuário não encontrado" });

    const unidadeId = resultado[0].unidade_id;

    const produtos = await VendasPorFilial.topProdutosMaisVendidos(unidadeId);

    res.json(produtos);

  } catch (err) {
    console.error("Erro ao buscar top produtos:", err);
    res.status(500).json({ error: "Erro ao buscar top produtos" });
  }
};