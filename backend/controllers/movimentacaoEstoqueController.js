import {
    criarMovimentacao,
    listarMovimentacoes,
    listarMovimentacoesPorProduto,
    obterMovimentacaoPorId,
    atualizarMovimentacao,
    deletarMovimentacao
} from "../models/movimentacaoEstoque.js";

import { Notificacao } from "../models/notificacoes.js";
import { read } from "../config/database.js";

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

const listarSolicitacoesPendentesController = async (req, res) => {
  try {
    const solicitacoes = await listarMovimentacoes(`tipo_movimento = 'solicitacao'`);
    return res.status(200).json(solicitacoes);
  } catch (error) {
    console.error("Erro ao listar solicitações:", error);
    res.status(500).json({ mensagem: "Erro ao listar solicitações pendentes" });
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
        if (!req.user) {
            return res.status(401).json({ mensagem: "Usuário não autenticado." });
        }

        const usuarioId = req.user.id;
        const filialId = req.user.unidade_id;
        const { produto_id, quantidade } = req.body;

        if (!produto_id || !quantidade || isNaN(quantidade) || Number(quantidade) <= 0) {
            return res.status(400).json({ mensagem: "Dados incompletos ou inválidos!" });
        }

        const qty = Number(quantidade);

        let produto = await read("produtos", `id = ${produto_id}`);
        produto = Array.isArray(produto) ? produto[0] : produto;

        if (!produto) {
            return res.status(404).json({ mensagem: "Produto não encontrado!" });
        }

        const produto_nome = produto.nome || "Produto desconhecido";

        // Criar movimentação
        const movimentacaoData = {
            produto_id,
            lote_id: null,
            unidade_id: filialId,
            tipo_movimento: "solicitacao",
            quantidade: qty,
            data_movimentacao: new Date(),
            usuario_id: usuarioId,
        };
        await criarMovimentacao(movimentacaoData);

        // Notificação para a filial
        try {
            await Notificacao.create({
                usuario_id: usuarioId,
                unidade_id: filialId,
                titulo: "Solicitação enviada",
                mensagem: `Seu pedido de ${qty} unidades de ${produto_nome} foi enviado à matriz.`,
                tipo_id: 3,
                lida: 0,
                criada_em: new Date()
            });
        } catch (notifErr) {
            console.warn("Falha ao criar notificação para a filial:", notifErr);
        }

        // Notificação para todos os gestores da matriz
        try {
            const gestores = await read("usuarios", "unidade_id = 1 AND departamento LIKE '%gestor%'");
            for (const g of gestores) {
                await Notificacao.create({
                    usuario_id: g.id,
                    unidade_id: 1,
                    titulo: "Nova solicitação de reposição",
                    mensagem: `A filial ${filialId} solicitou ${qty} unidades de ${produto_nome}.`,
                    tipo_id: 2,
                    lida: 0,
                    criada_em: new Date(),
                    extra_info: JSON.stringify({ produto_id, quantidade: qty, filialId }),
                    acao_texto: "Ver detalhes"
                });
            }
        } catch (notifErr) {
            console.warn("Falha ao criar notificação para a matriz:", notifErr);
        }

        return res.status(201).json({ mensagem: "Solicitação enviada para a matriz!" });

    } catch (error) {
        console.error("Erro ao registrar solicitação:", error);
        return res.status(500).json({
            mensagem: "Erro interno ao solicitar reposição",
            detalhe: error.message
        });
    }
};



export {
    criarMovimentacaoController,
    listarMovimentacoesController,
    listarMovimentacoesPorProdutoController,
    listarSolicitacoesPendentesController,
    obterMovimentacaoPorIdController,
    atualizarMovimentacaoController,
    deletarMovimentacaoController,
    solicitarReposicaoController,
};
