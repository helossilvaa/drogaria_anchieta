import { create, readAll, read, update, deleteRecord } from "../config/database.js";

const criarTipoDeMedicamento = async (medicamentoData) => {
    try {
        return await create('usuarios', medicamentoData)
    } catch (error) {
        console.error('Erro ao criar medicamento: ', error);
        throw error;
    }
};

const listarTiposDeMedicamentos = async () => {
    try {
        return await readAll('tipo_medicamento');
    } catch (error) {
        console.error('Erro ao listar tipos de medicamentos: ', error);
        throw error;
    }
};

const obterTiposDeMedicamentosPorId = async (id) => {
    try {
        return await read('tipo_medicamento', `id = ${id}`)
    } catch (error) {
        console.error('Erro ao obter este medicamento: ', error);
        throw error;
    }
};

const atualizarTipoDeMedicamento = async (id) => {
    try {
        return await update('tipo_medicamento', medicamentoData, `id = ${id}`)
    } catch (error) {
        console.error('Não foi possível atualizar o medicamento!: ', error)
        throw error;
    }
};

const deletarTipoDeMedicamento = async (id) => {
    try {
        return await deleteRecord('tipo_medicamento', `id = ${id}`);
    } catch (error) {
        console.error ('Não foi possível deletar este medicamento', error);
        throw error;
    }
}

export { criarTipoDeMedicamento, listarTiposDeMedicamentos, obterTiposDeMedicamentosPorId, atualizarTipoDeMedicamento, deletarTipoDeMedicamento }