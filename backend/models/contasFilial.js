import { query, create, update, deleteRecord } from "../config/database.js";

export const Conta = {

  getAllByUnidade: async (unidadeId) => {
    const sql = `
      SELECT 
        c.id,
        c.nomeConta,
        c.categoria,
        c.valor,
        c.dataVencimento,
        c.dataPostada,
        c.conta_pdf,
        c.unidade_id,
        COALESCE(pc.status_pagamento, c.status) AS status_pagamento,
        pc.data_pagamento
      FROM contas c
      LEFT JOIN (
        SELECT 
          conta_id,
          status_pagamento,
          data_pagamento
        FROM pagamentos_contas
        ORDER BY data_pagamento DESC
      ) pc ON c.id = pc.conta_id
      WHERE c.unidade_id = ?
      ORDER BY 
        CASE 
          WHEN COALESCE(pc.status_pagamento, c.status) = 'pendente' THEN 0 ELSE 1
        END,
        c.dataVencimento ASC;
    `;
    return await query(sql, [unidadeId]);
  },

  create: async (data) => {
    return await create("contas", data);
  },

  update: async (id, data) => {
    return await update("contas", data, `id = ${id}`);
  },

  delete: async (id) => {
    return await deleteRecord("contas", `id = ${id}`);
  },
};
