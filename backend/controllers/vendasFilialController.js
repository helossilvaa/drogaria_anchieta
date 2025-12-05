import{
    listarVenda,
} from "../models/vendasFilial.js";

const listarVendaController = async (req, res) => {
  try {
    const unidadeId = Number(req.user.unidade_id);
    
    const vendas = await listarVenda(unidadeId);

    res.status(200).json(vendas);
  } catch (error) {
    console.error('Erro ao listar vendas: ', error);
    res.status(500).json({ mensagem: 'Erro ao listar vendas' });
  }
};
 
export{
    listarVendaController
};