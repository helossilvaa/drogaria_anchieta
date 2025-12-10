import express from 'express';
import { totalVendasHoje, vendasPorHora, topProdutos } from '../controllers/vendasPorFilialController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get("/totais-hoje", authMiddleware, totalVendasHoje);
router.get("/vendas-por-hora", authMiddleware, vendasPorHora);
router.get("/top-produtos", authMiddleware, topProdutos);

router.options('/', (req, res) => {
    res.setHeader('Allow', 'POST, GET');
    res.status(204).send();
});

router.options('/:id', (req, res) => {
    res.setHeader('Allow', 'PUT, DELETE');
    res.status(204).send();
});

router.options('/buscar', (req, res) => {
    res.setHeader('Allow', 'GET');
    res.status(204).send();
});

export default router;
