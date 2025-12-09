import { query } from "../config/database.js";
import { transferirLucroParaMatriz } from "../models/transacoesFilial.js";

// Função para pegar todas as filiais
export async function getTodasFiliais() {
  const sql = `SELECT id AS unidade_id FROM unidade`; 
  return query(sql);
}

// Função que fecha o mês de todas as filiais
export async function fecharMesDasFiliais() {
  try {
    const filiais = await getTodasFiliais();

    for (const filial of filiais) {
      const lucro = await transferirLucroParaMatriz(filial.unidade_id);
      console.log(`Lucro da filial ${filial.unidade_id} transferido:`, lucro);
    }

    console.log("Fechamento de mês concluído com sucesso!");
  } catch (err) {
    console.error("Erro ao fechar mês:", err);
  }
}
 