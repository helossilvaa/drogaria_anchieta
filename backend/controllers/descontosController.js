import { criarDescontoDB, listarDescontosDB, obterDescontoPorIdDB, atualizarDescontoDB, deletarDescontoDB } from "../models/descontos.js";
import { enviarNotificacao } from "../utils/enviarNotificacao.js";

// Listar descontos
export const listarDescontos = async (req, res) => {
  try {
    const descontos = await listarDescontosDB();
    res.json(descontos);
  } catch (error) {
    console.error("ERRO FATAL ao listar descontos:", error); 
    res.status(500).json({ erro: error.message });
  }
};

// Criar desconto
export const criarDesconto = async (req, res) => {
  try {
    const data = req.body;
    const descontoCriado = await criarDescontoDB(data);

    // Notificação para todas as filiais
    await enviarNotificacao({
      tipo: "desconto_novo",
      titulo: "Novo Desconto",
      mensagem: `Um novo desconto foi criado: ${data.nome}`,
      destino: "filial"
    });

    res.status(201).json(descontoCriado);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// Atualizar desconto
export const atualizarDesconto = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const descontoExiste = await obterDescontoPorIdDB(id);

    if (!descontoExiste) {
      return res.status(404).json({ erro: "Desconto não encontrado" });
    }

    await atualizarDescontoDB(id, data);

    // Notificação de atualização
    await enviarNotificacao({
      tipo: "desconto_atualizado",
      titulo: "Desconto Atualizado",
      mensagem: `O desconto "${descontoExiste.nome}" foi atualizado.`,
      destino: "filial"
    });

    res.json({ msg: "Desconto atualizado com sucesso" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// Excluir desconto
export const excluirDesconto = async (req, res) => {
  try {
    const id = req.params.id;

    const descontoExiste = await obterDescontoPorIdDB(id);

    if (!descontoExiste) {
      return res.status(404).json({ erro: "Desconto não encontrado" });
    }

    await deletarDescontoDB(id);

    // Notificação de exclusão
    await enviarNotificacao({
      tipo: "desconto_excluido",
      titulo: "Desconto Removido",
      mensagem: `O desconto "${descontoExiste.nome}" foi excluído.`,
      destino: "filial"
    });

    res.json({ msg: "Desconto excluído com sucesso" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};
