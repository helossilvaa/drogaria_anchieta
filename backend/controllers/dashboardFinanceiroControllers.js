import { query } from "../config/database.js";

export async function getDashboardFinanceiro(req, res) {
  try {
    const [maisEntrou] = await query(`
      SELECT unidade_id, SUM(entradas) AS total_entradas
      FROM transacoes_matriz
      GROUP BY unidade_id
      ORDER BY total_entradas DESC
      LIMIT 1;
    `);

    const [maisSaiu] = await query(`
      SELECT unidade_id, SUM(saidas) AS total_saidas
      FROM transacoes_matriz
      GROUP BY unidade_id
      ORDER BY total_saidas DESC
      LIMIT 1;
    `);

    const [lucroTotal] = await query(`
      SELECT SUM(lucro_liquido) AS total_lucro
      FROM transacoes_matriz;
    `);

    return res.json({
      maiorEntrada: maisEntrou || null,
      maiorSaida: maisSaiu || null,
      lucroTotal: lucroTotal?.total_lucro || 0
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar dados do dashboard financeiro." });
  }
}
