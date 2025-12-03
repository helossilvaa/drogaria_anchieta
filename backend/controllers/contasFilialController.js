
import { Conta } from "../models/contasFilial.js";

export const criarConta = async (req, res) => {


  const { nomeConta, categoria, dataPostada, dataVencimento, valor, conta_pdf, status } = req.body;

  if (!nomeConta || !categoria || !dataPostada || !dataVencimento || !valor || !conta_pdf) {
    return res.status(400).json({ message: "Preencha todos os campos obrigatórios." });
  }

  const statusBanco = status === true ? "pendente" : "paga";

  try {

    const contasExistentes = await Conta.getAll();
    const lista = Array.isArray(contasExistentes) ? contasExistentes : [contasExistentes];


    const nomeDuplicado = lista.find(
      (c) => c.nomeConta.toLowerCase().trim() === nomeConta.toLowerCase().trim()
    );

    if (nomeDuplicado) {
      return res.status(409).json({ message: "Já existe uma conta com esse nome." });
    }

    const insertId = await Conta.create({
      nomeConta,
      categoria,
      dataPostada,
      dataVencimento,
      valor,
      conta_pdf: Buffer.from(conta_pdf, "base64"), status: statusBanco,
      unidade_id: req.usuarioUnidadeId,
    });

    return res.status(201).json({ message: "Conta cadastrada com sucesso!", id: insertId });

  } catch (err) {

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Já existe uma conta com esse nome." });
    }
    console.error("Erro ao cadastrar conta:", err);
    return res.status(500).json({ message: "Erro ao cadastrar conta." });
  }
};

export const listarConta = async (req, res) => {

  try {
    const unidadeId = req.usuarioUnidadeId;

    let contas = await Conta.getAllByUnidade(unidadeId);

    console.log("getAll() → listarConta:", contas);

    if (!Array.isArray(contas)) {
      contas = [contas];
    }

    const contasConvertidas = contas.map((f) => ({
      ...f,
      status: f.status === "pendente",
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

  const statusBanco = status === true ? "pendente" : "paga";

  try {

    const contasExistentes = await Conta.getAll();

    const nomeDuplicado = contasExistentes.find(
      (c) =>
        c.nomeConta.toLowerCase().trim() === nomeConta.toLowerCase().trim() &&
        c.id !== Number(id)
    );

    if (nomeDuplicado) {
      return res.status(409).json({ message: "Já existe uma conta com esse nome." });
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
    const contas = await Conta.getAll();
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