import { query } from "../config/database.js";
import { Salario } from "../models/salariosFilial.js";

function calcularProximoDia5() {
  const hoje = new Date();
  let ano = hoje.getFullYear();
  let mes = hoje.getMonth();
 
  let dia5 = new Date(ano, mes, 5);

  if (hoje.getDate() > 5) {
    return new Date(ano, mes + 1, 5);
  }

  if (dia5 - hoje <= 4 * 24 * 60 * 60 * 1000) {
    return new Date(ano, mes + 1, 5);
  }

  return dia5; 
}

export const criarSalario = async (req, res) => {
  try {
    const { id_funcionario, departamento_id, valor, status_pagamento } = req.body;

    const funcionarios = await query(
      "SELECT unidade_id FROM funcionarios WHERE id = ?",
      [id_funcionario]
    );

    if (!funcionarios || funcionarios.length === 0) {
      return res.status(400).json({ msg: "Funcionário não encontrado." });
    }

    const unidade_id = funcionarios[0].unidade_id;

    const proximaData = calcularProximoDia5();

    await query(
      "INSERT INTO salarios (id_funcionario, unidade_id, departamento_id, valor, status_pagamento, data_atualizado) VALUES (?, ?, ?, ?, ?, ?)",
      [
        id_funcionario,
        unidade_id,
        departamento_id,
        valor,
        status_pagamento,
        proximaData,
      ]
    );

    res.status(201).json({ msg: "Salário criado com sucesso" });
  } catch (erro) {
    console.log(erro);
    res.status(500).json({ msg: "Erro ao criar salário" });
  }
};


export const listarSalarios = async (req, res) => {
  try {
    const unidade_id = req.user.unidade_id; 

    const salarios = await Salario.getAll(unidade_id);
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
const funcionarios = await query(
  "SELECT unidade_id FROM funcionarios WHERE id = ?",
  [id_funcionario]
);

if (!funcionarios || funcionarios.length === 0) {
  return res.status(400).json({ msg: "Funcionário não encontrado." });
}

const unidade_id = funcionarios[0].unidade_id;



    const updated = await Salario.update(id, {
      id_funcionario,
      unidade_id,           
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

export const listarSalariosPorFuncionario = async (req, res) => {
  const { id_funcionario } = req.params;

  try {

    const unidade_id = req.user.unidade_id;

    const salarios = await query(
      "SELECT * FROM salarios WHERE id_funcionario = ? AND unidade_id = ? ORDER BY data_atualizado DESC",
      [id_funcionario, unidade_id]
    );

    return res.status(200).json(salarios);
  } catch (err) {
    console.error("Erro ao listar salários do funcionário:", err);
    return res.status(500).json({ message: "Erro ao listar salários do funcionário." });
  }
};

export const listarSalariosPorUnidadeController = async (req, res) => {
  const unidadeId = req.params.id;
  try {
    const salarios = await query('SELECT * FROM salarios WHERE unidade_id = ?', [unidadeId]);
    res.json(salarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar salários' });
  }
};
