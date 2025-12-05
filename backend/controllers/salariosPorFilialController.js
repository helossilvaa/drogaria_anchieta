import { query } from '../config/database.js';

export const listarSalariosPorUnidade = async (req, res) => {
  const unidadeId = req.params.id;
  try {
    const salarios = await query('SELECT * FROM salarios WHERE unidade_id = ?', [unidadeId]);
    res.json(salarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar salários' });
  }
};
