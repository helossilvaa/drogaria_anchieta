import { query } from "../config/database.js";

export async function pagarContasAutomaticamente() {
  try {
    console.log("🔍 Buscando contas para pagamento automático...");

    const contasPendentes = await query(`
      SELECT c.id, c.nomeConta, c.valor, c.dataVencimento, c.unidade_id
      FROM contas c
      LEFT JOIN pagamentos_contas pc ON pc.conta_id = c.id AND pc.status_pagamento = 'pago'
      WHERE pc.id IS NULL 
        AND DATEDIFF(c.dataVencimento, CURRENT_DATE()) <= 10
    `);

    if (!contasPendentes.length) {
      console.log("Nenhuma conta para pagamento automático.");
      return;
    }

    for (const conta of contasPendentes) {
      console.log(`💰 Pagando conta: ${conta.nomeConta}`);

      // Registrar pagamento
      await query(
        `INSERT INTO pagamentos_contas 
         (conta_id, valor_pago, data_pagamento, status_pagamento, unidade_id)
         VALUES (?, ?, CURRENT_DATE(), 'pago', ?)`,
        [conta.id, conta.valor, conta.unidade_id]
      );

      // Lançar transação de saída
      await query(
        `INSERT INTO transacoes 
         (data_lancamento, tipo_movimento, valor, descricao, unidade_id, categoria_transacao_id, origem)
         VALUES (CURRENT_TIMESTAMP, 'SAIDA', ?, ?, ?, ?, 'contas')`,
        [
          conta.valor,
          `Pagamento automático da conta: ${conta.nomeConta}`,
          conta.unidade_id,
          6 
        ]
      );
    }

    console.log("✨ Processamento finalizado: contas pagas automaticamente.");

  } catch (error) {
    console.error("❌ Erro no pagamento automático:", error);
  }
}
