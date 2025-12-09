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
    // 🔹 Busca unidade e nome do funcionário
    const funcionarios = await query(
      "SELECT unidade_id, nome FROM funcionarios WHERE id = ?",
      [id_funcionario]
    );

    if (!funcionarios || funcionarios.length === 0) {
      return res.status(400).json({ msg: "Funcionário não encontrado." });
    }

    const unidade_id = funcionarios[0].unidade_id;
    const nome_funcionario = funcionarios[0].nome;

    // 🔹 Atualiza salário
    const updated = await Salario.update(id, {
      id_funcionario,
      unidade_id,           
      departamento_id,
      valor,
      status_pagamento
    });

    if (!updated) {
      return res.status(404).json({ message: "Salário não encontrado." });
    }

    // 🔥 Quando mudar para pago ➝ registrar em pagamentos_salarios + transações
    if (status_pagamento === "pago") {

      // 👉 Registrar histórico do pagamento
      await query(
        `INSERT INTO pagamentos_salarios 
        (id_salario, id_funcionario, unidade_id, departamento_id, valor, status_pagamento, data_pagamento)
        VALUES (?, ?, ?, ?, ?, 'pago', NOW())`,
        [id, id_funcionario, unidade_id, departamento_id, valor]
      );

      // 👉 Registrar na tabela transações (categoria_salários = id 1)
      await query(
        `INSERT INTO transacoes 
        (valor, tipo_movimento, descricao, origem, unidade_id, categoria_transacao_id, data_lancamento)
        VALUES (?, 'saida', ?, 'salario', ?, 1, NOW())`,
        [valor, `Pagamento salário - ${nome_funcionario}`, unidade_id]
      );
    }

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

export const listarPagamentosPorSalario = async (req, res) => {
  const { id } = req.params; // id do salário

  try {
    const pagamentos = await query(
      `SELECT 
        p.id,
        p.id_salario,
        p.valor,
        p.status_pagamento,
        p.data_pagamento,
        p.criado_em
      FROM pagamentos_salarios p
      WHERE p.id_salario = ?
      ORDER BY p.data_pagamento DESC`,
      [id]
    );
    const unidade_id = req.user.unidade_id;

    const salarios = await query(
      "SELECT * FROM salarios WHERE id_funcionario = ? AND unidade_id = ? ORDER BY data_atualizado DESC",
      [id_funcionario, unidade_id]
    );

    return res.status(200).json(pagamentos);
  } catch (err) {
    console.error("Erro ao buscar histórico de pagamentos:", err);
    return res.status(500).json({ message: "Erro ao buscar pagamentos." });
  }
};

export const gerarDecimoTerceiro = async () => {
  try {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth() + 1; // Janeiro = 1

    // Checa se é Novembro ou Dezembro
    if (mes !== 11 && mes !== 12) return;

    const funcionarios = await query("SELECT id, unidade_id, departamento_id, valor FROM funcionarios");

    for (const f of funcionarios) {
      // Verifica se a parcela já foi gerada
      const tipoParcela = mes === 11 ? "13-1" : "13-2";

      const jaExiste = await query(
        "SELECT id FROM salarios WHERE id_funcionario = ? AND tipo = ? AND YEAR(data_atualizado) = ?",
        [f.id, tipoParcela, ano]
      );

      if (jaExiste.length > 0) continue; // já gerada

      // Valor do 13º proporcional
      const valorParcela = mes === 11 ? f.valor / 2 : f.valor / 2;

      await Salario.create({
        id_funcionario: f.id,
        unidade_id: f.unidade_id,
        departamento_id: f.departamento_id,
        valor: valorParcela,
        status_pagamento: "pendente",
        tipo: tipoParcela,
        data_atualizado: new Date()
      });

      console.log(`13º ${tipoParcela} criado para ${f.id}`);
    }
  } catch (err) {
    console.error("Erro ao gerar 13º salário:", err);
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
