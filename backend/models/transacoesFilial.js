import { query } from "../config/database.js";

export async function getSomaSalariosMes(unidadeId) {
  const sql = `
    SELECT  
      unidade_id, 
      SUM(valor) AS total_salarios
    FROM pagamentos_salarios
    WHERE status_pagamento = 'pago'
      AND unidade_id = ?
      AND MONTH(data_pagamento) = MONTH(CURRENT_DATE())
      AND YEAR(data_pagamento) = YEAR(CURRENT_DATE())
    GROUP BY unidade_id
  `;
  return query(sql, [unidadeId]);
}


export async function getTransacoesUnidade(unidadeId) {
  const sql = `
    SELECT 
      t.id, 
      t.data_lancamento, 
      t.tipo_movimento, 
      t.valor, 
      t.descricao, 
      t.origem,  
      t.unidade_id, 
      t.categoria_transacao_id, 
      c.categoria_transacao AS categoria_nome
    FROM transacoes t
    JOIN categoria_transacoes c 
        ON t.categoria_transacao_id = c.id
    WHERE t.unidade_id = ?
    ORDER BY data_lancamento DESC;
  `;

  const transacoes = await query(sql, [unidadeId]);

  // 🔹 Somando salários da unidade (já filtrado por mês)
  const salarios = await getSomaSalariosMes(unidadeId);

  if (salarios.length > 0) {
    transacoes.unshift({
      id: "-",
      data_lancamento: new Date().toISOString().split("T")[0], // hoje como referência
      tipo_movimento: "SAIDA",
      valor: salarios[0].total_salarios,
      descricao: "Total Salários do Mês",
      origem: "Salários",
      unidade_id: unidadeId,
      categoria_transacao_id: null,
      categoria_nome: "Salários"
    });
  }

  return transacoes;
}


export async function getCategoriasTransacoes() {
  return query("SELECT * FROM categoria_transacoes ORDER BY categoria_transacao");
}
