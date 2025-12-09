import { create, read, readAll, update, query } from "../config/database.js";
 
const criarVenda = async (vendaData) => {
    try {
        return await create("vendas", vendaData);
    } catch (error) {
        console.error("Erro ao criar venda:", error);
        throw error;
    }
};
 
const listarVenda = async () => {
    try {
        return await readAll("vendas");
    } catch (error) {
        console.error("Erro ao listar vendas:", error);
        throw error;
    }
};
 
const obterVendaPorID = async (id) => {
    try {
        return await read("vendas", `id = ${id}`);
    } catch (error) {
        console.error("Erro ao obter venda por ID:", error);
        throw error;
    }
};
 
const atualizarVenda = async (id, vendaData) => {
    try {
        return await update("vendas", vendaData, `id = ${id}`);
    } catch (error) {
        console.error("Erro ao atualizar venda:", error);
        throw error;
    }
};

const listarItensPorVenda = async (venda_id) => {
  const sql = `
    SELECT iv.*, p.nome, p.foto
    FROM itens_venda iv
    JOIN produtos p ON p.id = iv.produto_id
    WHERE iv.venda_id = ?
  `;

  return await query(sql, [venda_id]);
};
 
export { criarVenda, listarVenda, obterVendaPorID, atualizarVenda, listarItensPorVenda };