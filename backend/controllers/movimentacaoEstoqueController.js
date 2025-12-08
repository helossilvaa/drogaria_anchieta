import {
    criarMovimentacao,
    listarMovimentacoes,
    listarMovimentacoesPorProduto,
    obterMovimentacaoPorId,
    atualizarMovimentacao,
    deletarMovimentacao
} from "../models/movimentacaoEstoque.js";

const criarMovimentacaoController = async (req, res) => {
    try {
        const { produto_id, lote_id, unidade_id, tipo_movimento, quantidade, data_movimentacao, usuario_id } = req.body;

        const movimentacaoData = {
            produto_id,
            lote_id,
            unidade_id,
            tipo_movimento,
            quantidade,
            data_movimentacao,
            usuario_id
        };

        await criarMovimentacao(movimentacaoData);

        res.status(201).json({ mensagem: 'Movimentação criada com sucesso!' });

    } catch (error) {
        console.error('Erro ao criar movimentação: ', error);
        res.status(500).json({ mensagem: 'Erro ao criar movimentação' });
    }
};

const listarMovimentacoesController = async (req, res) => {
    try {
        const movs = await listarMovimentacoes();
        res.status(200).json(movs);
    } catch (error) {
        console.error('Erro ao listar movimentações: ', error);
        res.status(500).json({ mensagem: 'Erro ao listar movimentações' });
    }
};

const listarMovimentacoesPorProdutoController = async (req, res) => {
    try {
        const { id } = req.params;
        const movs = await listarMovimentacoesPorProduto(id);
        res.status(200).json(movs);
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao listar movimentações por produto" });
    }
};

const obterMovimentacaoPorIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const movimentacao = await obterMovimentacaoPorId(id);

        if (!movimentacao) {
            return res.status(404).json({ mensagem: 'Movimentação não encontrada' });
        }

        res.status(200).json(movimentacao);

    } catch (error) {
        console.error('Erro ao obter movimentação: ', error);
        res.status(500).json({ mensagem: 'Erro ao obter movimentação' });
    }
};

const atualizarMovimentacaoController = async (req, res) => {
    try {
        const { id } = req.params;

        const movimentacaoExistente = await obterMovimentacaoPorId(id);

        if (!movimentacaoExistente) {
            return res.status(404).json({ mensagem: 'Movimentação não encontrada!' });
        }

        const { produto_id, lote_id, unidade_id, tipo_movimento, quantidade, data_movimentacao, usuario_id } = req.body;

        const movimentacaoData = {
            produto_id,
            lote_id,
            unidade_id,
            tipo_movimento,
            quantidade,
            data_movimentacao,
            usuario_id
        };

        await atualizarMovimentacao(id, movimentacaoData);

        res.status(200).json({ mensagem: 'Movimentação atualizada com sucesso!' });

    } catch (error) {
        console.error('Erro ao atualizar movimentação: ', error);
        res.status(500).json({ mensagem: 'Erro ao atualizar movimentação' });
    }
};

const deletarMovimentacaoController = async (req, res) => {
    try {
        const { id } = req.params;

        const movimentacao = await obterMovimentacaoPorId(id);

        if (!movimentacao) {
            return res.status(404).json({ mensagem: 'Movimentação não encontrada!' });
        }

        await deletarMovimentacao(id);

        res.status(200).json({ mensagem: 'Movimentação deletada com sucesso!' });

    } catch (error) {
        console.error('Erro ao deletar movimentação: ', error);
        res.status(500).json({ mensagem: 'Erro ao deletar movimentação' });
    }
};

const solicitarReposicaoController = async (req, res) => {
    try {
        const { produto_id, quantidade } = req.body;

        if (!produto_id || !quantidade) {
            return res.status(400).json({ mensagem: "Dados incompletos!" });
        }

        const movimentacaoData = {
            produto_id,
            lote_id: null,
            unidade_id: req.user.unidade_id,  
            tipo_movimento: "solicitacao",
            quantidade,
            data_movimentacao: new Date(),
            usuario_id: req.user.id,
            status_movimentacao: "pendente",
            origem: "solicitacao"
        };

        await criarMovimentacao(movimentacaoData);

        return res.status(201).json({
            mensagem: "Solicitação enviada para a matriz!"
        });

    } catch (error) {
        console.error("Erro ao registrar solicitação:", error);
        res.status(500).json({ mensagem: "Erro interno ao solicitar reposição" });
    }
};


export {
    criarMovimentacaoController,
    listarMovimentacoesController,
    listarMovimentacoesPorProdutoController,
    obterMovimentacaoPorIdController,
    atualizarMovimentacaoController,
    deletarMovimentacaoController,
    solicitarReposicaoController
};
