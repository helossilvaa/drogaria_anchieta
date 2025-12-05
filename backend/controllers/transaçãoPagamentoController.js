import { query } from "../config/database.js";

export async function transacaoPagamento() {
  console.log("🔍 Somando folha de pagamento...");

  
  const somaPorUnidade = await query(`
    SELECT unidade_id, SUM(valor) AS total_salarios
    FROM pagamentos_salarios
    WHERE status_pagamento = 'pago'
      AND MONTH(data_pagamento) = MONTH(CURRENT_DATE())
      AND YEAR(data_pagamento) = YEAR(CURRENT_DATE())
    GROUP BY unidade_id
  `);

  if (somaPorUnidade.length === 0) {
    console.log("⚠️ Nenhum salário pago este mês.");
    return;
  } 

  console.log("Resultado:", somaPorUnidade);
}
 