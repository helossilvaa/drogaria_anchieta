import { query } from "../config/database.js";

//
// LISTAR VENDAS (SEM AGRUPAR)
//
export const listarVenda = async (unidade_id) => {
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
      WHERE v.unidade_id = ?
      ORDER BY v.data DESC
    `;
    
    return await query(sql, [unidade_id]);

  } catch (error) {
    console.error("Erro ao listar vendas:", error);
    throw error;
  }
};

export const atualizarTransacoesDeTodasVendas = async (unidade_id) => {
  try {
    //
    // 1️⃣ BUSCAR TODOS OS DIAS QUE TÊM VENDAS
    //
    const diasQuery = `
      SELECT DATE(data) AS dia
      FROM vendas
      WHERE unidade_id = ?
      GROUP BY DATE(data)
      ORDER BY DATE(data) DESC
    `;

    const dias = await query(diasQuery, [unidade_id]);

    //
    // 2️⃣ PARA CADA DIA → SOMAR AS VENDAS E CRIAR/ATUALIZAR A TRANSACAO
    //
    for (const item of dias) {
      const dia = item.dia;

      // Soma do dia
      const sqlTotal = `
        SELECT SUM(total) AS total_dia
        FROM vendas
        WHERE unidade_id = ?
        AND DATE(data) = ?
      `;
      const [result] = await query(sqlTotal, [unidade_id, dia]);
      const totalDia = result.total_dia || 0;

      // Verifica se já existe
      const sqlBusca = `
        SELECT id
        FROM transacoes
        WHERE unidade_id = ?
          AND DATE(data_lancamento) = ?
          AND descricao = 'Vendas do dia'
          AND origem = 'VENDAS'
          AND tipo_movimento = 'ENTRADA'
      `;
      const existe = await query(sqlBusca, [unidade_id, dia]);

      if (existe.length > 0) {
        // Atualiza
        await query(
          `UPDATE transacoes SET valor = ? WHERE id = ?`,
          [totalDia, existe[0].id]
        );
      } else {
        // Cria
        await query(
          `INSERT INTO transacoes
           (data_lancamento, tipo_movimento, valor, descricao, unidade_id, categoria_transacao_id, origem)
           VALUES (?, 'ENTRADA', ?, 'Vendas do dia', ?, 2, 'VENDAS')
          `,
          [dia, totalDia, unidade_id]
        );
      }
    }

    console.log("Transações diárias atualizadas com sucesso.");

  } catch (error) {
    console.error("Erro ao gerar transações diárias:", error);
  }
};
