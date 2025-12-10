import { query } from "../config/database.js";

export async function getDashboardFinanceiro(req, res) {
  try {
    // Filial com mais entradas
    const [maisEntrou] = await query(`
      SELECT unidade_id, SUM(entradas) AS total_entradas
      FROM transacoes_matriz
      GROUP BY unidade_id
      ORDER BY total_entradas DESC
      LIMIT 1;
    `);

    // Filial com mais saídas
    const [maisSaiu] = await query(`
      SELECT unidade_id, SUM(saidas) AS total_saidas
      FROM transacoes_matriz
      GROUP BY unidade_id
      ORDER BY total_saidas DESC
      LIMIT 1;
    `);

    // Total de lucro líquido
    const [lucroTotal] = await query(`
      SELECT SUM(lucro_liquido) AS total_lucro
      FROM transacoes_matriz;
    `);

    // Total de gastos
    const [gastosTotais] = await query(`
      SELECT SUM(saidas) AS total_gastos
      FROM transacoes_matriz;
    `);

    // Contar qual ação ocorreu mais (entrada ou saída)
    const [acaoMaisFrequenteEntrada] = await query(`
      SELECT COUNT(*) AS total
      FROM transacoes_matriz
      WHERE entradas > 0;
    `);

    const [acaoMaisFrequenteSaida] = await query(`
      SELECT COUNT(*) AS total
      FROM transacoes_matriz
      WHERE saidas > 0;
    `);

    const acaoMaisFrequente =
      (acaoMaisFrequenteEntrada?.total || 0) >= (acaoMaisFrequenteSaida?.total || 0)
        ? "entrada"
        : "saida";

    return res.json({
      maiorEntrada: maisEntrou || null,
      maiorSaida: maisSaiu || null,
      lucroTotal: lucroTotal?.total_lucro || 0,
      gastosTotal: gastosTotais?.total_gastos || 0,
      acaoMaisFrequente // <- adiciona no JSON
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar dados do dashboard financeiro." });
  }
}



export async function getGraficoMensal(req, res) {
  try {
    const anoAtual = new Date().getFullYear();

    const sql = `
      SELECT 
        mes,
        SUM(entradas) AS entradas,
        SUM(saidas) AS saidas
      FROM transacoes_matriz
      WHERE ano = ?
      GROUP BY mes
      ORDER BY mes;
    `;

    const resultado = await query(sql, [anoAtual]);

    const meses = [
      "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
      "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"
    ];

    const dadosFormatados = meses.map((mesNome, index) => {
      const data = resultado.find(r => r.mes === index + 1);

      return {
        mes: mesNome,
        entradas: Number(data?.entradas || 0),
        saidas: Number(data?.saidas || 0)
      };
    });

    res.json(dadosFormatados);

  } catch (error) {
    console.error("Erro ao buscar gráfico mensal:", error);
    res.status(500).json({ error: "Erro ao buscar dados do gráfico mensal." });
  }
}


export async function getUltimasTransacoes(req, res) {
  try {
    const limit = Number(req.query.limit) || 5;

    const sql = `
      SELECT 
        t.id,
        t.tipo_movimento,
        t.entradas,
        t.saidas,
        t.data_transferencia,
        c.categoria_transacao AS categoria_nome
      FROM transacoes_matriz t
      LEFT JOIN categoria_transacoes c ON t.categoria_transacao_id = c.id
      ORDER BY t.data_transferencia DESC
      LIMIT ?;
    `;

    const transacoes = await query(sql, [limit]);

    return res.json(transacoes);
  } catch (error) {
    console.error("Erro ao buscar últimas transações:", error);
    return res.status(500).json({ error: "Erro ao buscar últimas transações." });
  }
}

