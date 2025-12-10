import express from "express";
import { gerarRelatorio, listar, download } from "../controllers/relatorioController.js";
 
const router = express.Router();
 
router.get("/", listar);
router.get("/download/:id", download);
router.post("/gerar", gerarRelatorio);

 
export default router;