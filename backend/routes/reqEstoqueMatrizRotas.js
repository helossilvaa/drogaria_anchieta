import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { listarSalarios, criarSalario, listarPagamentosPorSalario, editarSalario, excluirSalario } from "../controllers/salariosFilialController.js";

const router = express.Router();

router.get("/salarios", authMiddleware, listarSalarios);
router.post("/salarios", authMiddleware, criarSalario);
router.put("/salarios/:id", authMiddleware, editarSalario);
router.delete("/salarios/:id", authMiddleware, excluirSalario);
router.get("/salarios/:id/pagamentos", authMiddleware, listarPagamentosPorSalario);


export default router;   