import { create, readAll, read, update, deleteRecord } from "../config/database.js";

const criarMovimentacao = async (movimentacaoData) => {
    try {
        return await create('movimentacoes_estoque', movimentacaoData)
    } catch (error) {
        console.error('Erro ao criar uma nova movimentacao: ', error);
        throw error;
    }
};

const listarMovimentacoes = async () => {
    try {
        return await readAll('movimentacoes_estoque');
    } catch (error) {
        console.error('Erro ao listar produtos: ', error)
    }
};
const obterMovimentacaoPorId = async (id) => {
    try {
        return await read('movimentacoes_estoque', `id = ${id}`)
    } catch (error) {
        console.error('Erro ao obter produto por id: ', error);
        throw error;
    }
};

const atualizarMovimentacao = async (id, movimentacaoData) => {
    try {
        return await update('movimentacoes_estoque', `id = ${id}`, movimentacaoData)
    } catch (error) {
        console.error('Erro ao atualizar esta movimentacao de estoque: ', error)
    }
};

const deletarMovimentacao = async (id) => {
    try {
        return await deleteRecord('movimentacoes_estoque', `id = ${id}`);
    } catch (error) {
        console.error('Erro ao deletar esta movimentacao de estoque: ', error);
        throw error;
    }
}

export { criarMovimentacao, listarMovimentacoes, obterMovimentacaoPorId, atualizarMovimentacao, deletarMovimentacao };