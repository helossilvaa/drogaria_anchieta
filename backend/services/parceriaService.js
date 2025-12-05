import { NotificationService } from "./notificationService.js";

export const ParceriaService = {
  createParceria: async (data) => {
    const parceria = await create("parcerias", data);

    const tipo = await NotificationService.getOrCreateType({
      nome: "Nova Parceria",
      descricao: "Notificação de nova parceria criada",
      icone: "handshake",
      cor: "blue",
      acao_texto_padrao: "Ver parceria",
    });

    await NotificationService.notifyMatriz(tipo.id, `Nova parceria criada: ${parceria.nome}`);

    return parceria;
  },
};
