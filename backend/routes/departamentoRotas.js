import express from 'express';
import { criarDepartamentoController, atualizarDepartamentoController, deletarDepartamentoController, listarDepartamentoController, obterDepartamentoIdController } from '../controllers/departamentoController.js';


import authMiddleware from '../middlewares/authMiddleware.js';
 
const router = express.Router();
router.post('/', authMiddleware, criarDepartamentoController);
router.get('/', authMiddleware, listarDepartamentoController);
router.get('/:id', authMiddleware, obterDepartamentoIdController);
router.put('/:id', authMiddleware, atualizarDepartamentoController);
router.delete('/:id', authMiddleware, deletarDepartamentoController);

router.options('/', (req, res) => {
    res.setHeader('Allow', 'POST, GET, OPTIONS');
    res.status(204).send();
});

router.options(':id/status', (req, res) => {
    res.setHeader('Allow', 'GET, PUT, DELETE, OPTIONS');
    res.status(204).send();
});

 
export default router;