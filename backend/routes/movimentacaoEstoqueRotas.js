import express from 'express';
import {
    criarMovimentacaoController,
    listarMovimentacoesController,
    listarMovimentacoesPorProdutoController,
    listarSolicitacoesPendentesController,
    obterMovimentacaoPorIdController,
    atualizarMovimentacaoController,
    deletarMovimentacaoController,
    solicitarReposicaoController
} from '../controllers/movimentacaoEstoqueController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, criarMovimentacaoController);
router.get('/', authMiddleware, listarMovimentacoesController);
router.get('/produto/:id', authMiddleware, listarMovimentacoesPorProdutoController);
router.get("/solicitacoes/pendentes", authMiddleware, listarSolicitacoesPendentesController);
router.get('/:id', authMiddleware, obterMovimentacaoPorIdController);
router.put('/:id', authMiddleware, atualizarMovimentacaoController);
router.delete('/:id', authMiddleware, deletarMovimentacaoController);
router.post('/solicitar', authMiddleware, solicitarReposicaoController);

export default router;
