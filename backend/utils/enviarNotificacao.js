import { create } from "../config/database.js";
import { NotificationService } from "../services/notificationService.js"; 

/**
 * Envia uma notificação para matriz, filial ou ambos.
 * * @param {Object} data
 * @param {string} data.tipo        
 * @param {string} data.titulo
 * @param {string} data.mensagem
 * @param {"matriz" | "filial" | "todos"} data.destino
 * @param {number|null} data.usuarioId 
 */
export const enviarNotificacao = async ({
  tipo,
  titulo,
  mensagem,
  destino,
  usuarioId = null
}) => {
  try {
    const tipoObj = await NotificationService.getOrCreateType({
      nome: tipo, 
      titulo: titulo,
    });

    if (!tipoObj || !tipoObj.id) {
        console.error(`Tipo de notificação "${tipo}" não encontrado/criado.`);
        throw new Error(`Tipo de notificação inválido: ${tipo}`);
    }

    const notificacao = {
      tipo_id: tipoObj.id, 
      titulo,
      mensagem,
      destino,
      usuario_id: usuarioId,
      data_criacao: new Date()
    };
    
    if (destino === "filial") {
        await NotificationService.notifyFilial(tipoObj.id, mensagem);
    } else if (destino === "matriz") {
        await NotificationService.notifyMatriz(tipoObj.id, mensagem);
    } else {
        if (usuarioId !== null) {
            await NotificationService.createNotification({
                usuario_id: usuarioId,
                tipo_id: tipoObj.id,
                mensagem: mensagem
            });
        } else {
            console.warn(`Notificação com destino ${destino} não enviada: lógica não implementada.`);
        }
    }
    
    console.log(`Notificação enviada (${tipoObj.nome}) para ${destino}.`);
    return true;

  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
    throw error;
  }
};