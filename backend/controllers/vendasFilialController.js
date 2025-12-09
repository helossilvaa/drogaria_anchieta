import {
  listarVenda,
  atualizarTransacoesDeTodasVendas
} from "../models/vendasFilial.js";

export const listarVendaController = async (req, res) => {
  try {
    const unidadeId = Number(req.user.unidade_id);

    // Atualiza transação automática agregada por dia
    await atualizarTransacoesDeTodasVendas(unidadeId);


    // Retorna vendas detalhadas
    const vendas = await listarVenda(unidadeId);

    return res.status(200).json(vendas);

  } catch (error) {
    console.error("Erro ao listar vendas:", error);
    return res.status(500).json({ mensagem: "Erro ao listar vendas" });
  }
};
