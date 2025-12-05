import express from 'express';
import { listarVendasPorUnidade } from '../controllers/vendasPorFilial.js';
const router = express.Router();

router.get('/unidade/:id', listarVendasPorUnidade);

export default router;
