// services/notificationService.js
import { create, read, readAll } from "../config/database.js";

export const NotificationService = {
  // Buscar ou criar tipo de notificação
  getOrCreateType: async ({ nome, descricao, icone, cor, acao_texto_padrao, extra_info_padrao }) => {
    const where = `LOWER(TRIM(nome)) = LOWER(TRIM('${nome}'))`;
    const existing = await read("notificacao_tipos", where);

    if (existing) return existing;

    const created = await create("notificacao_tipos", {
      nome,
      descricao: descricao || nome,
      icone: icone || 'default-icon',
      cor: cor || 'pink',
      acao_texto_padrao: acao_texto_padrao || null,
      extra_info_padrao: extra_info_padrao || null, 
    });

    return created;
  },

  // Criar notificação única
  createNotification: async ({ usuario_id, tipo_id, mensagem, extra_info }) => {
    return await create("notificacoes", {
      usuario_id,
      tipo_id,
      mensagem,
      extra_info,
      lida: 0,
      created_at: new Date(),
    });
  },

  // Criar notificações para vários usuários
  createBulk: async ({ usuarios, tipo_id, mensagem, extra_info }) => {
    const promises = usuarios.map((u) =>
      NotificationService.createNotification({
        usuario_id: u.id,
        tipo_id,
        mensagem,
        extra_info,
      })
    );

    await Promise.all(promises);
    return true;
  },

  // Buscar todos usuários por departamento
  getUsersByDepartamento: async (departamentoId) => {
    const where = `departamento_id = ${departamentoId}`;
    const users = await readAll("usuarios", where);
    return Array.isArray(users) ? users : [];
  },

  // Enviar notificação para diretores da matriz (departamento 4)
  notifyMatriz: async (tipo_id, mensagem, extra_info = null) => {
    const diretoriaGeral = await NotificationService.getUsersByDepartamento(4);
    if (diretoriaGeral.length === 0) return;

    await NotificationService.createBulk({
      usuarios: diretoriaGeral,
      tipo_id,
      mensagem,
      extra_info,
    });
  },

  // Enviar para diretores da filial (departamento 3)
  notifyFilial: async (tipo_id, mensagem, extra_info = null) => {
    const diretoriaFilial = await NotificationService.getUsersByDepartamento(3);
    if (diretoriaFilial.length === 0) return;

    await NotificationService.createBulk({
      usuarios: diretoriaFilial,
      tipo_id,
      mensagem,
      extra_info,
    });
  },
};