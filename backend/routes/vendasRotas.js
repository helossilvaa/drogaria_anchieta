import express from 'express';
import {
    criarVendaController,
    listarVendaController,
    atualizarVendaController,
    obterVendaPorIDController,
    evolucaoVendasMensalController
} from '../controllers/vendasController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
 
const router = express.Router();
 
router.post('/', authMiddleware, criarVendaController);
router.get('/', authMiddleware, listarVendaController);
router.get("/evolucaomensal", authMiddleware, evolucaoVendasMensalController);
router.get('/:id', authMiddleware, obterVendaPorIDController);
router.put('/:id', authMiddleware, atualizarVendaController);

router.options('/', (req, res) => {
    res.setHeader('Allow', 'POST, GET');
    res.status(204).send();
});
 
router.options('/:id', (req, res) => {
    res.setHeader('Allow', 'GET, PUT');
    res.status(204).send();
});
 
export default router;