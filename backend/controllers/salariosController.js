import { Salario } from "../models/salarios.js";

export const listarSalarios = async (req, res) => {
  try {
    const salarios = await Salario.getAll();
    return res.status(200).json(salarios);
  } catch (err) {
    console.error("Erro ao listar salários:", err);
    return res.status(500).json({ message: "Erro ao listar salários." });
  }
};

export const criarSalario = async (req, res) => {
  const { id_funcionario, setor_id, departamento_id, unidade_id, valor, status_pagamento } = req.body;

  if (!id_funcionario || !setor_id || !departamento_id || !unidade_id || !valor) {
    return res.status(400).json({ message: "Preencha todos os campos obrigatórios." });
  }

  try {
    const insertId = await Salario.create({
      id_funcionario,
      setor_id,
      departamento_id,
      unidade_id,
      valor,
      status_pagamento: status_pagamento || "pendente",
    });

    return res.status(201).json({ message: "Salário cadastrado com sucesso!", id: insertId });
  } catch (err) {
    console.error("Erro ao cadastrar salário:", err);
    return res.status(500).json({ message: "Erro ao cadastrar salário." });
  }
};

export const editarSalario = async (req, res) => {
  const { id } = req.params;
  const { id_funcionario, setor_id, departamento_id, unidade_id, valor, status_pagamento } = req.body;

  if (!id_funcionario || !setor_id || !departamento_id || !unidade_id || !valor) {
    return res.status(400).json({ message: "Preencha todos os campos obrigatórios." });
  }

  try {
    const updated = await Salario.update(id, {
      id_funcionario,
      setor_id,
      departamento_id,
      unidade_id,
      valor,
      status_pagamento,
    });

    if (!updated) return res.status(404).json({ message: "Salário não encontrado." });

    return res.status(200).json({ message: "Salário atualizado com sucesso!" });
  } catch (err) {
    console.error("Erro ao atualizar salário:", err);
    return res.status(500).json({ message: "Erro ao atualizar salário." });
  }
};

export const excluirSalario = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Salario.delete(id);
    if (!deleted) return res.status(404).json({ message: "Salário não encontrado." });

    return res.status(200).json({ message: "Salário excluído com sucesso!" });
  } catch (err) {
    console.error("Erro ao excluir salário:", err);
    return res.status(500).json({ message: "Erro ao excluir salário." });
  }
};
