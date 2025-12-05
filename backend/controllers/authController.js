import jwt from 'jsonwebtoken';
import { read, compare } from '../config/database.js';
import { JWT_SECRET } from '../config/jwt.js';
import { criarUsuario, updateUsuarioSenha} from '../models/usuario.js';
import generateHashedPassword from '../utils/hashPassword.js';
import { fileURLToPath } from 'url';

import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cadastroUsuarioController = async (req, res) => {
  try {
    const { funcionario_id, senha, departamento_id } = req.body;

    if (!funcionario_id || !senha || !departamento_id) {
      return res.status(400).json({ mensagem: "Campos obrigatórios ausentes" });
    }

    // Gera hash da senha
    const senhaHash = await generateHashedPassword(senha);

    const usuarioData = {
      funcionario_id,
      senha: senhaHash,
      departamento_id,
      status: "ativo",
    };

    const usuarioId = await criarUsuario(usuarioData);

    res.status(201).json({ mensagem: "Usuário criado com sucesso", id: usuarioId });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res.status(500).json({ mensagem: "Erro ao criar usuário" });
  }
};

const alterarSenhaController = async (req, res) => {
  try {
    const { senha } = req.body;
    const usuarioId = req.params.id;

    if (!senha) {
      return res.status(400).json({ mensagem: "Campo 'senha' obrigatório" });
    }

    const senhaHash = await generateHashedPassword(senha);

    await updateUsuarioSenha(usuarioId, senhaHash);

    res.status(200).json({ mensagem: "Senha alterada com sucesso" });
  } catch (err) {
    console.error("Erro ao alterar senha:", err);
    res.status(500).json({ mensagem: "Erro ao alterar senha" });
  }
};



const loginController = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const resultado = await read(
      'usuarios u JOIN funcionarios f ON f.id = u.funcionario_id LEFT JOIN departamento d ON u.departamento_id = d.id',
      `f.email = '${email}'`,
      'u.*, f.nome, f.email, f.status AS status_funcionario, d.departamento'
    );

    const usuario = Array.isArray(resultado) ? resultado[0] : resultado;

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    // Verifica se o funcionário está inativo
    if (usuario.status_funcionario === 'inativo') {
      return res.status(403).json({ mensagem: 'Funcionário inativo. Acesso negado.' });
    }

    // compara senha
    const senhaCorreta = await compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: 'Senha incorreta' });
    }

    // gera token
    const token = jwt.sign(
      { id: usuario.id, departamento: usuario.departamento, nome: usuario.nome, status: usuario.status_funcionario },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ mensagem: 'Login realizado com sucesso', token, usuario });

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ mensagem: 'Erro ao fazer login' });
  }
};


export { loginController, cadastroUsuarioController, alterarSenhaController };