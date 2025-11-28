import express from 'express';
import { criarEstoqueMatrizController, listarEstoqueMatrizController, obterEstoqueMatrizPorIDController, atualizarEstoqueMatrizController, deletarEstoqueMatrizController } from '../controllers/estoqueMatrizController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, criarEstoqueMatrizController)
router.get('/', authMiddleware, listarEstoqueMatrizController);
router.get('/:id', authMiddleware, obterEstoqueMatrizPorIDController);
router.put('/:id', authMiddleware, atualizarEstoqueMatrizController);
router.delete('/:id', authMiddleware, deletarEstoqueMatrizController);

router.options('/', (req, res) => {
    res.setHeader('Allow', 'POST, GET');
    res.status(204).send();
});

router.options('/:id', (req, res) => {
    res.setHeader('Allow', 'GET, PUT, DELETE');
    res.status(204).send();
});

export default router;