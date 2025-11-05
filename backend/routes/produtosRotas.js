import express from 'express';
import { criarProdutoController, listarProdutosController, obterProdutoPorIdController, atualizarProdutoController, deletarProdutoController, obterProdutoPorCodigoBarrasController } from '../controllers/produtosController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, criarProdutoController)
router.get('/', authMiddleware, listarProdutosController);
router.get('/:id', authMiddleware, obterProdutoPorIdController);
router.put('/:id', authMiddleware, atualizarProdutoController);
router.delete('/:id', authMiddleware, deletarProdutoController);
router.get('/codigo_barras/:codigo_barras', authMiddleware, obterProdutoPorCodigoBarrasController);

router.options('/', (req, res) => {
    res.setHeader('Allow', 'POST, GET');
    res.status(204).send();
});

router.options('/:id', (req, res) => {
    res.setHeader('Allow', 'GET, PUT, DELETE');
    res.status(204).send();
});

export default router;