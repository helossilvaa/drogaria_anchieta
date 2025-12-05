import express from "express";
import { criarFiliado, listarFiliados, atualizarFiliado, deletarFiliado, obterFiliadoPorCPFController } from "../controllers/filiadosController.js";
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post("/filiados", authMiddleware, criarFiliado);
router.get("/filiados", authMiddleware, listarFiliados);
router.put("/filiados/:id", authMiddleware, atualizarFiliado);
router.delete("/filiados/:id", authMiddleware, deletarFiliado);
router.get("/filiados/cpf/:cpf", authMiddleware, obterFiliadoPorCPFController);

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
