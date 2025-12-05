import { query } from '../config/database.js';

export const listarVendasPorUnidade = async (req, res) => {
  const unidadeId = req.params.id;
  try {
    const vendas = await query('SELECT * FROM vendas WHERE unidade_id = ?', [unidadeId]);
    res.json(vendas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar vendas' });
  }
};
