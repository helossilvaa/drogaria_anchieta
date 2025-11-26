import {
    criarLoteMatriz,
    listarLotesMatriz,
    obterLoteMatrizPorId,
    atualizarLoteMatriz,
    deletarLoteMatriz
} from "../models/lotesMatriz.js";

const criarLoteMatrizController = async (req, res) => {
    try {
        const { id, numero_lote, data_validade, quantidade, data_entrada, fornecedor_id } = req.body;

        const loteData = {
            id,
            numero_lote,
            data_validade,
            quantidade,
            data_entrada,
            fornecedor_id
        };

        await criarLoteMatriz(loteData);
        res.status(201).json({ mensagem: "Lote criado com sucesso!" });

    } catch (error) {
        console.error("Erro ao criar lote:", error);
        res.status(500).json({ mensagem: "Erro ao criar lote" });
    }
};

const listarLotesMatrizController = async (req, res) => {
    try {
        const lotes = await listarLotesMatriz();
        res.status(200).json(lotes);
    } catch (error) {
        console.error("Erro ao listar lotes:", error);
        res.status(500).json({ mensagem: "Erro ao listar lotes" });
    }
};

const obterLoteMatrizPorIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const lote = await obterLoteMatrizPorId(id);

        if (!lote) {
            return res.status(404).json({ mensagem: "Lote não encontrado" });
        }

        res.status(200).json(lote);

    } catch (error) {
        console.error("Erro ao obter lote:", error);
        res.status(500).json({ mensagem: "Erro ao obter lote" });
    }
};

const atualizarLoteMatrizController = async (req, res) => {
    try {
        const { id } = req.params;
        const { numero_lote, data_validade, quantidade, data_entrada, fornecedor_id } = req.body;

        const loteExistente = await obterLoteMatrizPorId(id);

        if (!loteExistente) {
            return res.status(404).json({ mensagem: "Lote não encontrado" });
        }

        const loteData = {
            numero_lote,
            data_validade,
            quantidade,
            data_entrada,
            fornecedor_id
        };

        await atualizarLoteMatriz(id, loteData);
        res.status(200).json({ mensagem: "Lote atualizado com sucesso!" });

    } catch (error) {
        console.error("Erro ao atualizar lote:", error);
        res.status(500).json({ mensagem: "Erro ao atualizar lote" });
    }
};

const deletarLoteMatrizController = async (req, res) => {
    try {
        const { id } = req.params;

        const lote = await obterLoteMatrizPorId(id);
        if (!lote) {
            return res.status(404).json({ mensagem: "Lote não encontrado" });
        }

        await deletarLoteMatriz(id);
        res.status(200).json({ mensagem: "Lote deletado com sucesso!" });

    } catch (error) {
        console.error("Erro ao deletar lote:", error);
        res.status(500).json({ mensagem: "Erro ao deletar lote" });
    }
};

export {
    criarLoteMatrizController,
    listarLotesMatrizController,
    obterLoteMatrizPorIdController,
    atualizarLoteMatrizController,
    deletarLoteMatrizController
};
