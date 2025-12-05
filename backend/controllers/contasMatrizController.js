import { Conta } from "../models/contasMatriz.js";
import { create } from "../config/database.js";

export const criarConta = async (req, res) => {
  const { nomeConta, categoria, dataPostada, dataVencimento, valor, conta_pdf, status } = req.body;

  if (!req.user?.unidade_id) {
    return res.status(400).json({ message: "unidade_id não encontrado no token" });
  }

  if (!nomeConta || !categoria || !dataPostada || !dataVencimento || !valor || !conta_pdf) {
    return res.status(400).json({ message: "Preencha todos os campos obrigatórios." });
  }

  const statusBanco = status === true ? "pendente" : "pago";

  try {
    const contasExistentes = await Conta.getAllByUnidade(req.user.unidade_id);
    const lista = Array.isArray(contasExistentes) ? contasExistentes : [];

    const nomeDuplicado = lista.find(
      (c) => c.nomeConta?.toLowerCase().trim() === nomeConta.toLowerCase().trim()
    );

    if (nomeDuplicado) {
      return res.status(409).json({ message: "Já existe uma conta com esse nome nesta unidade." });
    }

    // INSERE A CONTA
    const insertId = await Conta.create({
      nomeConta,
      categoria,
      dataPostada,
      dataVencimento,
      valor,
      conta_pdf: Buffer.from(conta_pdf, "base64"),
      status: statusBanco,
      unidade_id: req.user.unidade_id,
    });

    if (statusBanco === "pago") {
      console.log("🔄 Criando pagamento e lançamento porque a conta já foi criada como paga.");

      await create("pagamentos_contas", {
        conta_id: insertId,
        status_pagamento: "pago",
        data_pagamento: new Date(),
        valor_pago: valor,
        unidade_id: req.user.unidade_id
      });

      await create("transacoes", {
        data_lancamento: new Date(),
        tipo_movimento: "SAIDA",
        valor: valor,
        descricao: `Pagamento da conta: ${nomeConta}`,
        unidade_id: req.user.unidade_id,
        categoria_transacao_id: 6, 
        origem: "conta"
      });
    }

    return res.status(201).json({ message: "Conta cadastrada com sucesso!", id: insertId });

  } catch (err) {
    console.error("Erro ao cadastrar conta:", err);
    return res.status(500).json({ message: "Erro ao cadastrar conta." });
  }
};

export const listarConta = async (req, res) => {
  try {
    let contas = await Conta.getAll(); 

    if (!Array.isArray(contas)) {
      contas = contas ? [contas] : [];
    }

    const contasConvertidas = contas.map((f) => ({
      ...f,
      status: f.status_pagamento === "pendente",
      conta_pdf: f.conta_pdf ? Buffer.from(f.conta_pdf).toString("base64") : null,
    }));

    return res.status(200).json(contasConvertidas);
  } catch (err) {
    console.error("Erro ao listar contas:", err);
    return res.status(500).json({ message: "Erro ao listar contas." });
  }
};


export const editarConta = async (req, res) => {
  const { id } = req.params;
  const { nomeConta, categoria, dataPostada, dataVencimento, valor, conta_pdf, status } = req.body;

  if (!nomeConta || !categoria || !dataPostada || !dataVencimento || !valor) {
    return res.status(400).json({ message: "Preencha todos os campos obrigatórios." });
  }

  // status true = pendente | false = pago
  const statusBanco = status === true ? "pendente" : "pago";

  try {
    const unidadeId = req.user?.unidade_id;

    // Evita nomes duplicados
    const contasExistentes = await Conta.getAllByUnidade(unidadeId);
    const nomeDuplicado = contasExistentes.find(
      (c) =>
        c.nomeConta.toLowerCase().trim() === nomeConta.toLowerCase().trim() &&
        c.id !== Number(id)
    );

    if (nomeDuplicado) {
      return res.status(409).json({ message: "Já existe uma conta com esse nome nesta unidade." });
    }

    const dadosParaAtualizar = {
      nomeConta,
      categoria,
      dataPostada,
      dataVencimento,
      valor,
      status: statusBanco,
    };

    if (conta_pdf) {
      dadosParaAtualizar.conta_pdf = Buffer.from(conta_pdf, "base64");
    }

    await Conta.update(id, dadosParaAtualizar);

    // 🔥🔥🔥 SE STATUS = PAGO, LANÇAR NAS TABELAS AUTOMATICAMENTE
    if (statusBanco === "pago") {

      // Registrar pagamento
      await create("pagamentos_contas", {
        conta_id: id,
        status_pagamento: "pago",
        data_pagamento: new Date(),
        valor_pago: valor,
        unidade_id: unidadeId
      });

      // Registrar transação de saída
      await create("transacoes", {
        data_lancamento: new Date(),
        tipo_movimento: "SAIDA",
        valor: valor,
        descricao: `Pagamento da conta: ${nomeConta}`,
        unidade_id: unidadeId,
        categoria_transacao_id: 6,
        origem: "conta"
      });
    }

    return res.status(200).json({ message: "Conta atualizada com sucesso!" });

  } catch (err) {
    console.error("Erro ao editar conta:", err);
    return res.status(500).json({ message: "Erro ao editar conta." });
  }
};


export const excluirConta = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Conta.delete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Conta não encontrada." });
    }

    return res.status(200).json({ message: "Conta excluída com sucesso!" });

  } catch (err) {
    console.error("Erro ao excluir conta:", err);
    return res.status(500).json({ message: "Erro ao excluir conta." });
  }
};

export const downloadPDF = async (req, res) => {
  const { id } = req.params;

  try {
    const unidadeId = req.user?.unidade_id;
    const contas = await Conta.getAllByUnidade(unidadeId);
    const conta = contas.find(c => c.id == id);

    if (!conta || !conta.conta_pdf) {
      return res.status(404).send("PDF não encontrado");
    }

    const buffer = Buffer.from(conta.conta_pdf);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=conta_${id}.pdf`);
    res.send(buffer);

  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao carregar PDF");
  }
};

export const pagarConta = async (req, res) => {
  try {
    const { id } = req.params;

    const pagamento = {
      conta_id: id,
      status_pagamento: "pago",
      data_pagamento: new Date(),
      valor_pago: req.body.valor,
      unidade_id: req.user.unidade_id
    };

    await create("pagamentos_contas", pagamento);

    await create("transacoes", {
      data_lancamento: new Date(),
      tipo_movimento: "SAIDA",
      valor: req.body.valor,
      descricao: "Pagamento de conta",
      unidade_id: req.user.unidade_id,
      categoria_transacao_id: 6,
      origem: "conta"
    });

    return res.status(200).json({ message: "Conta paga e lançada nas transações!" });

  } catch (error) {
    console.error("Erro ao pagar conta:", error);
    return res.status(500).json({ message: "Erro ao pagar conta." });
  }
};
 
