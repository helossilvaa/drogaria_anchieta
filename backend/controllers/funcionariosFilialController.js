import { query } from '../config/database.js';

export const listarFuncionariosPorUnidade = async (req, res) => {
  const unidadeId = req.params.id;
  try {
    const funcionarios = await query('SELECT * FROM funcionarios WHERE unidade_id = ?', [unidadeId]);
    res.json(funcionarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar funcionários' });
  }
};
