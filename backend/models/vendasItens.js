import { create, deleteRecord, read, readAll, update, readJoin } from "../config/database.js";

const criarItemVenda = async (itemVendaData) => {
    try {
         console.log(" Criando item de venda — tabela utilizada:", "itens_venda");
        console.log(" Dados enviados:", itemVendaData);
        return await create('itens_venda', itemVendaData);
    } catch (error) {
        console.error('Erro ao criar item: ', error);
        throw error;
    }
};

const listarItemVenda = async () => {
    try {
        return await readAll('itens_venda');
    } catch (error) {
        console.error('Erro ao listar item: ', error);
        throw error;
    }
};

const obterItemVendaPorID = async (id) => {
    try {
        return await read('itens_venda', `id = ${id}`);
    } catch (error) {
        console.error('Erro ao obter item por id: ', error);
        throw error;
    }
};

const atualizarItemVenda = async (id, itemVendaData) => {
    try {
        return await update('itens_venda', itemVendaData, `id = ${id}`);
    } catch (error) {
        console.error('Erro ao atualizar: ', error);
        throw error;
    }
};

const deletarItemVenda = async (id) => {
    try {
        return await deleteRecord('itens_venda', `id = ${id}`);
    } catch (error) {
        console.error('Erro ao deletar: ', error);
        throw error;
    }
};

const obterTopCategorias = async () => {
    const query = `
        SELECT c.categoria AS categoria, SUM(iv.quantidade) AS total
        FROM itens_venda iv
        JOIN produtos p ON p.id = iv.produto_id
        JOIN categorias c ON c.id = p.categoria_id
        GROUP BY c.categoria
        ORDER BY total DESC
        LIMIT 3;
    `;
    return await readJoin(query);
};

export { criarItemVenda, atualizarItemVenda, listarItemVenda, deletarItemVenda, obterItemVendaPorID, obterTopCategorias };