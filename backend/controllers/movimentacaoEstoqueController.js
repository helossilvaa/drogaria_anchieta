import { criarMovimentacao, listarMovimentacoes,listarMovimentacoesPorProduto, obterMovimentacaoPorId, atualizarMovimentacao, deletarMovimentacao } from "../models/movimentacaoEstoque.js";

const criarMovimentacaoController = async (req, res) => {
    try {
        const { id, produto_id, lote_id, unidade_id, tipo_movimento, quantidade, data_movimentacao, usuario_id } = req.body;
        const movimentacaoData = { id, produto_id, lote_id, unidade_id, tipo_movimento, quantidade, data_movimentacao, usuario_id };
        await criarMovimentacao(movimentacaoData);
        res.status(201).json({ mensagem: 'nova movimentacao criada com sucesso!' });

    } catch (error) {
        console.error('Erro ao criar movimentacao: ', error);
        res.status(500).json({ mensagem: 'Erro ao criar produto' });
    }
};

const listarMovimentacoesController = async (req, res) => {
    try {
        const produtos = await listarMovimentacoes();
        res.status(200).json(produtos);
    } catch (error) {
        console.error('Erro ao listar movimentacoes do estoque: ', error);
        res.status(500).json({ mensagem: 'Erro ao listar movimentacoes do estoque' });
    }
};

const listarMovimentacoesPorProdutoController = async (req, res) => {
    try {
        const { id } = req.params;
        const movs = await listarMovimentacoesPorProduto(id);
        res.status(200).json(movs);
    } catch {
        res.status(500).json({ mensagem: "Erro ao listar movimentações por produto" });
    }
};


const obterMovimentacaoPorIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const movimentacao = await obterMovimentacaoPorId(id);

        if (!movimentacao) {
            return res.status(404).json({ mensagem: 'Esta movimentacao de estoque não foi encontrada' });
        }
        res.status(200).json(produto);
    } catch (error) {
        console.error('Erro ao obter esta movimentacao de estoque: ', error);
        res.status(500).json({ mensagem: 'Erro ao obter movimentacao!!!' });
    }
};

const atualizarMovimentacaoController = async (req, res) => {
    try {
        const { id } = req.params;
        const { produto_id, lote_id, unidade_id, tipo_movimento, quantidade, data_movimentacao, usuario_id } = req.body;
        const movimentacaoExistente = await obterMovimentacaoPorId(id);

        if (!movimentacaoExistente) {
            return res.status(404).json({ mensagem: 'Esta movimentacao não foi encontrada no sistema!!!' });
        }

        const movimentacaoData = { produto_id, lote_id, unidade_id, tipo_movimento, quantidade, data_movimentacao, usuario_id };
        await atualizarMovimentacao(id, movimentacaoData);
        res.status(200).json({ mensagem: 'Esta movimentacao de estoque foi atualizada com sucesso!!!' });

    } catch (error) {
        console.error('Erro ao atualizar movimentacao: ', error);
        res.status(500).json({ mensagem: 'Erro ao atualizar movimentacao!!!' });
    }
};

const deletarMovimentacaoController = async (req, res) => {
    try {
        const { id } = req.params;
        const movimentacao = await obterMovimentacaoPorId(id);

        if (!movimentacao) {
            return res.status(404).json({ mensagem: 'Movimentacao de estoque não encontrada no sistema' });
        }
        await deletarMovimentacao(id);
        res.status(200).json({ mensagem: 'Movimentacao de estoque deletada com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar movimentacao de estoque: ', error);
        res.status(500).json({ mensagem: 'Erro ao deletar movimetacao de estoque' });
    }
};


export { criarMovimentacaoController, listarMovimentacoesController, listarMovimentacoesPorProdutoController, obterMovimentacaoPorIdController, atualizarMovimentacaoController, deletarMovimentacaoController }