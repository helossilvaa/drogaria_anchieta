import { query } from "../config/database.js";
 
const listarVenda = async (unidade_id) => {
  try {
    const sql = `
      SELECT 
        v.id,
        v.cliente_id,
        v.usuario_id,
        v.unidade_id,
        v.tipo_pagamento_id,
        v.desconto_id,
        v.total,
        v.data,
        d.desconto AS desconto_valor
      FROM vendas v
      LEFT JOIN descontos d ON v.desconto_id = d.id
      WHERE v.unidade_id = ${unidade_id}
    `;
    return await query(sql);
  } catch (error) {
    console.error("Erro ao listar vendas:", error);
    throw error;
  }
};


const registrarTotalDoDia = async (unidade_id, data) => {
  try {
    // Calcula o total das vendas do dia
    const sqlTotal = `
      SELECT SUM(v.total) AS total_dia
      FROM vendas v
      WHERE v.unidade_id = ? AND DATE(v.data) = ?
    `;
    const [result] = await query(sqlTotal, [unidade_id, data]);
    const total = result.total_dia || 0;

    // Insere na tabela de transações
    const sqlInsert = `
      INSERT INTO transacoes
      (data_lancamento, tipo_movimento, valor, descricao, unidade_id, categoria_transacao_id, origem)
      VALUES (?, 'ENTRADA', ?, 'Total de vendas do dia', ?, 5, 'Sistema')
    `;
    await query(sqlInsert, [new Date(), total, unidade_id]);

    console.log(`Transação do dia ${data} registrada para a unidade ${unidade_id}: ${total}`);
  } catch (error) {
    console.error("Erro ao registrar transação do dia:", error);
  }
};


export { registrarTotalDoDia, listarVenda};
