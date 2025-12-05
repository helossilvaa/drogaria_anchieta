// utils/enviarNotificacao.js
import { create } from "../config/database.js";

/**
 * Envia uma notificação para matriz, filial ou ambos.
 * 
 * @param {Object} data
 * @param {string} data.tipo
 * @param {string} data.titulo
 * @param {string} data.mensagem
 * @param {"matriz" | "filial" | "todos"} data.destino
 * @param {number|null} data.usuarioId  (opcional)
 */
export const enviarNotificacao = async ({
  tipo,
  titulo,
  mensagem,
  destino,
  usuarioId = null
}) => {
  try {
    const notificacao = {
      tipo,
      titulo,
      mensagem,
      destino,
      usuarioId,
      data_criacao: new Date()
    };

    await create("notificacoes", notificacao);

    console.log("Notificação enviada:", notificacao);
    return true;

  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
    throw error;
  }
};