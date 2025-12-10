import { query, create, update, deleteRecord } from "../config/database.js";

// Pega todas as transações da tabela e calcula totais
export async function getTransacoesComTotais() {
  const sql = `
    SELECT 
      t.id,
      t.unidade_id, 
      t.ano,
      t.mes,
      t.entradas,
      t.saidas,
      t.lucro_liquido,
      t.data_transferencia,
      t.tipo_movimento,
      t.categoria_transacao_id,
      c.categoria_transacao AS categoria_nome
    FROM transacoes_matriz t
    LEFT JOIN categoria_transacoes c ON t.categoria_transacao_id = c.id
    ORDER BY t.data_transferencia DESC;
  `;

  const transacoes = await query(sql);

  // Totais usando lucro_liquido como saldo
  let totalEntradas = 0;
  let totalSaidas = 0;
  let totalLucroLiquido = 0;

  for (const t of transacoes) {
    totalEntradas += Number(t.entradas || 0);
    totalSaidas += Number(t.saidas || 0);
    totalLucroLiquido += Number(t.lucro_liquido || 0);
  }

  return {
    transacoes,
    totalEntradas,
    totalSaidas,
    saldo: totalLucroLiquido // saldo = lucro líquido total
  };
}

// Criar nova transação
export async function criarTransacao(transacaoData) {
  try {
    return await create("transacoes_matriz", transacaoData);
  } catch (error) {
    console.error("Erro ao criar transação: ", error);
    throw error;
  }
}

// Atualizar transação existente
export async function atualizarTransacao(id, dadosAtualizados) {
  try {
    return await update("transacoes_matriz", dadosAtualizados, `id = ${id}`);
  } catch (error) {
    console.error("Erro ao atualizar transação: ", error);
    throw error;
  }
}

// Excluir transação
export async function excluirTransacao(id) {
  try {
    return await deleteRecord("transacoes_matriz", `id = ${id}`);
  } catch (error) {
    console.error("Erro ao excluir transação: ", error);
    throw error;
  }
}
