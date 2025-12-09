import express from 'express';
import { criarCategoriaController, listarCategoriaController, atualizarCategoriaController, deletarCategoriaController, 
    obterCategoriaPorIDController, categoriasMaisVendidasController } from '../controllers/categoriaController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, criarCategoriaController);
router.get('/', authMiddleware, listarCategoriaController);
router.get('/maisvendidas', authMiddleware, categoriasMaisVendidasController)
router.get('/:id', authMiddleware, obterCategoriaPorIDController);
router.put('/:id', authMiddleware, atualizarCategoriaController);
router.delete('/:id', authMiddleware, deletarCategoriaController);

router.options('/', (req, res) => {
    res.setHeader('Allow', 'POST, GET');
    res.status(204).send();
});

router.options('/:id', (req, res) => {
    res.setHeader('Allow', 'GET, PUT, DELETE');
    res.status(204).send();
});

export default router;