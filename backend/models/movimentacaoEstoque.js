import { create, readAll, read, update, deleteRecord } from "../config/database.js";



const criarMovimentacao = async (movimentacaoData) => {
    try {
        return await create("movimentacoes_estoque", movimentacaoData);
    } catch (error) {
        console.error("Erro ao criar movimentação:", error);
        throw error;
    }
};

const listarMovimentacoes = async () => {
    try {
        return await readAll("movimentacoes_estoque");
    } catch (error) {
        console.error("Erro ao listar movimentações:", error);
        throw error;
    }
};

const listarMovimentacoesPorProduto = async (produtoId) => {
    try {
        return await readAll("movimentacoes_estoque", `produto_id = ${produtoId}`);
    } catch (error) {
        console.error("Erro ao listar movimentações por produto:", error);
        throw error;
    }
};

const obterMovimentacaoPorId = async (id) => {
    try {
        return await read("movimentacoes_estoque", `id = ${id}`);
    } catch (error) {
        console.error("Erro ao obter movimentação:", error);
        throw error;
    }
};

const atualizarMovimentacao = async (id, movimentacaoData) => {
    try {
        return await update("movimentacoes_estoque", movimentacaoData, `id = ${id}`);
    } catch (error) {
        console.error("Erro ao atualizar movimentação:", error);
        throw error;
    }
};

const deletarMovimentacao = async (id) => {
    try {
        return await deleteRecord("movimentacoes_estoque", `id = ${id}`);
    } catch (error) {
        console.error("Erro ao deletar movimentação:", error);
        throw error;
    }
};

export {
    criarMovimentacao,
    listarMovimentacoes,
    listarMovimentacoesPorProduto,
    obterMovimentacaoPorId,
    atualizarMovimentacao,
    deletarMovimentacao
};
