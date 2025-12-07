import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';
import { read } from '../config/database.js';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ mensagem: 'Token não fornecido' });
  }

  const [, token] = authHeader.split(' ');

  if (!token || token === "null" || token === "undefined") {
    return res.status(401).json({ mensagem: 'Token inválido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // pega o usuário do banco
    let usuario = await read('usuarios', `id = ${decoded.id}`);
    usuario = Array.isArray(usuario) ? usuario[0] : usuario;

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    // pega os dados do funcionário
    let funcionario = await read('funcionarios', `id = ${usuario.funcionario_id}`);
    funcionario = Array.isArray(funcionario) ? funcionario[0] : funcionario;

    // busca o nome do departamento
    let departamento = await read('departamento', `id = ${usuario.departamento_id}`);
    departamento = Array.isArray(departamento) ? departamento[0] : departamento;

    req.user = {
      id: usuario.id,
      funcionario_id: usuario.funcionario_id,
      departamento_id: usuario.departamento_id,
      departamento: departamento?.departamento ?? null,
      status: usuario.status,
      nome: funcionario?.nome ?? null,
      unidade_id: funcionario?.unidade_id ?? null
    };

    console.log("DEBUG MIDDLEWARE - req.user:", req.user);

    next();

  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ mensagem: "Token expirado" });
    }

    return res.status(401).json({ mensagem: "Token inválido" });
  }
};

export default authMiddleware;