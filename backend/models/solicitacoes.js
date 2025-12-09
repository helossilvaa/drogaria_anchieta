import { read, update } from "../config/database.js";

export const obterSolicitacaoPorId = async (id) => {
    return await read("solicitacoes_estoque", `id = ${id}`);
};

export const atualizarStatusSolicitacao = async (id, status) => {
    return await update("solicitacoes_estoque", `id = ${id}`, {
        status,
        data_atendimento: new Date()
    });
};
