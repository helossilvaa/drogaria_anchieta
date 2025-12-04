import { getSomaSalariosMes, getTransacoesUnidade, getCategoriasTransacoes} from "../models/transacoesFilial.js";


export async function listarSomaSalariosMes(req, res) {
  try {
    const unidadeId = req.user.unidade_id;

    const resultado = await getSomaSalariosMes(unidadeId);

    if (resultado.length === 0) {
      return res.json({ mensagem: "Nenhum salário pago este mês." });
    }

    res.json(resultado[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao somar salários do mês" });
  }
}


export async function listarTransacoes(req, res) {
  try {

    const unidadeId = req.usuarioUnidadeId;;

    const transacoes = await getTransacoesUnidade(unidadeId);

    res.json(transacoes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar transações" });
  }
}


export async function listarCategoriasTransacoes(req, res) {
  try {
    const categorias = await getCategoriasTransacoes();
    res.json(categorias);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar categorias" });
  }
}
