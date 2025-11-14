import {
  listarUsuarios,
  obterUsuarioId,
  atualizarUsuario,
  deletarUsuario
} from "../models/usuario.js";
import generateHashedPassword from '../utils/hashPassword.js';

// listar usuários
const listarUsuariosController = async (req, res) => {
  try {

      const usuarios = await listarUsuarios();
      res.status(200).json(usuarios);

  } catch (error) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({ mensagem: 'Erro ao listar usuários!' });
  }
};

// obter usuário por id
const obterUsuarioIdController = async (req, res) => {
  try {

      const usuario = await obterUsuarioId(req.params.id);

      if (!usuario) {
          return res.status(404).json({ mensagem: 'Usuário não encontrado' });
      }

      res.status(200).json(usuario);

  } catch (error) {
      console.error('Erro ao obter usuário por id:', error);
      res.status(500).json({ mensagem: 'Erro ao obter usuário por id' });
  }
};

// atualizar usuário
const atualizarUsuarioController = async (req, res) => {
  try {
      const usuario = await obterUsuarioId(req.params.id);

      if (!usuario) {
          return res.status(404).json({ mensagem: 'Usuário não encontrado!' });
      }

      const {
        senha,
        departamento_id = usuario.departamento_id,
        funcionario_id = usuario.funcionario_id,
        status = usuario.status,
        foto = usuario.foto
    } = req.body;
    
    const senhaHash = await generateHashedPassword(usuario.senha);
    
    const usuarioData = {
        senha: senhaHash,
        departamento_id,
        funcionario_id,
        status,
        foto
    };

      await atualizarUsuario(req.params.id, usuarioData);
      res.status(200).json({ mensagem: 'Usuário atualizado com sucesso!' });

  } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({ mensagem: 'Erro ao atualizar usuário!' });
  }
};

// deletar usuário
const deletarUsuarioController = async (req, res) => {
  try {

      const usuario = await obterUsuarioId(req.params.id);

      if (!usuario) {
          return res.status(404).json({ mensagem: 'Usuário não encontrado!' });
      }

      await deletarUsuario(req.params.id);
      res.status(200).json({ mensagem: 'Usuário excluído com sucesso!' });

  } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      res.status(500).json({ mensagem: 'Erro ao deletar usuário!' });
  }
};

export {
  listarUsuariosController,
  obterUsuarioIdController,
  atualizarUsuarioController,
  deletarUsuarioController
};
