import verifyDepartamento from '../middlewares/verifyDepartamento.js';

router.get('/:id', authMiddleware, verifyDepartamento, obterDepartamentoIdController);
router.put('/:id', authMiddleware, verifyDepartamento, atualizarDepartamentoController);
router.delete('/:id', authMiddleware, verifyDepartamento, deletarDepartamentoController);
