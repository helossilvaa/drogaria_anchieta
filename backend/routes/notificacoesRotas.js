import express from "express";
import {
  criarNotificacao,
  listarNotificacoes,
  listarNotificacoesPorUsuario,
  listarNotificacoesPorUnidade,
  marcarNotificacaoComoLida,
  deletarNotificacao,
  obterNotificacaoPorId
} from "../controllers/notificacoesController.js";
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post("/notificacoes",authMiddleware, criarNotificacao);
router.get("/notificacoes",authMiddleware, listarNotificacoes);
router.get("/notificacoes/usuario/:usuario_id",authMiddleware, listarNotificacoesPorUsuario);
router.get("/notificacoes/unidade/:unidade_id",authMiddleware, listarNotificacoesPorUnidade);
router.get("/notificacoes/:id",authMiddleware, obterNotificacaoPorId);
router.put("/notificacoes/:id/lida",authMiddleware, marcarNotificacaoComoLida);
router.delete("/notificacoes/:id", authMiddleware, deletarNotificacao);

router.options("/", (req, res) => {
  res.setHeader("Allow", "POST, GET");
  res.status(204).send();
});
router.options("/:id", (req, res) => {
  res.setHeader("Allow", "GET, PUT, DELETE");
  res.status(204).send();
});
router.options("/usuario/:usuario_id", (req, res) => {
  res.setHeader("Allow", "GET");
  res.status(204).send();
});
router.options("/unidade/:unidade_id", (req, res) => {
  res.setHeader("Allow", "GET");
  res.status(204).send();
});

export default router;