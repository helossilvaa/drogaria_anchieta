import { create, readAll, read, update, deleteRecord } from "../config/database.js";

export const criarDescontoDB = async (data) => {
  return await create("descontos", data);
};

export const listarDescontosDB = async () => {
  const result = await readAll("descontos", "1=1 ORDER BY criado_em DESC");
  return Array.isArray(result) ? result : [];
};

export const obterDescontoPorIdDB = async (id) => {
  const where = `id = ${id}`;
  const result = await read("descontos", where);
  return result || null;
};

export const atualizarDescontoDB = async (id, data) => {
  return await update("descontos", data, `id = ${id}`);
};

export const deletarDescontoDB = async (id) => {
  return await deleteRecord("descontos", `id = ${id}`);
};