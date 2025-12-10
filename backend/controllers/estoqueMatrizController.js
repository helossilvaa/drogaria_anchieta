// controllers/estoqueMatrizController.js
import { read, update, create, deleteRecord } from "../config/database.js";
import {
  criarEstoqueMatriz,
  listarEstoqueMatriz,
  obterEstoqueMatrizPorID,
  atualizarEstoqueMatriz,
  deletarEstoqueMatriz
} from "../models/estoqueMatriz.js";


const criarEstoqueMatrizController = async (req, res) => {
  try {
    const { id, produto_id, quantidade, estoque_minimo, estoque_maximo, locolizacao, lote_id, data_atualizacao } = req.body;
    const estoqueMatrizData = { id, produto_id, quantidade, estoque_minimo, estoque_maximo, locolizacao, lote_id, data_atualizacao };

    await criarEstoqueMatriz(estoqueMatrizData);
    return res.status(201).json({ mensagem: 'Estoque matriz criada com sucesso!' });
  } catch (error) {
    console.error('Erro ao criar estoque matriz: ', error);
    return res.status(500).json({ mensagem: 'Erro ao criar estoque matriz', detalhe: error.message });
  }
};

const listarEstoqueMatrizController = async (req, res) => {
  try {
    const estoque = await listarEstoqueMatriz();
    return res.status(200).json(estoque);
  } catch (error) {
    console.error('Erro ao listar estoque matriz: ', error);
    return res.status(500).json({ mensagem: 'Erro ao listar estoque matriz' });
  }
};


const obterEstoqueMatrizPorIDController = async (req, res) => {
  try {
    const { id } = req.params;
    const estoque = await obterEstoqueMatrizPorID(id);

    if (!estoque) return res.status(404).json({ mensagem: 'Estoque matriz não encontrado' });

    return res.status(200).json(estoque);
  } catch (error) {
    console.error('Erro ao obter estoque matriz por ID: ', error);
    return res.status(500).json({ mensagem: 'Erro ao obter estoque matriz' });
  }
};

const obterEstoquePorProdutoController = async (req, res) => {
  try {
    const { produtoId } = req.params; 

    const estoque = await read('estoque_matriz', `produto_id = ${produtoId}
        LIMIT 1`, `id, quantidade`);
    
    console.log(estoque);

    if (!estoque || estoque.length === 0) {
      return res.status(404).json({ mensagem: "Produto não encontrado no estoque da matriz." });
    }

    // read() retorna array, então pega o primeiro item
    return res.status(200).json(estoque);

  } catch (error) {
    console.error("Erro ao buscar estoque por produto:", error);
    return res.status(500).json({
      mensagem: "Erro no servidor.",
      detalhe: error.message
    });
  }
};




const atualizarEstoqueMatrizController = async (req, res) => {
  try {
    const { id } = req.params;
    const { produto_id, quantidade, estoque_minimo, estoque_maximo, locolizacao, lote_id, data_atualizacao } = req.body;

    const existente = await obterEstoqueMatrizPorID(id);
    if (!existente) return res.status(404).json({ mensagem: 'Estoque matriz não encontrada' });

    const estoqueMatrizData = { id, produto_id, quantidade, estoque_minimo, estoque_maximo, locolizacao, lote_id, data_atualizacao };
    await atualizarEstoqueMatriz(id, estoqueMatrizData);

    return res.status(200).json({ mensagem: 'Estoque matriz atualizado' });
  } catch (error) {
    console.error('Erro ao atualizar estoque matriz: ', error);
    return res.status(500).json({ mensagem: 'Erro ao atualizar', detalhe: error.message });
  }
};

const deletarEstoqueMatrizController = async (req, res) => {
  try {
    const { id } = req.params;
    const existente = await obterEstoqueMatrizPorID(id);

    if (!existente) return res.status(404).json({ mensagem: 'Estoque matriz não encontrado' });

    await deletarEstoqueMatriz(id);
    return res.status(200).json({ mensagem: 'Estoque matriz deletada com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar estoque matriz: ', error);
    return res.status(500).json({ mensagem: 'Erro ao deletar estoque matriz', detalhe: error.message });
  }
};

export {
  criarEstoqueMatrizController,
  listarEstoqueMatrizController,
  obterEstoqueMatrizPorIDController,
  obterEstoquePorProdutoController,
  atualizarEstoqueMatrizController,
  deletarEstoqueMatrizController
};
