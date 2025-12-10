import express from "express";
import { 
  getDashboardFinanceiro,
  getGraficoMensal,
  getUltimasTransacoes
} from "../controllers/dashboardFinanceiroControllers.js";

const router = express.Router();

router.get("/", getDashboardFinanceiro);
router.get("/dashboard-grafico", getGraficoMensal);

// 🔥 NOVO — rota para últimas transações
router.get("/ultimas-transacoes", getUltimasTransacoes);

export default router;
