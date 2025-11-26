import express from "express";
import { listarSalarios, criarSalario, editarSalario, excluirSalario } from "../controllers/salariosFilialController.js";

const router = express.Router();

router.get("/salarios", listarSalarios);
router.post("/salarios", criarSalario);
router.put("/salarios/:id", editarSalario);
router.delete("/salarios/:id", excluirSalario);

export default router;
 