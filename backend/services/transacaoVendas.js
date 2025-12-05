import cron from "node-cron";
import { registrarTotalDoDia } from "../models/vendasFilial.js";
import { query } from "../config/database.js";

const registrarTransacoesDiarias = async () => {
  try {
    const unidades = await query("SELECT id FROM unidades");

    const hoje = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

    for (const unidade of unidades) {
      await registrarTotalDoDia(unidade.id, hoje);
    }
  } catch (err) {
    console.error("Erro ao registrar transações diárias:", err);
  }
};

// Agenda para rodar todo dia às 23:59
cron.schedule("59 23 * * *", () => {
  console.log("Iniciando registro automático de transações diárias...");
  registrarTransacoesDiarias();
});
