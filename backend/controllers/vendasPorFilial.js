import { query } from '../config/database.js';
import { VendasPorFilial } from "../models/vendasPorFilial.js";

export const listarVendasPorUnidade = async (req, res) => {
  const unidadeId = req.params.id;
  try {
    const vendas = await query('SELECT * FROM vendas WHERE unidade_id = ?', [unidadeId]);
    res.json(vendas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar vendas' });
  }
};

// Total de produtos vendidos hoje para a unidade
export const totalVendasHoje = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const sql = `
      SELECT f.unidade_id
      FROM usuarios u
      JOIN funcionarios f ON f.id = u.funcionario_id
      WHERE u.id = ?
    `;

    const resultado = await query(sql, [usuarioId]);

    if (!resultado.length) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const unidadeId = resultado[0].unidade_id;

    const total = await VendasPorFilial.totalVendasHoje(unidadeId);

    res.json({ total });
  } catch (err) {
    console.error("Erro ao buscar total de vendas hoje:", err);
    res.status(500).json({ error: "Erro ao buscar total de vendas hoje" });
  }
};

export const evolucaoVendasMensalFilialController = async (req, res) => {
  try {
    const { id } = req.params; 

    const sql = `
      SELECT 
        DATE_FORMAT(data, '%Y-%m') AS mes,
        COALESCE(SUM(total), 0) AS total_vendas
      FROM vendas
      WHERE unidade_id = ?
      GROUP BY mes
      ORDER BY mes ASC
    `;

    const dados = await query(sql, [id]);

    res.status(200).json(dados);

  } catch (error) {
    console.error("Erro ao gerar evolução mensal da filial:", error);
    res.status(500).json({ mensagem: "Erro ao gerar evolução mensal da filial" });
  }
};