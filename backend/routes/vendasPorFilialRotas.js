import express from 'express';
import { totalVendasHoje } from '../controllers/vendasPorFilialController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get("/vendas-hoje", authMiddleware, totalVendasHoje);

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
