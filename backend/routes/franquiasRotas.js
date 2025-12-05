import express from 'express';
import { 
  criarUnidadeController, 
  listarUnidadesController, 
  obterunidadeIdcontroller, 
  atualizarUnidadeController, 
  deletarUnidadeController, 
  atribuirGerenteAdmController,
  rankingUnidadesController 
} from '../controllers/franquiaController.js';

import authMiddleware from '../middlewares/authMiddleware.js';
 
const router = express.Router();

// Criar unidade
router.post('/', authMiddleware, criarUnidadeController);

// Listar unidades
router.get('/', authMiddleware, listarUnidadesController);

router.get("/rankingunidades", rankingUnidadesController);

// Obter unidade por ID
router.get('/:id', authMiddleware, obterunidadeIdcontroller);

// Atualizar unidade
router.put('/:id', authMiddleware, atualizarUnidadeController);

// Deletar unidade
router.delete('/:id', authMiddleware, deletarUnidadeController);

// Atribuir gerente administrativo
router.put('/:id/gerente', authMiddleware, atribuirGerenteAdmController);





// Rotas OPTIONS
router.options('/', (req, res) => {
    res.setHeader('Allow', 'POST, GET, OPTIONS');
    res.status(204).send();
});

router.options('/:id', (req, res) => {
    res.setHeader('Allow', 'GET, PUT, DELETE, OPTIONS');
    res.status(204).send();
});

router.options('/:id/gerente', (req, res) => {
    res.setHeader('Allow', 'PUT, OPTIONS');
    res.status(204).send();
});

export default router;
