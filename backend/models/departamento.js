import {create, readAll, read, update, deleteRecord} from '../config/database.js';


//criar usuario
const criarDepartamento = async (departamentoData) => {
    try {
        return await create('departamento', departamentoData)
    } catch (error) {
        console.error('Erro ao criar departamento: ', error);
        throw error;
    }
};


//listar usuario
const listarDepartamento = async () => {
    try {
        return await readAll('departamento');
    } catch (error) {
       console.error('Erro ao listar departamento: ', error);
        throw error;
    }
}


//obter usuario
const obterDepartamentoId = async (id)=> {
    try {
        return await read('departamento', `id = ${id}`)
    } catch (error) {
        console.error('Erro ao obter departamento por id: ', error);
        throw error;
    }
};


//atualizar usuario
const atualizarDepartamento = async (id, departamentoData) => {
  try {
    return await update('usuarios', departamentoData, `id = ${id}`);
  } catch (error) {
    console.error('Erro ao atualizar departamento por id:', error);
    throw error;
  }
};

//deletar o usuario
const deletarDepartamento = async (id) => {
    try {
        return await deleteRecord('departamento', `id = '${id}'`);
    } catch (error) {
        console.error('Erro ao excluir departamento: ', error);
        throw error;
    }
    
};


export { criarDepartamento, listarDepartamento, obterDepartamentoId, atualizarDepartamento, deletarDepartamento };
