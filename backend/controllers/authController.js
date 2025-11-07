import jwt from 'jsonwebtoken';
import { read, compare } from '../config/database.js';
import { JWT_SECRET } from '../config/jwt.js';
import { criarUsuario } from '../models/usuario.js';
import generateHashedPassword from '../utils/hashPassword.js';
import { fileURLToPath } from 'url';

import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const cadastroUsuarioController = async (req, res) => {
  try {
    const {
      cpf,
      registro,
      telefone,
      data_nascimento,
      genero,
      nome,
      senha,
      email,
      departamento,
      endereco,
      cidade,
      estado,
      cep,
      numero
    } = req.body;

    const senhaHash = await generateHashedPassword(senha);

    let fotoPath = null;
    if (req.file) {
      fotoPath = `/img/usuarios/${req.file.filename}`;

    };

    const usuarioData = {
      cpf: cpf,
      registro: registro,
      telefone: telefone,
      data_nascimento: data_nascimento,
      genero: genero,
      nome: nome,
      senha: senhaHash,
      email: email,
      departamento: departamento,
      endereco: endereco,
      cidade: cidade,
      estado: estado,
      cep: cep,
      numero: numero,
      foto: fotoPath
    };

    const usuarioId = await criarUsuario(usuarioData);
    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso', id: usuarioId });



  } catch (error) {
    console.error('Erro ao cadastrar usuário: ', error);
    res.status(500).json({ mensagem: 'Erro ao cadastrar novo usuário' })
  }

};


const loginController = async (req, res) => {

  const { email, senha } = req.body;
  console.log(req.body)
  try {

    const resultado = await read(
      'usuarios u LEFT JOIN departamento d ON u.departamento_id = d.id',
      `u.email = '${email}'`,
      'u.*, d.departamento AS departamento'
    );
    
    // garante que sempre pegue o primeiro usuário retornado
    const usuario = Array.isArray(resultado) ? resultado[0] : resultado;
    
    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }
    
    console.log("Usuário autenticado:", usuario.id, usuario.nome);
    
    
    
    // compara senha
    const senhaCorreta = await compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: 'Senha incorreta' });
    }

    // gera token
    const token = jwt.sign(
      { id: usuario.id, departamento: usuario.departamento, nome: usuario.nome, status: usuario.status },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ mensagem: 'Login realizado com sucesso', token, usuario });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ mensagem: 'Erro ao fazer login' });
  }
};


export { loginController, cadastroUsuarioController };