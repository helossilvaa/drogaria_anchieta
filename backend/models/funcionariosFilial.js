import { query } from "../config/database.js";

export const FuncionariosFilial = {
    listarPorUnidade: async (unidadeId) => {
        const sql =
            `
      SELECT f.id, f.nome, f.cpf, f.telefone, f.unidade_id, d.departamento AS departamento
      FROM funcionarios f
      LEFT JOIN departamento d ON f.departamento_id = d.id
      WHERE f.unidade_id = ?
    `
            ;
        try {
            return await query(sql, [unidadeId]);
        } catch (err) {
            console.error("Erro ao listar funcionários da filial:", err);
            throw err;
        }
    },
};

export { FuncionariosFilial };