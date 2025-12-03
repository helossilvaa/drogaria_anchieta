import express from 'express'; 
import authMiddleware from '../middlewares/authMiddleware.js';
import { criarConta, listarConta, editarConta, excluirConta } from "../controllers/contasFilialController.js"; 

const router = express.Router(); 

router.get('/conta', authMiddleware, listarConta); 
router.post('/conta', authMiddleware, criarConta); 
router.put('/conta/:id', authMiddleware, editarConta); 
router.delete('/conta/:id', authMiddleware, excluirConta); 

export default router;