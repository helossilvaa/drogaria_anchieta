import { create, deleteRecord, read, readAll, update, query } from "../config/database.js";

const criarCategoria = async (categoriaData) => {
    try {
        return await create('categorias', categoriaData);
    } catch (error) {
        console.error('Erro ao criar categoria:', error);
        throw error;
    }
};

const listarCategoria = async () => {
    try {
        return await readAll('categorias');
    } catch (error) {
        console.error('Erro ao listar categorias:', error);
        throw error;
    }
};

const obterCategoriaPorID = async (id) => {
    try {
        return await read('categorias', `id = ${id}`);
    } catch (error) {
        console.error('Erro ao obter categoria:', error);
        throw error;
    }
};

const atualizarCategoria = async (id, categoriaData) => {
    try {
        return await update('categorias', categoriaData, `id = ${id}`);
    } catch (error) {
        console.error('Erro ao atualizar categoria:', error);
        throw error;
    }
}

const deletarCategoria = async (id) => {
    try {
        return await deleteRecord('categorias', `id = ${id}`);
    } catch (error) {
        console.error('Erro ao deletar categoria:', error);
        throw error;
    }
};


const categoriasMaisVendidas = async () => {
  try {
    const sql = `
      SELECT 
        c.id AS categoria_id,
        c.categoria AS name,
        SUM(iv.quantidade) AS value
      FROM itens_venda iv
      JOIN produtos p ON iv.produto_id = p.id
      JOIN categorias c ON p.categoria_id = c.id
      JOIN vendas v ON iv.venda_id = v.id
      GROUP BY c.id, c.categoria
      ORDER BY value DESC
      LIMIT 5;
    `;

    const resultado = await query(sql); 

    return resultado.map(item => ({
      name: item.name,
      value: Number(item.value),
      categoria_id: item.categoria_id
    }));
  } catch (error) {
    console.error('Erro ao buscar categorias mais vendidas:', error);
    throw error;
  }
};



export {
    criarCategoria,
    deletarCategoria,
    atualizarCategoria,
    obterCategoriaPorID,
    listarCategoria,
    categoriasMaisVendidas
}