import express from "express";
import { criarFiliado, listarFiliados, atualizarFiliado, deletarFiliado, obterFiliadoPorCPFController } from "../controllers/filiadosController.js";

const router = express.Router();

router.post("/filiados", criarFiliado);
router.get("/filiados", listarFiliados);
router.put("/filiados/:id", atualizarFiliado);
router.delete("/filiados/:id", deletarFiliado);
router.get("/filiados/cpf/:cpf", obterFiliadoPorCPFController);

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
