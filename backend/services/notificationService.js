import { create, read, readAll } from "../config/database.js";

// Busca a unidade do funcionário
async function getUnidadeDoUsuario(usuario_id) {
  const user = await read("usuarios", `id = ${usuario_id}`);
  if (!user) throw new Error(`Usuário ${usuario_id} não existe`);

  const funcionario = await read("funcionarios", `id = ${user.funcionario_id}`);
  if (!funcionario) throw new Error(`Funcionário do usuário ${usuario_id} não existe`);

  if (!funcionario.unidade_id) {
    throw new Error(`Funcionário não tem unidade vinculada`);
  }

  return funcionario.unidade_id;
}

export const NotificationService = {

  // Buscar ou criar tipo de notificação
  getOrCreateType: async ({ nome, icone, cor, acao_texto_padrao, extra_info_padrao }) => {
    const where = `LOWER(TRIM(nome)) = LOWER(TRIM('${nome}'))`;
    const existing = await read("notificacao_tipos", where);

    if (existing) return existing;

    const insertId = await create("notificacao_tipos", {
      nome,
      icone: icone || "default-icon",
      cor: cor || "pink",
      acao_texto_padrao: acao_texto_padrao || null,
      extra_info_padrao: extra_info_padrao || null
    });

    return {
      id: insertId,
      nome,
      icone: icone || "default-icon",
      cor: cor || "pink",
      acao_texto_padrao: acao_texto_padrao || null,
      extra_info_padrao: extra_info_padrao || null
    };
  },

  // Criar notificação única
  createNotification: async ({
    usuario_id,
    tipo_id,
    titulo,
    mensagem,
    extra_info,
    acao_texto,
    acao_url,
    cor
  }) => {

    const unidade_id = await getUnidadeDoUsuario(usuario_id);

    const insertId = await create("notificacoes", {
      usuario_id,
      unidade_id,
      tipo_id,
      titulo,
      mensagem,
      extra_info: extra_info || null,
      acao_texto: acao_texto || null,
      acao_url: acao_url || null,
      cor: cor || "pink",
      lida: 0
    });

    return { id: insertId };
  },

  // Criar notificações para vários usuários
  createBulk: async ({ usuarios, tipo_id, mensagem, extra_info, titulo, acao_texto, acao_url, cor }) => {
    const promises = usuarios.map((u) =>
      NotificationService.createNotification({
        usuario_id: u.id,
        tipo_id,
        titulo,
        mensagem,
        extra_info,
        acao_texto,
        acao_url,
        cor
      })
    );

    await Promise.all(promises);
    return true;
  },

  // Buscar usuários por departamento
  getUsersByDepartamento: async (departamentoId) => {
    const where = `departamento_id = ${departamentoId}`;
    const users = await readAll("usuarios", where);
    return Array.isArray(users) ? users : [];
  },

  notifyMatriz: async (tipo_id, mensagem, dataExtras) => {
    const users = await NotificationService.getUsersByDepartamento(4);
    if (users.length === 0) return;

    await NotificationService.createBulk({
      usuarios: users,
      tipo_id,
      mensagem,
      ...dataExtras
    });
  },

  notifyFilial: async (tipo_id, mensagem, dataExtras) => {
    const users = await NotificationService.getUsersByDepartamento(3);
    if (users.length === 0) return;

    await NotificationService.createBulk({
      usuarios: users,
      tipo_id,
      mensagem,
      ...dataExtras
    });
  }
};