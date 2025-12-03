import{
    listarItemVenda,
    obterItemVendaPorID,
    atualizarItemVenda,
    deletarItemVenda,
    criarItemVenda
} from "../models/itens_venda.js";

const criarItemVendaController = async (req, res) => {
    try{
        const {id, venda_id, produto_id, lote_id, quantidade, preco_unitario, subtotal} = req.body;
        const itemVendaData = {id, venda_id, produto_id, lote_id, quantidade, preco_unitario, subtotal};

        await criarItemVenda(itemVendaData);
        res.status(201).json({mensagem: 'Item venda criado com sucesso!'});
    }catch (error){
        console.error('Erro ao criar item: ', error);
        res.status(500).json({mensagem: 'Erro ao criar item'});
    }
}

const listarItemVendaController = async (req, res) => {
    try {
        const itemVenda = await listarItemVenda();
        res.status(200).json(itemVenda);
    }catch (error) {
        console.error('Erro ao listar item vendas: ', error);
        res.status(500).json({mensagem: 'Erro ao listar item vendas'});
    }
};

const obterItemVendaPorIDController = async (req, res) => {
    try{
        const {id} = req.params;
        const itemVenda = await obterItemVendaPorID(id);

        if (!itemVenda){
            return res.status(404).json({mensagem: 'Item não encontrado'});
        }

        res.status(200).json(itemVenda);
    }catch (error){
        console.error ('Erro ao onter item venda por ID: ', error);
        res.status(500).json({mensagem:'Erro ao obter item'});
    }
};

const deletarItemVendaController = async (req, res) => {
    try{
        const {id} = req.params;
        const itemVenda = await obterItemVendaPorID(id);

        if(!itemVenda){
            return res.status(404).json({mensagem: 'Item não encontrado'});
        }
        await deletarItemVenda(id);
        res.status(200).json({mensagem: 'Item venda deletado com sucesso!'});
    }catch (error){
        console.error('Erro ao deletar item: ', error);
        res.status(500).json({mensagem: 'Erro ao deletar item'});
    }
};

const atualizarItemVendaController = async (req, res) =>{
    try{
        const {id} = req.params;
        const {venda_id, produto_id, lote_id, quantidade, preco_unitario, subtotal} = req.body;

        const itemVendaExistir = await obterItemVendaPorID(id);
        if (!itemVendaExistir){
            return res.status(404).json({mensagem: 'Item não encontrado'});
        }
        const itemVendaData = {id, venda_id, produto_id, lote_id, quantidade, preco_unitario, subtotal};

        await atualizarItemVenda (id, itemVendaData);
        res.status(200).json({mensagem:'Item venda atualizado'});
    }catch (error) {
        console.error('Erro ao atualizar: ', error);
        res.status(500).json({mensagem: 'Erro ao atualizar'});
    }
};

export{
    criarItemVendaController,
    listarItemVendaController,
    obterItemVendaPorIDController,
    deletarItemVendaController,
    atualizarItemVendaController
};