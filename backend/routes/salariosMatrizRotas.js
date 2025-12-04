import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { listarSalarios, criarSalario, editarSalario, excluirSalario } from "../controllers/salariosMatrizController.js";

const router = express.Router();

router.get("/salarios", authMiddleware, listarSalarios);
router.post("/salarios", authMiddleware, criarSalario);
router.put("/salarios/:id", authMiddleware, editarSalario);
router.delete("/salarios/:id", authMiddleware, excluirSalario);

export default router; 