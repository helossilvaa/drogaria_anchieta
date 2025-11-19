import express from 'express';
import { criarFuncionarioController, listarFuncionariosController, obterFuncionarioIdController,
    deletarFuncionarioController, atualizarFuncionarioController, mudarStatusFuncionarioController} from '../controllers/funcionariosController.js';

import authMiddleware from '../middlewares/authMiddleware.js';
import upload from "../middlewares/upload.js";
 
const router = express.Router();
 
router.post('/', authMiddleware, criarFuncionarioController);
router.get('/', authMiddleware, listarFuncionariosController);
router.get('/:id', authMiddleware, obterFuncionarioIdController);
router.delete('/:id', authMiddleware, deletarFuncionarioController);
router.patch('/:id', authMiddleware, upload.single("foto"), atualizarFuncionarioController);
router.put('/:id/status', authMiddleware, mudarStatusFuncionarioController);

router.options(':id/status', (req, res) => {
    res.setHeader('Allow', 'PUT, OPTIONS');
    res.status(204).send();
});

router.options('/:id', (req, res) => {
    res.setHeader('Allow', 'GET, PATCH, DELETE, OPTIONS');
    res.status(204).send();
});

router.options('/', (req, res) => {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    res.status(204).send();
});

 
export default router;