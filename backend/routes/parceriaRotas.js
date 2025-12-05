import express from "express";
import {listarParcerias, criarParceria, atualizarParceria, excluirParceria, buscarParceriaPorNome} from "../controllers/parceriaController.js";
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get("/", authMiddleware, listarParcerias);
router.post("/", authMiddleware, criarParceria);
router.put("/:id", authMiddleware, atualizarParceria);
router.delete("/:id", authMiddleware, excluirParceria);
router.get("/buscar", authMiddleware, buscarParceriaPorNome);

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