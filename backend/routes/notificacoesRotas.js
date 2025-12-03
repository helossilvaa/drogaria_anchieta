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

const router = express.Router();

router.post("/notificacoes", criarNotificacao);
router.get("/notificacoes", listarNotificacoes);
router.get("/notificacoes/usuario/:usuario_id", listarNotificacoesPorUsuario);
router.get("/notificacoes/unidade/:unidade_id", listarNotificacoesPorUnidade);
router.get("/notificacoes/:id", obterNotificacaoPorId);
router.put("/notificacoes/:id/lida", marcarNotificacaoComoLida);
router.delete("/notificacoes/:id", deletarNotificacao);

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