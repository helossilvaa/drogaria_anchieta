import express from "express";
import {
    listarSolicitacoesController,
    enviarLoteController,
} from "../controllers/solicitacoesController.js";

import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, listarSolicitacoesController);
router.post("/enviar-lote", authMiddleware, enviarLoteController);

export default router;
