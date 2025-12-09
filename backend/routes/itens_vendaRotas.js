import express from 'express';
import { criarItemVendaController, listarItemVendaController, atualizarItemVendaController, deletarItemVendaController, obterItemVendaPorIDController, obterTopCategoriasController } from '../controllers/itens_vendaController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, criarItemVendaController);
router.get('/', authMiddleware, listarItemVendaController);
router.get('/top-categorias', authMiddleware, obterTopCategoriasController);
router.get('/:id', authMiddleware, obterItemVendaPorIDController);
router.put('/:id', authMiddleware, atualizarItemVendaController);
router.delete('/:id', authMiddleware, deletarItemVendaController);

router.options('/', (req, res) => {
    res.setHeader('Allow', 'POST, GET');
    res.status(204).send();
});

router.options('/:id', (req, res) => {
    res.setHeader('Allow', 'GET, PUT, DELETE');
    res.status(204).send();
});

export default router;