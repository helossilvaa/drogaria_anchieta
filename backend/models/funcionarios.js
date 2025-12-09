import { create, update, deleteRecord, readJoin } from '../config/database.js';

// listar todos os funcionários com o nome do departamento
const listarFuncionarios = async () => {
  try {
    const query = `
      SELECT f.*, d.departamento AS departamentoNome, u.id AS usuarioId
      FROM funcionarios f
      LEFT JOIN departamento d ON f.departamento_id = d.id
      LEFT JOIN usuarios u ON u.funcionario_id = f.id
    `;
    return await readJoin(query);
  } catch (error) {
    console.error("Erro ao listar funcionários:", error);
    throw error;
  }
};


// obter funcionário por ID com departamento
const obterFuncionarioId = async (id) => {
  try {
    const query = `
      SELECT f.*, d.departamento AS departamentoNome
      FROM funcionarios f
      LEFT JOIN departamento d ON f.departamento_id = d.id
      WHERE f.id = ?
    `;
    const result = await readJoin(query, [id]);
    return result[0] || null;
  } catch (error) {
    console.error("Erro ao obter funcionário por ID:", error);
    throw error;
  }
};

// criar funcionário
const criarFuncionario = async (funcionarioData) => {
  try {
    return await create('funcionarios', funcionarioData);
  } catch (error) {
    console.error('Erro ao criar funcionário:', error);
    throw error;
  }
};

// atualizar funcionário
const atualizarFuncionario = async (id, dados) => {
  try {
    return await update('funcionarios', dados, `id = ${id}`);
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error);
    throw error;
  }
};

// deletar funcionário (ou inativar se tiver vínculo)
const deletarFuncionario = async (id) => {
  try {
    // verifica se existe usuário vinculado
    const usuario = await readJoin(
      `SELECT id FROM usuarios WHERE funcionario_id = ?`,
      [id]
    );

    // verifica se existe salário vinculado
    const salario = await readJoin(
      `SELECT id FROM salarios WHERE id_funcionario = ?`,
      [id]
    );

    if (usuario.length === 0 && salario.length === 0) {
      // não existe vínculo, pode deletar
      await deleteRecord('funcionarios', `id = ${id}`);
      return { deletado: true, mensagem: "Funcionário excluído com sucesso" };
    } else {
      // existe vínculo, apenas inativa
      await update('funcionarios', { status: 'inativo' }, `id = ${id}`);

      if (usuario.length > 0) {
        await update('usuarios', { status: 'inativo' }, `funcionario_id = ${id}`);
      }

      return { deletado: false, mensagem: "Funcionário possui vínculos e foi inativado" };
    }
  } catch (error) {
    console.error('Erro ao deletar ou inativar funcionário:', error);
    throw error;
  }
};


// mudar status
const mudarStatusFuncionario = async (id, novoStatus) => {
  try {
    return await update('funcionarios', { status: novoStatus }, `id = ${id}`);
  } catch (error) {
    console.error('Erro ao mudar status do funcionário:', error);
    throw error;
  }
};

const funcionarioDestaqueMes = async (unidadeId) => {
  try {
    const query = `
      SELECT 
        f.id,
        f.nome,
        f.foto,
        d.departamento AS departamentoNome,
        COUNT(v.id) AS total_vendas
      FROM funcionarios f
      LEFT JOIN vendas v 
        ON f.id = v.usuario_id
        AND MONTH(v.data) = MONTH(CURRENT_DATE())
        AND YEAR(v.data) = YEAR(CURRENT_DATE())
      LEFT JOIN departamento d 
        ON f.departamento_id = d.id
      WHERE f.unidade_id = ?
      GROUP BY f.id
      ORDER BY total_vendas DESC
      LIMIT 1
    `;

    const resultado = await readJoin(query, [unidadeId]);
    return resultado[0] || null;

  } catch (error) {
    console.error("Erro ao buscar funcionário destaque da unidade:", error);
    throw error;
  }
};




export {
  listarFuncionarios,
  obterFuncionarioId,
  criarFuncionario,
  atualizarFuncionario,
  deletarFuncionario,
  mudarStatusFuncionario,
  funcionarioDestaqueMes
};
