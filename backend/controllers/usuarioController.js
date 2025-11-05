import {
  listarUsuarios,
  obterUsuarioId,
  atualizarUsuario,
  mudarStatusFuncionario,
  deletarUsuario
} from '../models/usuario.js';


const listarUsuariosController = async (req, res) => {
  try {
    const usuarios = await listarUsuarios();
    res.status(200).json(usuarios);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ mensagem: 'Erro ao listar usuários', error });
  }
};

const obterUsuarioIdController = async (req, res) => {
  try {
    const usuario = await obterUsuarioId(req.params.id);
    res.status(200).json(usuario);
  } catch (error) {
    console.error('Erro ao obter usuário por id:', error);
    res.status(500).json({ mensagem: 'Erro ao obter usuário por id', error });
  }
};

const atualizarUsuarioController = async (req, res) => {
  try {
    
    const usuario = await obterUsuarioId (req.params.id);
    
    if (!usuario) {
      return res.status(404).json({mensagem: 'usuário não encontrado'});
    };
   
    const {
      telefone = usuario.telefone,
      datanascimento = usuario.data_nascimento,
      genero = usuario.genero,
      nome = usuario.nome,
      senha = usuario.senha,
      email = usuario.email,
      departamento = usuario.departamento_id,
      endereco = usuario.endereco,
      cidade = usuario.cidade,
      estado = usuario.estado,
      cep = usuario.cep,
      numero = usuario.numero,
      foto = usuario.foto

    } = req.body;

    const usuarioData = {
      telefone,
      datanascimento,
      genero,
      nome,
      senha,
      email,
      departamento,
      endereco,
      cidade,
      estado,
      cep,
      numero,
      foto
    };

    await atualizarUsuario(usuario, usuarioData);
    res.status(200).json({mensagem: 'Dados atualizados com sucesso!'})

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({mensagem: 'Erro ao atualizar usuário', error})
  }
};

const deletarUsuarioController = async (req, res) => {
  try {

    const usuarioId = await obterUsuarioId(req.params.id);
    await deletarUsuario(usuarioId);

  } catch (error) {
    console.error('Erro ao deletar usuário: ', error);
    res.status(500).json({mensagem: 'Erro ao deletar usuário', error})
  }
}

const mudarStatusFuncionarioController = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const usuarioFuncao = req.usuarioFuncao;

        
        if (usuarioFuncao !== 'admin') {
            return res.status(403).json({ mensagem: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
        }

        if (status !== 'ativo' && status !== 'inativo') {
            return res.status(400).json({ mensagem: 'Status inválido. Use "ativo" ou "inativo".' });
        }

        await mudarStatusFuncionario(id, status);
        res.status(200).json({ mensagem: `Status do técnico alterado para ${status} com sucesso!` });

    } catch (error) {
        console.error('Erro ao mudar o status do técnico:', error);
        res.status(500).json({ mensagem: 'Erro ao mudar o status do funcionário.', error });
    }
};


export {
  listarUsuariosController,
  obterUsuarioIdController,
  atualizarUsuarioController,
  mudarStatusFuncionarioController,
  deletarUsuarioController
};
