import { create, deleteRecord, read, readAll, update, readJoin } from "../config/database.js";

const criarItemVenda = async (itemVendaData) => {
    try {
        return await create ('itemVenda', itemVendaData);
    }catch (error) {
        console.error('Erro ao criar item: ', errr);
        throw error;
    }
};

const listarItemVenda = async ()=>{
    try{
        return await readAll ('itemVenda');
    }catch (error){
        console.error('Erro ao listar item: ', error);
        throw error;
    }
};

const obterItemVendaPorID = async (id) => {
    try{
        return await read ('itemVenda', `id = ${id}`);

    }catch (error) {
        console.error('Erro ao obter item por id: ', error);
        throw error;
    }
};

const atualizarItemVenda = async (id, itemVendaData) => {
    try{
        return await update ('itemVenda', itemVendaData, `id = ${id}`);
    }catch (error) {
        console.error('Error ao atualizar: ', error);
        throw error;
    }
};

const deletarItemVenda = async (id) => {
    try{
        return await deleteRecord ('itemVenda', `id = ${id}`);
    }catch (error) {
        console.error('Erro ao deletar: ', error);
        throw error;
    }
};

const obterTopCategorias = async () => {
    const query = `
        SELECT c.nome AS categoria, SUM(iv.quantidade) AS total
        FROM itemVenda iv
        JOIN produto p ON p.id = iv.produto_id
        JOIN categoria c ON c.id = p.categoria_id
        GROUP BY c.nome
        ORDER BY total DESC
        LIMIT 3;
    `;
    return await readJoin(query);
};

export{criarItemVenda, atualizarItemVenda, listarItemVenda, deletarItemVenda, obterItemVendaPorID, obterTopCategorias};