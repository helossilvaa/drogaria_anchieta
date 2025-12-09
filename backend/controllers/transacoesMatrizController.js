import { getTransacoesComTotais } from "../models/transacoesMatriz.js";

// Listar todas as transações com totais
export async function listarTransacoesComTotais(req, res) {
  try {
    // Puxa todas as transações, sem filtrar por unidade
    const resultado = await getTransacoesComTotais();
    res.json(resultado);
  } catch (err) {
    console.error("Erro ao buscar transações: ", err);
    res.status(500).json({ error: "Erro ao buscar transações" });
  }
}

// Criar nova transação
export async function criarTransacao(req, res) {
  try {
    const novaTransacao = req.body;
    const { create } = await import("../config/database.js");
    const resultado = await create("transacoes_matriz", novaTransacao);
    res.status(201).json(resultado);
  } catch (err) {
    console.error("Erro ao criar transação: ", err);
    res.status(500).json({ error: "Erro ao criar transação" });
  }
}

// Atualizar transação existente
export async function atualizarTransacao(req, res) {
  try {
    const { id } = req.params;
    const dadosAtualizados = req.body;
    const { update } = await import("../config/database.js");
    const resultado = await update("transacoes_matriz", dadosAtualizados, `id = ${id}`);
    res.json(resultado);
  } catch (err) {
    console.error("Erro ao atualizar transação: ", err);
    res.status(500).json({ error: "Erro ao atualizar transação" });
  }
}

// Excluir transação
export async function excluirTransacao(req, res) {
  try {
    const { id } = req.params;
    const { deleteRecord } = await import("../config/database.js");
    const resultado = await deleteRecord("transacoes_matriz", `id = ${id}`);
    res.json(resultado);
  } catch (err) {
    console.error("Erro ao excluir transação: ", err);
    res.status(500).json({ error: "Erro ao excluir transação" });
  }
}
