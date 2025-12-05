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
      foto: f.foto ? f.foto : null 
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

    
    funcionario.foto = funcionario.foto ?? null;

    res.status(200).json(funcionario);

  } catch (error) {
    console.error("Erro ao obter funcionário por id:", error);
    res.status(500).json({ mensagem: "Erro ao obter funcionário por id", error });
  }
};


// criar funcionário
const criarFuncionarioController = async (req, res) => {
  try {

    let dados = {};

    
    if (req.body.data) {
      dados = JSON.parse(req.body.data);
    }

    let fotoUrl = null;

    if (req.file) {
      fotoUrl = `/uploads/funcionarios/${req.file.filename}`;
    }

    const registro = Math.floor(10000000 + Math.random() * 90000000);

    const novoFuncionarioData = {
      registro,
      cpf: dados.cpf,
      telefone: dados.telefone,
      data_nascimento: dados.data_nascimento,
      genero: dados.genero,
      nome: dados.nome,
      email: dados.email,
      departamento_id: dados.departamento_id,
      logradouro: dados.logradouro,
      cidade: dados.cidade,
      estado: dados.estado,
      cep: dados.cep,
      numero: dados.numero,
      unidade_id: dados.unidade_id ?? null,
      foto: fotoUrl
    };

    const novo = await criarFuncionario(novoFuncionarioData);

    res.status(201).json({
      mensagem: "Funcionário criado com sucesso",
      registro,
      novo
    });

  } catch (error) {
    console.error("Erro ao criar funcionário:", error);
    res.status(500).json({ mensagem: "Erro ao criar funcionário", error });
  }
};


// atualizar funcionário
const atualizarFuncionarioController = async (req, res) => {
  try {
    const funcionario = await obterFuncionarioId(req.params.id);

    if (!funcionario) {
      return res.status(404).json({ mensagem: "Funcionário não encontrado" });
    }

    
    const fotoUrl = req.file
      ? `/uploads/funcionarios/${req.file.filename}`
      : funcionario.foto;

    const funcionarioData = {
      registro: req.body.registro ?? funcionario.registro,
      cpf: req.body.cpf ?? funcionario.cpf,
      telefone: req.body.telefone ?? funcionario.telefone,
      data_nascimento: req.body.data_nascimento ?? funcionario.data_nascimento,
      genero: req.body.genero ?? funcionario.genero,
      nome: req.body.nome ?? funcionario.nome,
      email: req.body.email ?? funcionario.email,
      departamento_id: req.body.departamento_id ?? funcionario.departamento_id,
      logradouro: req.body.logradouro ?? funcionario.logradouro,
      cidade: req.body.cidade ?? funcionario.cidade,
      estado: req.body.estado ?? funcionario.estado,
      cep: req.body.cep ?? funcionario.cep,
      numero: req.body.numero ?? funcionario.numero,
      unidade_id: req.body.unidade_id ?? funcionario.unidade_id,
      foto: fotoUrl
    };

    await atualizarFuncionario(req.params.id, funcionarioData);

    res.status(200).json({ mensagem: "Dados atualizados com sucesso!" });

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


// mudar status do funcionário
const mudarStatusFuncionarioController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const usuarioDepartamento = req.user.departamento;

    // Só departamentos específicos podem mudar status
    if (usuarioDepartamento !== 'diretor administrativo' && usuarioDepartamento !== 'diretor geral') {
      return res.status(403).json({ mensagem: 'Acesso negado.' });
    }


    await mudarStatusFuncionario(id, status);

    res.status(200).json({ mensagem: `Status alterado para ${status} com sucesso!` });

  } catch (error) {
    console.error("Erro ao mudar status:", error);
    res.status(500).json({ mensagem: "Erro ao alterar status", error });
  }
};


const obterFuncionariosUnidadeController = async (req, res) => {
  try {
   const usuario = req.user; 

    
    if (!usuario || !usuario.unidade_id) { 
      return res.status(400).json({ mensagem: "Usuário ou ID da unidade não encontrado" });
    }

    const unidadeId = usuario.unidade_id;

    
    const funcionarios = await listarFuncionarios();

  
    const funcionariosDaUnidade = funcionarios.filter(f => f.unidade_id === unidadeId);

    res.status(200).json(funcionariosDaUnidade);

  } catch (error) {
    console.error("Erro ao listar funcionários da unidade:", error);
    res.status(500).json({ mensagem: "Erro ao listar funcionários da unidade", error });
  }
};


export {
  listarFuncionariosController,
  obterFuncionarioIdController,
  criarFuncionarioController,
  atualizarFuncionarioController,
  deletarFuncionarioController,
  mudarStatusFuncionarioController,
  obterFuncionariosUnidadeController
};
