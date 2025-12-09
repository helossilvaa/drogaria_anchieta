import { query } from "../config/database.js";

export async function atualizarStatusSalarios() {
  const hoje = new Date();
  const dia = hoje.getDate();

   if (dia === 5) {
    console.log("✔️ Dia 5: marcando salários como PAGOS");

    await query(`
      UPDATE salarios
      SET status_pagamento = 'pago'
      WHERE status_pagamento = 'pendente'
    `); 

    return;
  }

  // =======================
  // 2️⃣ APÓS 10 DIAS - VOLTA PARA PENDENTE
  // =======================
  const salariosPagos = await query(`
    SELECT id, data_pagamento
    FROM pagamentos_salarios
    WHERE DATE(data_pagamento) = DATE_SUB(CURDATE(), INTERVAL 10 DAY)
  `);

  for (const s of salariosPagos) {
    console.log(`↩️ Voltando salário ${s.id} para pendente`);

    await query(
      `UPDATE salarios SET status_pagamento = 'pendente' WHERE id = ?`,
      [s.id]
    );
  }
}
