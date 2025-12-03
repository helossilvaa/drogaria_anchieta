import { query } from "../config/database.js";

export async function registrarPagamentoMensal() {
  const hoje = new Date();
  const dia = hoje.getDate();

  // Só executa no dia 5
  if (dia !== 5) return;

  // Pega todos os salários que vencem hoje
  const salarios = await query(`
    SELECT * FROM salarios
    WHERE DAY(data_atualizado) = 5
  `);

  for (const s of salarios) {
    // Registra histórico
    await query(
      `INSERT INTO pagamentos_salarios 
      (id_salario, id_funcionario, unidade_id, departamento_id, valor, status_pagamento, data_pagamento)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        s.id,
        s.id_funcionario,
        s.unidade_id,
        s.departamento_id,
        s.valor,
        s.status_pagamento,
        hoje,
      ]
    );

    // Atualiza salário para o próximo dia 5
    const proximoDia = new Date(
      hoje.getFullYear(),
      hoje.getMonth() + 1,
      5
    );

    await query(
      "UPDATE salarios SET data_atualizado = ? WHERE id = ?",
      [proximoDia, s.id]
    );
  }
}
