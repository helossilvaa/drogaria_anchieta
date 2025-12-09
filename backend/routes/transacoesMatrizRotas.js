import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { listarTransacoesComTotais } from "../controllers/transacoesMatrizController.js";

const router = express.Router();

router.get("/", authMiddleware, listarTransacoesComTotais);

export default router; 
  