import { create, query, read } from "../config/database.js";

// Criar relatório
export async function criarRelatorio({ nome, tipoRelatorio_id, arquivo }) {
  // Converte o arquivo em Base64 antes de salvar
  const arquivoBase64 = arquivo ? arquivo.toString("base64") : null;

  return await create("relatorios", {
    nome,
    tipoRelatorio_id,
    relatorio: arquivoBase64,
    // criado_em será definido automaticamente no banco se a coluna tiver DEFAULT CURRENT_TIMESTAMP
  });
}

// Listar relatórios
export async function listarRelatorios() {
  return await query(`
    SELECT id, nome, tipoRelatorio_id, criado_em
    FROM relatorios
    ORDER BY id DESC
  `);
}

export async function buscarRelatorioPorId(id) {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) throw new Error("ID inválido");
  
    const relatorio = await read("relatorios", `id = ${idNum}`);
    return relatorio;
  }
  
