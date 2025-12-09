import express from "express";
import { gerarRelatorio, listar, download } from "../controllers/relatorioController.js";

const router = express.Router();

router.get("/relatorios", listar);
router.get("/relatorios/download/:id", download);
router.post("/relatorios/gerar", gerarRelatorio);

export default router;
