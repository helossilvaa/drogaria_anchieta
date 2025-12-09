import { criarEstoqueFranquia, listarEstoqueFranquia, obterEstoqueFranquiaPorId, atualizarEstoqueFranquia, deletarEstoqueFranquia, listarProdutosComBaixoEstoque } from "../models/estoqueFranquia.js";

const criarEstoqueFranquiaController = async (req, res) => {
    try {
        const { id, quantidade, produto_id, estoque_minimo, estoque_maximo, estoque_matriz_id } = req.body;
        const estoqueFranquiaData = { id, quantidade, produto_id, estoque_minimo, estoque_maximo, estoque_matriz_id };

        await criarEstoqueFranquia(estoqueFranquiaData);
        res.status(201).json({ mensagem: 'Estoque da franquia criado com sucesso!' });
    } catch (error) {
        console.error('Erro ao criar estoque da franquia: ', error);
        res.status(500).json({ mensagem: 'Erro ao criar estoque da franquia' });
    }
}

const listarEstoqueFranquiaController = async (req, res) => {
    try {
        const estoqueFranquia = await listarEstoqueFranquia();
        res.status(200).json(estoqueFranquia);
    } catch (error) {
        console.error('Erro ao listar estoque franquia: ', error);
        res.status(500).json({ mensagem: 'Erro ao listar estoque franquia' });
    }
};

const obterEstoqueFranquiaPorIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const estoqueFranquia = await obterEstoqueFranquiaPorId(id);

        if (!estoqueFranquia) {
            return res.status(404).json({ mensagem: 'Estoque da franquia não encontrado' });
        }

        res.status(200).json(estoqueFranquia);
    } catch (error) {
        console.error('Erro ao onter estoque da franquia por ID: ', error);
        res.status(500).json({ mensagem: 'Erro ao obter estoque da franquia' });
    }
};

const atualizarEstoqueFranquiaController = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantidade, produto_id, estoque_minimo, estoque_maximo, estoque_matriz_id } = req.body;

        const estoqueFranquiaExistente = await obterEstoqueFranquiaPorId(id);
        if (!estoqueFranquiaExistente) {
            return res.status(404).json({ mensagem: 'Estoque da franquia não encontrado' });
        }
        const estoqueFranquiaData = { id, quantidade, produto_id, estoque_minimo, estoque_maximo, estoque_matriz_id };

        await atualizarEstoqueFranquia(id, estoqueFranquiaData);
        res.status(200).json({ mensagem: 'estoque da franquia atualizada' });
    } catch (error) {
        console.error('Erro ao atualizar: ', error);
        res.status(500).json({ mensagem: 'Erro ao atualizar' });
    }
};

const deletarEstoqueFranquiaController = async (req, res) => {
    try {
        const { id } = req.params;
        const estoqueFranquia = await obterEstoqueFranquiaPorId(id);

        if (!estoqueFranquia) {
            return res.status(404).json({ mensagem: 'Estoque da franquia não encontrado' });
        }
        await deletarEstoqueFranquia(id);
        res.status(200).json({ mensagem: 'Estoque da franquia deletado com sucesso!!!' });
    } catch (error) {
        console.error('Erro ao deletar estoque da franquia: ', error);
        res.status(500).json({ mensagem: 'Erro ao deletar estoque da franquia' });
    }
};

const listarAlertasBaixaQuantidadeController = async (req, res) => {
    try {
        const produtos = await listarProdutosComBaixoEstoque(3);

        const alertas = Array.isArray(produtos) ? produtos : [];

        res.status(200).json(alertas);
    } catch (error) {
        console.error("Erro ao buscar alertas de estoque:", error);
        res.status(500).json({ mensagem: "Erro ao buscar alertas de estoque" });
    }
};

export { criarEstoqueFranquiaController, listarEstoqueFranquiaController, obterEstoqueFranquiaPorIdController, atualizarEstoqueFranquiaController, deletarEstoqueFranquiaController, listarAlertasBaixaQuantidadeController};