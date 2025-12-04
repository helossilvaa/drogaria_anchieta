import express from 'express';
import {criarLoteMatrizController, listarLotesMatrizController,listarLotesPorProdutoController, obterLoteMatrizPorIdController, atualizarLoteMatrizController, deletarLoteMatrizController} from '../controllers/lotesMatrizController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, criarLoteMatrizController);
router.get('/', authMiddleware, listarLotesMatrizController);
router.get('/produto/:id', authMiddleware, listarLotesPorProdutoController);
router.get('/:id', authMiddleware, obterLoteMatrizPorIdController);
router.put('/:id', authMiddleware, atualizarLoteMatrizController);
router.delete('/:id', authMiddleware, deletarLoteMatrizController);

router.options('/', (req, res) => {
    res.setHeader('Allow', 'POST, GET, OPTIONS');
    res.status(204).end();
});

router.options('/:id', (req, res) => {
    res.setHeader('Allow', 'GET, PUT, DELETE, OPTIONS');
    res.status(204).end();
});

export default router;
