import express from "express";
import {listarParcerias, criarParceria, atualizarParceria, excluirParceria, buscarParceriaPorNome} from "../controllers/parceriaController.js";

const router = express.Router();

router.get("/", listarParcerias);
router.post("/", criarParceria);
router.put("/:id", atualizarParceria);
router.delete("/:id", excluirParceria);
router.get("/buscar", buscarParceriaPorNome);

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