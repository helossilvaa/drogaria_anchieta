import { query } from "../config/database.js";
import { Salario } from "../models/salariosMatriz.js";

export const criarSalario = async (req, res) => {
  try {
    const { id_funcionario, departamento_id, valor, status_pagamento } = req.body;

    if (!id_funcionario || !departamento_id || !valor) {
      return res.status(400).json({ message: "Preencha todos os campos obrigatórios." });
    }

    const proximaData = new Date();

    await Salario.create({
      id_funcionario,
      departamento_id,
      valor,
      status_pagamento,
      data_atualizado: proximaData
    });

    res.status(201).json({ msg: "Salário criado com sucesso" });
  } catch (erro) {
    console.log(erro);
    res.status(500).json({ msg: "Erro ao criar salário" });
  }
};

export const listarSalarios = async (req, res) => {
  try {

    let salarios;
    
      salarios = await Salario.getAll();
   
    return res.status(200).json(salarios);

  } catch (err) {
    console.error("Erro ao listar salários:", err);
    return res.status(500).json({ message: "Erro ao listar salários." });
  }
};



export const editarSalario = async (req, res) => {
  const { id } = req.params;
  const { id_funcionario, departamento_id, valor, status_pagamento } = req.body;

  if (!id_funcionario || !departamento_id || !valor) {
    return res.status(400).json({ message: "Preencha todos os campos obrigatórios." });
  }

  try {
    const updated = await Salario.update(id, {
      id_funcionario,
      departamento_id,
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
