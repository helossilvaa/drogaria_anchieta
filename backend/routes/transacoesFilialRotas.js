import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { listarCategoriasTransacoes, listarSomaSalariosMes, listarTransacoes } from "../controllers/transacoesFilialController.js";

const router = express.Router();

router.get("/salarios/soma", authMiddleware, listarSomaSalariosMes);
router.get("/transacoes", authMiddleware, listarTransacoes);
router.get("/categoria-transacoes", authMiddleware, listarCategoriasTransacoes);

export default router; 
 