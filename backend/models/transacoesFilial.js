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
      id, 
      data_pagamento AS data_lancamento, 
      'SAIDA' AS tipo_movimento, 
      valor, 
      'Pagamento de salário' AS descricao, 
      'Salários' AS origem, 
      unidade_id, 
      NULL AS categoria_transacao_id, 
      'Salários' AS categoria_nome
    FROM pagamentos_salarios
    WHERE status_pagamento = 'pago'
      AND unidade_id = ?

    UNION ALL

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

  return query(sql, [unidadeId, unidadeId]);
}


export async function getCategoriasTransacoes() {
  return query("SELECT * FROM categoria_transacoes ORDER BY categoria_transacao");
}
