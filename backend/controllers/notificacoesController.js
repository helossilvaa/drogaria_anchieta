import { Notificacao } from "../models/notificacoes.js";


// export const criarNotificacao = async (req, res) => {
//   console.log("Dados recebidos do frontend:", req.body);
//   try {
//     const { usuario_id, unidade_id, titulo, mensagem } = req.body;
//     const camposObrigatorios = { usuario_id, unidade_id, titulo, mensagem };

//     const camposVazios = Object.entries(camposObrigatorios)
//       .filter(([_, valor]) => !valor || valor === "")
//       .map(([campo]) => campo);

//     if (camposVazios.length > 0) {
//       return res.status(400).json({
//         message: `Preencha todos os campos obrigatórios. Campos vazios: ${camposVazios.join(", ")}`
//       });
//     }
//     const id = await Notificacao.create({
//       usuario_id,
//       unidade_id,
//       titulo,
//       mensagem,
//       lida: 0
//     });
//     return res.status(201).json({
//       message: "Notificação criada com sucesso!",
//       id
//     });

//   } catch (err) {
//     console.error("Erro ao criar notificação:", err);
//     return res.status(500).json({
//       message: "Erro ao criar notificação.",
//       erro: err.message
//     });
//   }
// };

export const criarNotificacao = async (req, res) => {
  console.log("Dados recebidos do frontend:", req.body);
  try {
    const { usuario_id, unidade_id, titulo, mensagem, tipo_nome } = req.body;

    const camposObrigatorios = { usuario_id, unidade_id, titulo, mensagem };

    const camposVazios = Object.entries(camposObrigatorios)
      .filter(([_, valor]) => !valor || valor === "")
      .map(([campo]) => campo);

    if (camposVazios.length > 0) {
      return res.status(400).json({
        message: `Preencha todos os campos obrigatórios. Campos vazios: ${camposVazios.join(", ")}`
      });
    }

    // adcionei isso bia- função que obtém ou cria tipo de notificação
    let tipo = null;

    if (tipo_nome) {
      tipo = await NotificacaoTipos.getOrCreateByName(tipo_nome);
    }
    const id = await Notificacao.create({
      usuario_id,
      unidade_id,
      titulo,
      mensagem,
      tipo_id: tipo ? tipo.id : null, // adcionei tbm
      lida: 0
    });

    return res.status(201).json({
      message: "Notificação criada com sucesso!",
      id
    });

  } catch (err) {
    console.error("Erro ao criar notificação:", err);
    return res.status(500).json({
      message: "Erro ao criar notificação.",
      erro: err.message
    });
  }
};

// export const criarNotificacaoReposicao = async ({
//   usuario_id,
//   filial_id,
//   produto_nome,
//   quantidade,
// }) => {
//   try {
//     await Notificacao.create({
//       usuario_id,
//       unidade_id: 1, // faz com que a matriz SEMPRE receba solicitações
//       titulo: "Solicitação de Reposição",
//       mensagem: `A filial ${filial_id} solicitou ${quantidade} unidades do produto ${produto_nome}.`,
//       lida: 0,
//       criada_em: new Date(),
//     });

//     console.log("Notificação de reposição criada com sucesso!");
//   } catch (err) {
//     console.error("Erro ao criar notificação de reposição:", err);
//   }
// };
// ⭐ NOVA FUNÇÃO ADAPTADA
// Criar notificação automaticamente quando a filial solicita reposição
export const criarNotificacaoReposicao = async ({
  usuario_id,
  filial_id,
  produto_nome,
  quantidade
}) => {
  try {

    // adcioneii
    const tipo = await NotificacaoTipos.getOrCreateByName("Estoque baixo", {
      icone: "TriangleAlert",
      cor: "pink",
      acao_texto_padrao: "Ver solicitação"
    });

    // Criar notificação para MATRIZ
    await Notificacao.create({
      usuario_id,
      unidade_id: 1,  // matriz sempre recebe
      tipo_id: tipo.id, // tbm adcioneii
      titulo: "Solicitação de Reposição",
      mensagem: `A filial ${filial_id} solicitou ${quantidade} unidades do produto ${produto_nome}.`,
      lida: 0,
      criada_em: new Date()
    });

    console.log("Notificação de reposição criada com sucesso!");

  } catch (err) {
    console.error("Erro ao criar notificação de reposição:", err);
  }
};

export const listarNotificacoes = async (req, res) => {
  try {
    const notificacoes = await Notificacao.getAll();
    return res.status(200).json(notificacoes);
  } catch (err) {
    console.error("Erro ao listar notificações:", err);
    return res.status(500).json({ message: "Erro ao listar notificações." });
  }
};

export const listarNotificacoesPorUsuario = async (req, res) => {
  try {
    const { usuario_id } = req.params;

    const notificacoes = await Notificacao.getByUsuario(usuario_id);

    return res.status(200).json(notificacoes);
  } catch (err) {
    console.error("Erro ao listar notificações por usuário:", err);
    return res.status(500).json({ message: "Erro ao listar notificações." });
  }
};

export const listarNotificacoesPorUnidade = async (req, res) => {
  try {
    const { unidade_id } = req.params;

    const notificacoes = await Notificacao.getByUnidade(unidade_id);

    return res.status(200).json(notificacoes);
  } catch (err) {
    console.error("Erro ao listar notificações por unidade:", err);
    return res.status(500).json({ message: "Erro ao listar notificações." });
  }
};

export const obterNotificacaoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const notificacao = await Notificacao.getById(id);

    if (!notificacao) {
      return res.status(404).json({ message: "Notificação não encontrada." });
    }

    return res.status(200).json(notificacao);
  } catch (err) {
    console.error("Erro ao buscar notificação:", err);
    return res.status(500).json({ message: "Erro ao buscar notificação." });
  }
};

export const marcarNotificacaoComoLida = async (req, res) => {
  try {
    const { id } = req.params;

    const notificacao = await Notificacao.getById(id);
    if (!notificacao) {
      return res.status(404).json({ message: "Notificação não encontrada." });
    }

    await Notificacao.markAsRead(id);

    return res.status(200).json({ message: "Notificação marcada como lida!" });
  } catch (err) {
    console.error("Erro ao marcar como lida:", err);
    return res.status(500).json({ message: "Erro ao atualizar notificação." });
  }
};

export const deletarNotificacao = async (req, res) => {
  try {
    const { id } = req.params;

    const deletado = await Notificacao.delete(id);

    if (deletado === 0) {
      return res.status(404).json({ message: "Notificação não encontrada." });
    }

    return res.status(200).json({ message: "Notificação excluída com sucesso!" });
  } catch (err) {
    console.error("Erro ao excluir notificação:", err);
    return res.status(500).json({ message: "Erro ao excluir notificação." });
  }
};

export const marcarTodasComoLidas = async (req, res) => {
  try {
    const { usuario_id } = req.params;

    await Notificacao.markAllAsRead(usuario_id);

    return res.status(200).json({ message: "Todas as notificações foram marcadas como lidas!" });
  } catch (err) {
    console.error("Erro ao marcar notificações como lidas:", err);
    return res.status(500).json({ message: "Erro ao atualizar notificações." });
  }
};