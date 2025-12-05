import express from 'express';
import { listarFuncionariosPorUnidade } from '../controllers/funcionariosFilialController.js';
const router = express.Router();

router.get('/unidade/:id', listarFuncionariosPorUnidade);

export default router;
