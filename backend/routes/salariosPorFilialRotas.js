import express from 'express';
import { listarSalariosPorUnidade } from '../controllers/salariosPorFilialController.js';
const router = express.Router();

router.get('/unidade/:id', listarSalariosPorUnidade);

export default router;
