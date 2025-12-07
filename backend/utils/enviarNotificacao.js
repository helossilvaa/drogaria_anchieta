import { NotificationService } from "../services/notificationService.js";

/**
 * Envia uma notificação para matriz, filial ou ambos.
 */
export const enviarNotificacao = async ({
  tipo,
  titulo,
  mensagem,
  destino,
  usuarioId = null,
  extra_info = null,
  acao_texto = null,
  acao_url = null,
  cor = null
}) => {
  try {
    // Busca (ou cria) o tipo
    const tipoObj = await NotificationService.getOrCreateType({ nome: tipo });

    if (!tipoObj || !tipoObj.id) {
      throw new Error(`Tipo de notificação inválido: ${tipo}`);
    }

    // Título totalmente personalizado com fallback
    const tituloFinal = titulo || tipoObj.acao_texto_padrao || "Notificação";

    const dataExtras = {
      titulo: tituloFinal,
      extra_info,
      acao_texto,
      acao_url,
      cor
    };

    if (destino === "filial") {
      await NotificationService.notifyFilial(tipoObj.id, mensagem, dataExtras);
    } 
    
    else if (destino === "matriz") {
      await NotificationService.notifyMatriz(tipoObj.id, mensagem, dataExtras);
    } 
    
    else if (destino === "todos") {
      await NotificationService.notifyMatriz(tipoObj.id, mensagem, dataExtras);
      await NotificationService.notifyFilial(tipoObj.id, mensagem, dataExtras);
    } 
    
    else if (usuarioId !== null) {
      await NotificationService.createNotification({
        usuario_id: usuarioId,
        tipo_id: tipoObj.id,
        titulo: tituloFinal,
        mensagem,
        extra_info,
        acao_texto,
        acao_url,
        cor
      });
    }

    return true;

  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
    throw error;
  }
};
