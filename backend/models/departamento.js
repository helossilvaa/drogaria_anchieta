import {create, readAll, read, update, deleteRecord} from '../config/database.js';


//criar usuario
const criarDepartamento = async (setorData) => {
    try {
        return await create('setor', setorData)
    } catch (error) {
        console.error('Erro ao criar setor: ', error);
        throw error;
    }
};


//listar usuario
const listarDepartamento = async () => {
    try {
        return await readAll('setor');
    } catch (error) {
       console.error('Erro ao listar setor: ', error);
        throw error;
    }
}


//obter usuario
const obterDepartamentoId = async (id)=> {
    try {
        return await read('setor', `id = ${id}`)
    } catch (error) {
        console.error('Erro ao obter setor por id: ', error);
        throw error;
    }
};


//atualizar usuario
const atualizarDepartamento = async (id, setorData) => {
  try {
    return await update('usuarios', setorData, `id = ${id}`);
  } catch (error) {
    console.error('Erro ao atualizar setor por id:', error);
    throw error;
  }
};

//deletar o usuario
const deletarDepartamento = async (id) => {
    try {
        return await deleteRecord('setor', `id = '${id}'`);
    } catch (error) {
        console.error('Erro ao excluir setor: ', error);
        throw error;
    }
    
};


export { criarDepartamento, listarDepartamento, obterDepartamentoId, atualizarDepartamento, deletarDepartamento };
