import express from "express";
import { listarFuncionariosPorUnidade } from "../controllers/funcionariosFilialController.js";
import { listarVendasPorUnidade } from "../controllers/vendasPorFilial.js";
import { listarSalariosPorUnidade } from "../controllers/salariosPorFilialController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// todas as rotas protegidas por token
router.get("/funcionarios/unidade/:unidadeId", authMiddleware, listarFuncionariosPorUnidade);
router.get("/vendas/unidade/:unidadeId", authMiddleware, listarVendasPorUnidade);
router.get("/salarios/unidade/:unidadeId", authMiddleware, listarSalariosPorUnidade);

export default router;
