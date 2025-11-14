import {
    criarFuncionario,
    listarFuncionarios,
    obterFuncionarioId,
    atualizarFuncionario,
    deletarFuncionario,
    mudarStatusFuncionario
  } from '../models/funcionarios.js';
  
  
  // listar funcionários
  const listarFuncionariosController = async (req, res) => {
    try {
      const funcionarios = await listarFuncionarios();
  
      const funcionariosFormatados = funcionarios.map((f) => ({
        ...f,
        foto:
          f.foto && Buffer.isBuffer(f.foto)
            ? `data:image/jpeg;base64,${f.foto.toString("base64")}`
            : null,
      }));
  
      res.status(200).json(funcionariosFormatados);
    } catch (error) {
      console.error("Erro ao listar funcionários:", error);
      res.status(500).json({ mensagem: "Erro ao listar funcionários", error });
    }
  };
  
  // obter funcionário por id
  const obterFuncionarioIdController = async (req, res) => {
    try {
      const funcionario = await obterFuncionarioId(req.params.id);
  
      if (!funcionario) {
        return res.status(404).json({ mensagem: "Funcionário não encontrado" });
      }
  
      // Só tenta converter se realmente existir o campo foto e ele for um Buffer válido
      if (funcionario.foto && Buffer.isBuffer(funcionario.foto) && funcionario.foto.length > 0) {
        let mimeType = "image/jpeg"; // padrão
  
        // tenta detectar o tipo pelos primeiros bytes
        const header = funcionario.foto.toString("hex", 0, 4).toUpperCase();
        if (header.startsWith("89504E47")) mimeType = "image/png";
        else if (header.startsWith("FFD8FF")) mimeType = "image/jpeg";
        else if (header.startsWith("52494646")) mimeType = "image/webp";
        else if (header.startsWith("47494638")) mimeType = "image/gif";
  
        funcionario.foto = `data:${mimeType};base64,${funcionario.foto.toString("base64")}`;
      } else {
        funcionario.foto = null;
      }
  
      res.status(200).json(funcionario);
    } catch (error) {
      console.error("Erro ao obter funcionário por id:", error);
      res.status(500).json({
        mensagem: "Erro ao obter funcionário por id",
        erro: error.message || error,
      });
    }
  };
  
  // criar funcionário
  const criarFuncionarioController = async (req, res) => {
    try {
      let { foto } = req.body;
  
      if (foto && typeof foto === "string" && foto.trim() !== "") {
        try {
          foto = Buffer.from(foto, "base64");
        } catch (err) {
          console.error("Erro ao converter foto base64:", err);
          foto = null;
        }
      } else {
        foto = null;
      }
  
      const novoFuncionarioData = {
        registro: req.body.registro,
        cpf: req.body.cpf,
        telefone: req.body.telefone,
        data_nascimento: req.body.data_nascimento,
        genero: req.body.genero,
        nome: req.body.nome,
        email: req.body.email,
        departamento_id: req.body.departamento_id,
        logradouro: req.body.logradouro,
        cidade: req.body.cidade,
        estado: req.body.estado,
        cep: req.body.cep,
        numero: req.body.numero,
        unidade_id: req.body.unidade_id ?? null,
        foto
      };
  
      const novo = await criarFuncionario(novoFuncionarioData);
      res.status(201).json({ mensagem: "Funcionário criado com sucesso", novo });
    } catch (error) {
      console.error("Erro ao criar funcionário:", error);
      res.status(500).json({ mensagem: "Erro ao criar funcionário", error });
    }
  };
  
  // atualizar funcionário
  const atualizarFuncionarioController = async (req, res) => {
    try {
      const funcionario = await obterFuncionarioId(req.params.id);
      let { foto } = req.body;
  
      if (!funcionario) {
        return res.status(404).json({ mensagem: "Funcionário não encontrado" });
      }
  
      if (foto && typeof foto === "string" && foto.trim() !== "") {
        try {
          foto = Buffer.from(foto, "base64");
        } catch (err) {
          console.error("Erro ao converter foto base64:", err);
          foto = null;
        }
      } else if (foto === null || foto === undefined) {
        foto = funcionario.foto ?? null;
      }
  
      const {
        registro = funcionario.registro,
        cpf = funcionario.cpf,
        telefone = funcionario.telefone,
        data_nascimento = funcionario.data_nascimento,
        genero = funcionario.genero,
        nome = funcionario.nome,
        email = funcionario.email,
        departamento_id = funcionario.departamento_id,
        logradouro = funcionario.logradouro,
        cidade = funcionario.cidade,
        estado = funcionario.estado,
        cep = funcionario.cep,
        numero = funcionario.numero,
        unidade_id = funcionario.unidade_id
      } = req.body;
  
      const funcionarioData = {
        registro,
        cpf,
        telefone,
        data_nascimento,
        genero,
        nome,
        email,
        departamento_id,
        logradouro,
        cidade,
        estado,
        cep,
        numero,
        unidade_id,
        foto
      };
  
      await atualizarFuncionario(req.params.id, funcionarioData);
      res.status(200).json({ mensagem: "Dados do funcionário atualizados com sucesso!" });
    } catch (error) {
      console.error("Erro ao atualizar funcionário:", error);
      res.status(500).json({ mensagem: "Erro ao atualizar funcionário", error });
    }
  };
  
  // deletar funcionário
  const deletarFuncionarioController = async (req, res) => {
    try {
      await deletarFuncionario(req.params.id);
      res.status(200).json({ mensagem: "Funcionário excluído com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar funcionário:", error);
      res.status(500).json({ mensagem: "Erro ao deletar funcionário", error });
    }
  };
  
  // mudar status do funcionário (ativo / inativo) — verifica permissão do usuário atacante
  const mudarStatusFuncionarioController = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const usuarioFuncao = req.usuarioFuncao; // espera que middleware preencha isso
  
      // Só Diretores podem alterar — correção lógica: usar && (se NÃO é um nem outro -> negado)
      if (usuarioFuncao !== 'Diretor Administrativo' && usuarioFuncao !== 'Diretor Geral') {
        return res.status(403).json({ mensagem: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
      }
  
      if (status !== 'ativo' && status !== 'inativo') {
        return res.status(400).json({ mensagem: 'Status inválido. Use "ativo" ou "inativo".' });
      }
  
      await mudarStatusFuncionario(id, status);
      res.status(200).json({ mensagem: `Status do funcionário alterado para ${status} com sucesso!` });
    } catch (error) {
      console.error("Erro ao mudar status do funcionário:", error);
      res.status(500).json({ mensagem: "Erro ao mudar o status do funcionário.", error });
    }
  };
  
  export {
    listarFuncionariosController,
    obterFuncionarioIdController,
    criarFuncionarioController,
    atualizarFuncionarioController,
    deletarFuncionarioController,
    mudarStatusFuncionarioController
  };
  