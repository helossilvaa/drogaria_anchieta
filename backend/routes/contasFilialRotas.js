import express from 'express'; 
import authMiddleware from '../middlewares/authMiddleware.js';
import { criarConta, listarConta, editarConta, excluirConta, pagarConta } from "../controllers/contasFilialController.js"; 

const router = express.Router(); 

router.get('/conta', authMiddleware, listarConta); 
router.post('/conta', authMiddleware, criarConta); 
router.put('/conta/:id', authMiddleware, editarConta); 
router.delete('/conta/:id', authMiddleware, excluirConta);
router.put('/conta/pagar/:id', authMiddleware, pagarConta);

export default router;
 