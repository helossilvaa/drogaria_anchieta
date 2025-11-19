import {
    listarCategoria,
    obterCategoriaPorID,
    atualizarCategoria,
    deletarCategoria,
    criarCategoria
} from "../models/categoria.js";

const criarCategoriaController = async (req, res) => {
    try {
        const { categoria } = req.body;
        if (!categoria || categoria.trim() === "") {
            return res.status(400).json({ mensagem: "O nome da categoria é obrigatório" });
        }
        const categoriaData = { categoria };
        await criarCategoria(categoriaData);
        res.status(201).json({ mensagem: 'Categoria criada com sucesso!' });
    } catch (error) {
        console.error('Erro ao criar categoria: ', error);
        res.status(500).json({ mensagem: 'Erro ao criar categoria' });
    }
};

const listarCategoriaController = async (req, res) => {
    try {
        const categoria = await listarCategoria();
        res.status(200).json(categoria);
    } catch (error) {
        console.error('Erro ao listar categoria: ', error);
        res.status(500).json({ mensagem: 'Erro ao listar categoria' });
    }
};

const obterCategoriaPorIDController = async (req, res) => {
    try {
        const { id } = req.params;
        const categoria = await obterCategoriaPorID(id);

        if (!categoria) {
            return res.status(404).json({ mensagem: 'Categoria não encontrada' });
        }

        res.status(200).json(categoria);
    } catch (error) {
        console.error('Erro ao onter categoria por ID: ', error);
        res.status(500).json({ mensagem: 'Erro ao obter categoria' });
    }
};

const deletarCategoriaController = async (req, res) => {
    try {
        const { id } = req.params;
        const categoria = await obterCategoriaPorID(id);

        if (!categoria) {
            return res.status(404).json({ mensagem: 'Categoria não encontrado' });
        }
        await deletarCategoria(id);
        res.status(200).json({ mensagem: 'Categoria deletada com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar item: ', error);
        res.status(500).json({ mensagem: 'Erro ao deletar categoria' });
    }
};

const atualizarCategoriaController = async (req, res) => {
    try {
        const { id } = req.params;
        const { categoria } = req.body;

        const categoriaExistir = await obterCategoriaPorID(id);
        if (!categoriaExistir) {
            return res.status(404).json({ mensagem: 'Categoria não encontrada' });
        }
        const categoriaData = { categoria };

        await atualizarCategoria(id, categoriaData);
        res.status(200).json({ mensagem: 'categoria atualizada' });
    } catch (error) {
        console.error('Erro ao atualizar: ', error);
        res.status(500).json({ mensagem: 'Erro ao atualizar' });
    }
};

export {
    criarCategoriaController,
    listarCategoriaController,
    obterCategoriaPorIDController,
    deletarCategoriaController,
    atualizarCategoriaController
};