import { create, deleteRecord, read, readAll, update, query } from "../config/database.js";

const criarEstoqueFranquia = async (estoqueFranquiaData) => {
    try {
        return await create('estoque_franquia', estoqueFranquiaData);
    } catch (error) {
        console.error('Erro ao criar estoque da franquia: ', error);
        throw error;
    }
};

const listarEstoqueFranquia = async () => {
    try {
        return await readAll('estoque_franquia');
    } catch (error) {
        console.error('Erro ao listar estoque da franquia: ', error);
        throw error;
    }
};

const obterEstoqueFranquiaPorId = async (id) => {
    try {
        return await read('estoque_franquia', `id = ${id}`);

    } catch (error) {
        console.error('Erro ao obter estoque da franquia por id: ', error);
        throw error;
    }
};

const atualizarEstoqueFranquia = async (id, estoqueFranquiaData) => {
    try {
        return await update('estoque_franquia', estoqueFranquiaData, `id = ${id}`);
    } catch (error) {
        console.error('Error ao atualizar estoque da franquia: ', error);
        throw error;
    }
};

const deletarEstoqueFranquia = async (id) => {
    try {
        return await deleteRecord('estoque_franquia', `id = ${id}`);
    } catch (error) {
        console.error('Erro ao deletar estoque da franquia: ', error);
        throw error;
    }
};

const listarProdutosComBaixoEstoque = async (limite = 3) => {
    try {
        const sql = `
            SELECT ef.produto_id, p.nome AS produto_nome, ef.quantidade, ef.estoque_minimo
            FROM estoque_franquia ef
            JOIN produtos p ON ef.produto_id = p.id
            ORDER BY ef.quantidade ASC
            LIMIT ?
        `;
        const resultados = await query(sql, [limite]);
        return resultados;
    } catch (error) {
        console.error('Erro ao listar produtos com baixo estoque:', error);
        throw error;
    }
};

export { criarEstoqueFranquia, listarEstoqueFranquia, obterEstoqueFranquiaPorId, atualizarEstoqueFranquia, deletarEstoqueFranquia, listarProdutosComBaixoEstoque };