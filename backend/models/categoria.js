import { create, deleteRecord, read, readAll, update } from "../config/database.js";

export const criarCategoria = async (categoriaData) => {
    try {
        return await create('categorias', categoriaData);
    } catch (error) {
        console.error('Erro ao criar categoria:', error);
        throw error;
    }
};

export const listarCategoria = async () => {
    try {
        return await readAll('categorias');
    } catch (error) {
        console.error('Erro ao listar categorias:', error);
        throw error;
    }
};

export const obterCategoriaPorID = async (id) => {
    try {
        return await read('categorias', `id = ${id}`);
    } catch (error) {
        console.error('Erro ao obter categoria:', error);
        throw error;
    }
};

export const atualizarCategoria = async (id, categoriaData) => {
    try {
        return await update('categorias', categoriaData, `id = ${id}`);
    } catch (error) {
        console.error('Erro ao atualizar categoria:', error);
        throw error;
    }
};

export const deletarCategoria = async (id) => {
    try {
        return await deleteRecord('categorias', `id = ${id}`);
    } catch (error) {
        console.error('Erro ao deletar categoria:', error);
        throw error;
    }
};