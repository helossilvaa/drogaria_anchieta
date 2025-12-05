import {create, readAll, read, update, deleteRecord} from '../config/database.js';


//criar usuario
const criarUsuario = async (usuarioData) => {
    try {
        return await create('usuarios', usuarioData)
    } catch(error) {
        console.error('Erro ao criar usuario: ', error);
        throw error;
    }
};


//listar usuario
const listarUsuarios = async () => {
    try {
        return await readAll('usuarios');
    } catch (error) {
       console.error('Erro ao listar usuarios: ', error);
        throw error;
    }
}

//obter usuario
const obterUsuarioId = async (id)=> {
    try {
        return await read('usuarios', `id = ${id}`)
    } catch (error) {
        console.error('Erro ao obter usuario por id: ', error);
        throw error;
    }
};


//atualizar usuario
const atualizarUsuario = async (id, usuarioData) => {
  try {
    return await update('usuarios', usuarioData, `id = ${id}`);
  } catch (error) {
    console.error('Erro ao atualizar usuário por id:', error);
    throw error;
  }
};

//deletar o usuario
const deletarUsuario = async (id) => {
    try {
        return await deleteRecord('usuarios', `id = '${id}'`);
    } catch (error) {
        console.error('Erro ao excluir usuário: ', error);
        throw error;
    }
    
};

const obterStatusUsuario = async (id) => {
    try {
        const usuario = await read('usuarios', `id = ${id}`);
        return { status: usuario.status, funcao: usuario.funcao };
    } catch (error) {
        console.error('Erro ao obter status do usuário:', error);
        throw error;
    }
};

export {criarUsuario, listarUsuarios, obterUsuarioId, atualizarUsuario, deletarUsuario, obterStatusUsuario};
