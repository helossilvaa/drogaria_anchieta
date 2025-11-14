import express from 'express';
import { 
  listarUsuariosController,
  obterUsuarioIdController,
  deletarUsuarioController,
  atualizarUsuarioController
} from '../controllers/usuarioController.js';

import { cadastroUsuarioController } from '../controllers/authController.js';

import authMiddleware from '../middlewares/authMiddleware.js';
 
const router = express.Router();
 

router.options(':id/status', (req, res) => {
    res.setHeader('Allow', 'PUT, OPTIONS');
    res.status(204).send();
});
 

router.get('/:id', authMiddleware, obterUsuarioIdController);
router.options('/:id', (req, res) => {
    res.setHeader('Allow', 'GET, PATCH, DELETE, OPTIONS');
    res.status(204).send();
});

router.post('/', authMiddleware, cadastroUsuarioController);
router.delete('/:id', authMiddleware, deletarUsuarioController);

router.patch('/:id', authMiddleware, atualizarUsuarioController);

router.get('/', authMiddleware, listarUsuariosController);

router.options('/', (req, res) => {
    res.setHeader('Allow', 'POST, GET,  OPTIONS');
    res.status(204).send();
});
 
export default router;