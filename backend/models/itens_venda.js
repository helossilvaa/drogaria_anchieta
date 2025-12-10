import { create, deleteRecord, read, readAll, update, readJoin } from "../config/database.js";

const TABELA = "itens_venda"; 

const criarItemVenda = async (itemVendaData) => {
    try {
        return await create(TABELA, itemVendaData);
    } catch (error) {
        console.error("Erro ao criar item:", error);
        throw error;
    }
};

const listarItemVenda = async () => {
    try {
        return await readAll(TABELA);
    } catch (error) {
        console.error("Erro ao listar itens:", error);
        throw error;
    }
};

const obterItemVendaPorID = async (id) => {
    try {
        return await read(TABELA, `id = ${id}`);
    } catch (error) {
        console.error("Erro ao obter item por ID:", error);
        throw error;
    }
};

const atualizarItemVenda = async (id, itemVendaData) => {
    try {
        return await update(TABELA, itemVendaData, `id = ${id}`);
    } catch (error) {
        console.error("Erro ao atualizar item:", error);
        throw error;
    }
};

const deletarItemVenda = async (id) => {
    try {
        return await deleteRecord(TABELA, `id = ${id}`);
    } catch (error) {
        console.error("Erro ao deletar item:", error);
        throw error;
    }
};

const obterTopCategorias = async () => {
    try {
        const query = `
            SELECT c.nome AS categoria, SUM(iv.quantidade) AS total
            FROM itens_venda iv
            JOIN produto p ON p.id = iv.produto_id
            JOIN categoria c ON c.id = p.categoria_id
            GROUP BY c.nome
            ORDER BY total DESC
            LIMIT 3;
        `;
        return await readJoin(query);
    } catch (error) {
        console.error("Erro ao obter top categorias:", error);
        throw error;
    }
};

export {
    criarItemVenda,
    atualizarItemVenda,
    listarItemVenda,
    deletarItemVenda,
    obterItemVendaPorID,
    obterTopCategorias
};
