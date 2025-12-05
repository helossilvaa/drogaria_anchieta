import {
    criarProduto,
    listarProdutos,
    obterProdutoPorId,
    atualizarProduto,
    deletarProduto,
    obterProdutoPorCodigoBarras
} from "../models/produtos.js";

const obterProdutoPorCodigoBarrasController = async (req, res) => {
    try {
        const { codigo_barras } = req.params;

        const produto = await obterProdutoPorCodigoBarras(codigo_barras);

        if (!produto) {
            return res.status(404).json({ mensagem: "Produto não encontrado pelo código de barras!" });
        }

        res.status(200).json(produto);
    } catch (error) {
        console.error("Erro ao buscar por código de barras:", error);
        res.status(500).json({ mensagem: "Erro ao buscar produto por código de barras!" });
    }
};

const criarProdutoController = async (req, res) => {
    try {
        const { id, registro_anvisa, nome, foto, medida_id, tarja_id, categoria_id, marca_id, codigo_barras, descricao, preco_unitario, validade, fornecedor_id, lote_id, armazenamento } = req.body;
        const produtoData = { id, registro_anvisa, nome, foto, medida_id, tarja_id, categoria_id, marca_id, codigo_barras, descricao, preco_unitario, validade, fornecedor_id, lote_id, armazenamento };
        await criarProduto(produtoData);
        res.status(201).json({ mensagem: 'Produto criado com sucesso!' });

    } catch (error) {
        console.error('Erro ao criar produto: ', error);
        res.status(500).json({ mensagem: 'Erro ao criar produto' });
    }
};

const listarProdutosController = async (req, res) => {
    try {
        const produtos = await listarProdutos();
        res.status(200).json(produtos);
    } catch (error) {
        console.error('Erro ao listar produtos: ', error);
        res.status(500).json({ mensagem: 'Erro ao listar produtos' });
    }
};

const obterProdutoPorIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const produto = await obterProdutoPorId(id);

        if (!produto) {
            return res.status(404).json({ mensagem: 'Produto não encontrado' });
        }
        res.status(200).json(produto);
    } catch (error) {
        console.error('Erro ao obter equipamento por patrimônio: ', error);
        res.status(500).json({ mensagem: 'Erro ao obter produto!!!' });
    }
};

const atualizarProdutoController = async (req, res) => {
    try {
        const { id } = req.params;
        const { registro_anvisa, nome, foto, medida_id, tarja_id, categoria_id, marca_id, codigo_barras, descricao, preco_unitario, validade, fornecedor_id, lote_id, armazenamento } = req.body;
        const produtoExistente = await obterProdutoPorId(id);

        if (!produtoExistente) {
            return res.status(404).json({ mensagem: 'Produto não encontrado!!!' });
        }

        const produtoData = { registro_anvisa, nome, foto, medida_id, tarja_id, categoria_id, marca_id, codigo_barras, descricao, preco_unitario, validade, fornecedor_id, lote_id, armazenamento };
        await atualizarProduto(id, produtoData);
        res.status(200).json({ mensagem: 'Produto atualizado com sucesso!!!' });

    } catch (error) {
        console.error('Erro ao atualizar produto: ', error);
        res.status(500).json({ mensagem: 'Erro ao atualizar produto!!!' });
    }
};

const deletarProdutoController = async (req, res) => {
    try {
        const { id } = req.params;
        const produto = await obterProdutoPorId(id);

        if (!produto) {
            return res.status(404).json({ mensagem: 'Produto não encontrado' });
        }
        await deletarProduto(id);
        res.status(200).json({ mensagem: 'Produto deletado com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar produto: ', error);
        res.status(500).json({ mensagem: 'Erro ao deletar produto' });
    }
};

const relatorioValidadeController = async (req, res) => {
    try {
        const produtos = await listarProdutos();

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const limite = new Date();
        limite.setDate(limite.getDate() + 30); // próximos 30 dias

        const vencidos = [];
        const proximos = [];

        produtos.forEach(prod => {
            if (!prod.validade) return;

            const validade = new Date(prod.validade);
            validade.setHours(0, 0, 0, 0);

            if (validade < hoje) {
                vencidos.push(prod);
            } else if (validade >= hoje && validade <= limite) {
                proximos.push(prod);
            }
        });

        res.status(200).json({ vencidos, proximos });

    } catch (error) {
        console.error("Erro ao gerar relatório de validade:", error);
        res.status(500).json({ mensagem: "Erro ao gerar relatório" });
    }
};


export {
    criarProdutoController,
    listarProdutosController,
    obterProdutoPorIdController,
    atualizarProdutoController,
    deletarProdutoController,
    obterProdutoPorCodigoBarrasController,
    relatorioValidadeController
}