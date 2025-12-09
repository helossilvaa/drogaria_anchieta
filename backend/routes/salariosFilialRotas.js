import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { listarSalarios, criarSalario, listarSalariosPorFuncionario, editarSalario, excluirSalario, listarSalariosPorUnidadeController } from "../controllers/salariosFilialController.js";

const router = express.Router();

router.get("/salarios", authMiddleware, listarSalarios);
router.post("/salarios", authMiddleware, criarSalario);
router.get("/salariosFilial/funcionario/:id_funcionario", authMiddleware, listarSalariosPorFuncionario); 
router.put("/salarios/:id", authMiddleware, editarSalario);
router.delete("/salarios/:id", authMiddleware, excluirSalario);
router.get('/unidade/:id', listarSalariosPorUnidadeController);

export default router;  