import { create, readAll, read, update, deleteRecord } from "../config/database.js";


const obterProdutoPorCodigoBarras = async (codigo_barras) => {
    try {
        return await read('produtos', `codigo_barras = "${codigo_barras}"`);
    } catch (error) {
        console.error('Erro ao obter produto por código de barras: ', error);
        throw error;
    }
};


const criarProduto = async (produtoData) => {
    try {
        return await create('produtos', produtoData)
    } catch (error) {
        console.error('Erro ao criar produto: ', error);
        throw error;
    }
};

const listarProdutos = async () => {
    try {
        return await readAll('produtos');
    } catch (error) {
        console.error('Erro ao listar produtos: ', error);
        throw error;
    }
};
const obterProdutoPorId = async (id) => {
    try {
        return await read('produtos', `id = ${id}`)
    } catch (error) {
        console.error('Erro ao obter produto por id: ', error);
        throw error;
    }
};

const atualizarProduto = async (id, produtoData) => {
    try {
        return await update('produtos', produtoData, `id = ${id}`)
    } catch (error) {
        console.error('Erro ao atualizar produto: ', error)
        throw error;
    }
};

const deletarProduto = async (id) =>{
    try{
        return await deleteRecord ('produtos', `id = ${id}`);
    } catch (error){
        console.error('Erro ao deletar produto: ', error);
        throw error;
    }
}

export { criarProduto, listarProdutos, obterProdutoPorId, atualizarProduto, deletarProduto, obterProdutoPorCodigoBarras };