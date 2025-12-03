import { query } from "../config/database.js";

export const listarHistoricoPagamentos = async (req, res) => {
  try {
    const { mes, ano, unidade_id } = req.query;

    const dados = await query(`
      SELECT 
        p.*, 
        f.nome AS funcionario, 
        f.registro,
        d.departamento
      FROM pagamentos_salarios p
      JOIN funcionarios f ON f.id = p.funcionario_id
      JOIN departamento d ON d.id = p.departamento_id
      WHERE MONTH(p.data_pagamento) = ?
        AND YEAR(p.data_pagamento) = ?
        AND p.unidade_id = ?
      ORDER BY p.data_pagamento DESC
    `, [mes, ano, unidade_id]);

    res.json(dados);

  } catch (erro) {
    console.log(erro);
    res.status(500).json({ msg: "Erro ao buscar histórico." });
  }
};
