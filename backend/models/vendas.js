import { create, read, readAll, update } from "../config/database.js";

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

export { criarVenda, listarVenda, obterVendaPorID, atualizarVenda };