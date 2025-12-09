import { query } from "../config/database.js";

//
// SOMA DOS SALÁRIOS DO MÊS
//
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


//
// LISTA TODAS AS TRANSACOES (JÁ AGRUPADAS POR DIA PORQUE O INSERT JÁ AGRUPA)
//
export async function getTransacoesUnidade(unidadeId) {
  const sql = `
    SELECT 
      t.id, 
      DATE(t.data_lancamento) AS data_lancamento,
      t.tipo_movimento, 
      t.valor, 
      t.descricao, 
      t.origem,  
      t.unidade_id, 
      t.categoria_transacao_id, 
      c.categoria_transacao AS categoria_nome
    FROM transacoes t
    LEFT JOIN categoria_transacoes c 
      ON t.categoria_transacao_id = c.id
    WHERE t.unidade_id = ?
      AND MONTH(t.data_lancamento) = MONTH(CURRENT_DATE())
      AND YEAR(t.data_lancamento) = YEAR(CURRENT_DATE())
    ORDER BY DATE(t.data_lancamento) DESC;
  `;

  const transacoes = await query(sql, [unidadeId]);

  // Adiciona linha de salários agrupados no topo (somente do mês atual)
  const salarios = await getSomaSalariosMes(unidadeId);

  if (salarios.length > 0 && salarios[0].total_salarios > 0) {
    transacoes.unshift({
      id: "-",
      data_lancamento: new Date().toISOString().split("T")[0],
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

export async function calcularLucroFilial(unidadeId) {
  const sql = `
    SELECT 
      SUM(CASE WHEN tipo_movimento = 'ENTRADA' THEN valor ELSE 0 END) AS entradas,
      SUM(CASE WHEN tipo_movimento = 'SAIDA' THEN valor ELSE 0 END) AS saidas
    FROM transacoes
    WHERE unidade_id = ?
      AND MONTH(data_lancamento) = MONTH(CURRENT_DATE())
      AND YEAR(data_lancamento) = YEAR(CURRENT_DATE());
  `;

  const resultado = await query(sql, [unidadeId]);

  if (resultado.length === 0) {
    return { entradas: 0, saidas: 0, lucro_liquido: 0 };
  }

  const entradas = parseFloat(resultado[0].entradas || 0);
  const saidas = parseFloat(resultado[0].saidas || 0);
  const lucro_liquido = entradas - saidas - 20000; // reserva da filial

  return { entradas, saidas, lucro_liquido };
}


export async function transferirLucroParaMatriz(unidadeId) {
  // 1. Calcula lucro da filial
  const lucro = await calcularLucroFilial(unidadeId);

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth() + 1;

  // 2. Insere na tabela matriz
  const sqlMatriz = `
    INSERT INTO transacoes_matriz (unidade_id, ano, mes, entradas, saidas, lucro_liquido, tipo_movimento, categoria_transacao_id)
    VALUES (?, ?, ?, ?, ?, ?, 'ENTRADA', 4)
  `;
  await query(sqlMatriz, [unidadeId, ano, mes, lucro.entradas, lucro.saidas, lucro.lucro_liquido]);

  // 3. Cria uma saída na filial para reduzir o saldo
  const sqlFilialSaida = `
    INSERT INTO transacoes (unidade_id, data_lancamento, tipo_movimento, valor, descricao, origem, categoria_transacao_id)
    VALUES (?, NOW(), 'SAIDA', ?, 'Transferência para matriz', 'Lucro', 4)
  `;
  await query(sqlFilialSaida, [unidadeId, lucro.lucro_liquido]);

  return lucro;
}



export async function getCategoriasTransacoes() {
  return query("SELECT * FROM categoria_transacoes ORDER BY categoria_transacao");
}
