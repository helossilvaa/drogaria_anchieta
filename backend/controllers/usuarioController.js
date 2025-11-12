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

    const usuariosFormatados = usuarios.map((u) => ({
      ...u,
      foto:
        u.foto && Buffer.isBuffer(u.foto)
          ? `data:image/jpeg;base64,${u.foto.toString("base64")}`
          : null,
    }));

    res.status(200).json(usuariosFormatados);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    res
      .status(500)
      .json({ mensagem: "Erro ao listar usuários", error });
  }
};


const obterUsuarioIdController = async (req, res) => {
  try {
    const usuario = await obterUsuarioId(req.params.id);

    if (!usuario) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    // Só tenta converter se realmente existir o campo foto e ele for um Buffer válido
    if (usuario.foto && Buffer.isBuffer(usuario.foto) && usuario.foto.length > 0) {
      let mimeType = "image/jpeg"; // padrão

      // tenta detectar o tipo pelos primeiros bytes
      const header = usuario.foto.toString("hex", 0, 4).toUpperCase();
      if (header.startsWith("89504E47")) mimeType = "image/png";
      else if (header.startsWith("FFD8FF")) mimeType = "image/jpeg";
      else if (header.startsWith("52494646")) mimeType = "image/webp";
      else if (header.startsWith("47494638")) mimeType = "image/gif";

      usuario.foto = `data:${mimeType};base64,${usuario.foto.toString("base64")}`;
    } else {
      // garante que não manda dado quebrado
      usuario.foto = null;
    }

    res.status(200).json(usuario);
  } catch (error) {
    console.error("Erro ao obter usuário por id:", error);
    res.status(500).json({
      mensagem: "Erro ao obter usuário por id",
      erro: error.message || error,
    });
  }
};



const atualizarUsuarioController = async (req, res) => {
  try {
    
    const usuario = await obterUsuarioId(req.params.id);
    let { foto } = req.body;
    
    if (!usuario) {
      return res.status(404).json({mensagem: 'usuário não encontrado'});
    };

    if (foto && typeof foto === "string" && foto.trim() !== "") {
      try {
        foto = Buffer.from(foto, "base64");
      } catch (err) {
        console.error("Erro ao converter foto base64:", err);
        foto = null;
      }
    } else if (foto === null || foto === undefined) {
      foto = null;
    }
   
    const {
      telefone = usuario.telefone,
      data_nascimento = usuario.data_nascimento,
      genero = usuario.genero,
      nome = usuario.nome,
      senha = usuario.senha,
      email = usuario.email,
      departamento_id = usuario.departamento_id,
      endereco = usuario.endereco,
      cidade = usuario.cidade,
      estado = usuario.estado,
      cep = usuario.cep,
      numero = usuario.numero

    } = req.body;

    const usuarioData = {
      telefone,
      data_nascimento,
      genero,
      nome,
      senha,
      email,
      departamento_id,
      endereco,
      cidade,
      estado,
      cep,
      numero,
      foto
    };

    

    await atualizarUsuario(req.params.id, usuarioData);
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

        
        if (usuarioFuncao !== 'Diretor Administrativo' || 'Diretor Geral') {
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
