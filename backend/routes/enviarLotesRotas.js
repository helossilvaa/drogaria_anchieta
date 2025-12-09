import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { enviarLoteController } from "../controllers/enviarLoteController.js";

const router = express.Router();

router.post("/", authMiddleware, enviarLoteController);

export default router;
