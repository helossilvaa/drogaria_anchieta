import express from 'express';
import { criarEstoqueFranquiaController, listarEstoqueFranquiaController, obterEstoqueFranquiaPorIdController, atualizarEstoqueFranquiaController, deletarEstoqueFranquiaController } from '../controllers/estoqueFranquiaController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, criarEstoqueFranquiaController)
router.get('/', authMiddleware, listarEstoqueFranquiaController);
router.get('/:id', authMiddleware, obterEstoqueFranquiaPorIdController);
router.put('/:id', authMiddleware, atualizarEstoqueFranquiaController);
router.delete('/:id', authMiddleware, deletarEstoqueFranquiaController);

router.options('/', (req, res) => {
    res.setHeader('Allow', 'POST, GET');
    res.status(204).end();
});

router.options('/:id', (req, res) => {
    res.setHeader('Allow', 'GET, PUT, DELETE');
    res.status(204).end();
});

export default router;