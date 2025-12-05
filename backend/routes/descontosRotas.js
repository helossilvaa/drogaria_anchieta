import express from "express";
import {listarDescontos, criarDesconto, atualizarDesconto, excluirDesconto} from "../controllers/descontosController.js";
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get("/descontos", authMiddleware, listarDescontos);
router.post("/descontos", authMiddleware, criarDesconto);
router.put("/descontos/:id", authMiddleware, atualizarDesconto);
router.delete("/descontos/:id", authMiddleware, excluirDesconto);

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