import { Parcerias } from "../models/parceria.js";
import { Notificacao } from "../models/notificacoes.js";
import { NotificacaoTipos } from "../models/notificacaoTipos.js";
import * as Usuarios from "../models/usuario.js";

// Lista todas as parcerias
export const listarParcerias = async (req, res) => {
  try {
    const parcerias = await Parcerias.getAll();
    return res.status(200).json(parcerias);
  } catch (err) {
    console.error("Erro ao listar parcerias:", err);
    return res.status(500).json({ message: "Erro ao listar parcerias." });
  }
};

// Buscar por parceiro (convênio)
export const buscarParceriaPorNome = async (req, res) => {
  try {
    const { parceiro } = req.query;

    if (!parceiro) {
      return res.status(400).json({ message: "Informe o nome do parceiro." });
    }

    const convenio = await Parcerias.getByNome(parceiro);

    if (!convenio) {
      return res.status(404).json({ message: "Convênio não encontrado." });
    }

    return res.status(200).json(convenio);
  } catch (err) {
    console.error("Erro ao buscar convênio:", err);
    return res.status(500).json({ message: "Erro ao buscar convênio." });
  }
};


// Criar nova parceria
export const criarParceria = async (req, res) => {
  try {
    const { parceiro, porcentagem } = req.body;

    if (!parceiro || porcentagem === undefined) {
      return res.status(400).json({ message: "Dados inválidos." });
    }

    // Verifica duplicidade
    const parceiroExistente = await Parcerias.getByNome(parceiro);
    if (
      parceiroExistente &&
      parceiroExistente.parceiro.toLowerCase() === parceiro.toLowerCase()
    ) {
      return res.status(400).json({ message: "Já existe uma parceria com este nome." });
    }

    // Cria parceria
    const novaParceriaId = await Parcerias.create({ parceiro, porcentagem });

    const novaParceria = {
      id: novaParceriaId,
      parceiro,
      porcentagem,
    };

    // --- CRIAÇÃO DE NOTIFICAÇÕES ---
    try {
      // Garante tipo de notificação "parceria"
      const tipo = await NotificacaoTipos.getOrCreateByName("parceria", {
        icone: "Handshake",
        cor: "blue",
        acao_texto_padrao: "Ver parceria"
      });

      const tipo_id = tipo.id;

      // Busca todos os Diretores Administrativos (departamento = 3)
      const administradores = await Usuarios.getByDepartamentoWithUnidade(3);

      const titulo = "Nova parceria cadastrada";
      const mensagem = `A parceria ${parceiro} foi adicionada.`;

      // Cria notificações individuais
      for (const user of administradores) {
        await Notificacao.create({
          usuario_id: user.id || user.usuario_id,
          unidade_id: user.unidade_id ?? 0,
          tipo_id,
          titulo,
          mensagem,
          lida: 0,
        });
      }
    } catch (notifyErr) {
      console.error("Erro ao criar notificações:", notifyErr);
    }

    return res.status(201).json({
      message: "Parceria criada com sucesso!",
      parceria: novaParceria
    });

  } catch (err) {
    console.error("Erro ao criar parceria:", err);
    return res.status(500).json({ message: "Erro ao criar parceria." });
  }
};

// Atualizar parceria existente
export const atualizarParceria = async (req, res) => {
  try {
    const { id } = req.params;
    const { parceiro, porcentagem } = req.body;

    if (!parceiro || porcentagem === undefined) {
      return res.status(400).json({ message: "Dados inválidos." });
    }

    const parcerias = await Parcerias.getAll();
    const parceria = parcerias.find(p => p.id === parseInt(id));

    if (!parceria) {
      return res.status(404).json({ message: "Parceria não encontrada." });
    }

    const parceiroExistente = await Parcerias.getByNome(parceiro);
    if (parceiroExistente && parceiroExistente.id !== parseInt(id)) {
      return res.status(400).json({ message: "Já existe uma parceria com este nome." });
    }

    await Parcerias.update(id, { parceiro, porcentagem });

    try {
      const tipo = await NotificacaoTipos.getOrCreateByName("parceria", {
        icone: "Handshake",
        cor: "blue",
        acao_texto_padrao: "Ver parceria"
      });

      const tipo_id = tipo.id;

      const administradores = await Usuarios.getByDepartamentoWithUnidade(3);

      const titulo = "Parceria atualizada";
      const mensagem = `A parceria "${parceiro}" foi atualizada.`;

      for (const user of administradores) {
        await Notificacao.create({
          usuario_id: user.id || user.usuario_id,
          unidade_id: user.unidade_id ?? 0,
          tipo_id,
          titulo,
          mensagem,
          lida: 0
        });
      }
    } catch (notifyErr) {
      console.error("Erro ao criar notificação de atualização:", notifyErr);
    }

    return res.status(200).json({ message: "Parceria atualizada com sucesso." });

  } catch (err) {
    console.error("Erro ao atualizar parceria:", err);
    return res.status(500).json({ message: "Erro ao atualizar parceria." });
  }
};

export const excluirParceria = async (req, res) => {
  try {
    const { id } = req.params;

    const todas = await Parcerias.getAll();
    const parceriaExistente = todas.find(p => p.id === parseInt(id));

    if (!parceriaExistente) {
      return res.status(404).json({ message: "Parceria não encontrada." });
    }

    await Parcerias.delete(id);

    try {
      const tipo = await NotificacaoTipos.getOrCreateByName("parceria", {
        icone: "Handshake",
        cor: "blue",
        acao_texto_padrao: "Ver parceria"
      });

      const tipo_id = tipo.id;

      const administradores = await Usuarios.getByDepartamentoWithUnidade(3);

      const titulo = "Parceria excluída";
      const mensagem = `A parceria "${parceriaExistente.parceiro}" foi removida.`;

      for (const user of administradores) {
        await Notificacao.create({
          usuario_id: user.id || user.usuario_id,
          unidade_id: user.unidade_id ?? 0,
          tipo_id,
          titulo,
          mensagem,
          lida: 0
        });
      }
    } catch (notifyErr) {
      console.error("Erro ao criar notificação de exclusão:", notifyErr);
    }

    return res.status(200).json({ message: "Parceria excluída com sucesso." });

  } catch (err) {
    console.error("Erro ao excluir parceria:", err);
    return res.status(500).json({ message: "Erro ao excluir parceria." });
  }
};