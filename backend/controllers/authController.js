import jwt from 'jsonwebtoken';
import { readJoin, compare } from '../config/database.js';
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

  try {
    const resultado = await readJoin({
      baseTable: 'usuarios u',
      columns: `
        u.*,
        f.nome,
        f.email,
        d.departamento,
        f.unidade_id
      `,
      joins: [
        { table: 'funcionarios f', on: 'f.id = u.funcionario_id' },
        { table: 'departamento d', on: 'u.departamento_id = d.id', type: 'LEFT JOIN' },
        { table: 'unidade uni', on: 'f.unidade_id = uni.id', type: 'LEFT JOIN' }
      ],
      where: `f.email = '${email}'`
    });

    const usuario = resultado[0];

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    // compara senha
    const senhaCorreta = await compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: 'Senha incorreta' });
    }

    // gera token
    const token = jwt.sign(
      { 
        id: usuario.id, 
        departamento: usuario.departamento, 
        nome: usuario.nome, 
        status: usuario.status, 
        unidade_id: usuario.unidade_id  
      },
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