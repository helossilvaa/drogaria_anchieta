import { create, readAll, read, update, deleteRecord } from '../config/database.js';

// criar funcionário
const criarFuncionario = async (funcionarioData) => {
  try {
    return await create('funcionarios', funcionarioData);
  } catch (error) {
    console.error('Erro ao criar funcionário:', error);
    throw error;
  }
};

// listar todos
const listarFuncionarios = async () => {
  try {
    return await readAll('funcionarios');
  } catch (error) {
    console.error('Erro ao listar funcionários:', error);
    throw error;
  }
};

// obter por ID
const obterFuncionarioId = async (id) => {
  try {
    return await read('funcionarios', `id = ${id}`);
  } catch (error) {
    console.error('Erro ao obter funcionário:', error);
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

// deletar funcionário
const deletarFuncionario = async (id) => {
  try {
    return await deleteRecord('funcionarios', `id = ${id}`);
  } catch (error) {
    console.error('Erro ao deletar funcionário:', error);
    throw error;
  }
};

export {
  criarFuncionario,
  listarFuncionarios,
  obterFuncionarioId,
  atualizarFuncionario,
  deletarFuncionario
};
