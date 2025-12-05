import { criarUnidade, listarUnidades, obterunidadeId, atualizarUnidade, deletarUnidade } from "../models/franquia.js";
import { obterFuncionarioId, atualizarFuncionario, listarFuncionarios } from "../models/funcionarios.js"; 
import { read, update, query } from '../config/database.js';

const atribuirGerenteAdmController = async (req, res) => {
   try {
        const { funcionario_id, unidadeId } = req.body;

        // Busca o funcionário
        const funcionario = await read('funcionarios', `id = ${funcionario_id}`);
        if (!funcionario) return res.status(404).json({ mensagem: 'Funcionário não encontrado.' });

        // Verifica se ele é do departamento "gerente"
        const departamentoGerente = await read('departamento', `departamento = 'gerente'`);
        if (funcionario.departamento_id !== departamentoGerente.id) {
            return res.status(400).json({ mensagem: 'O funcionário selecionado não é gerente.' });
        }

        // Busca o departamento de Diretor Administrativo
        const departamentoDiretorAdmin = await read('departamento', `departamento = 'diretor administrativo'`);
        if (!departamentoDiretorAdmin) return res.status(404).json({ mensagem: 'Departamento Diretor Administrativo não encontrado.' });

        // Atualiza o funcionário
        await update(
            'funcionarios',
            {
                departamento_id: departamentoDiretorAdmin.id,
                unidade_id: unidadeId
            },
            `id = ${funcionario_id}`
        );

        res.status(200).json({ mensagem: 'Funcionário promovido a Diretor Administrativo com sucesso!' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ mensagem: 'Erro ao promover funcionário.', error: err });
    }
};




// criar franquia
const criarUnidadeController = async (req, res) => {
    try {

        const {
            tipo,
            nome,
            cnpj,
            cidade,
            estado,
            cep,
            numero,
            logradouro,
            telefone,
            email
        } = req.body; 

        const unidadeData = {
            tipo: tipo,
            nome: nome,
            cnpj: cnpj,
            cidade: cidade,
            estado: estado,
            cep: cep,
            numero: numero,
            logradouro: logradouro,
            telefone: telefone,
            email: email
        };

        const unidadeId = await criarUnidade(unidadeData);
        res.status(201).json({mensagem: 'unidade criada com sucesso! : ', id: unidadeId});


    } catch (error) {
        console.error('Erro ao criar unidade: ', error);
        res.status(500).json({mensagem: 'Erro ao criar unidade'});
    }
};

// listar franquia 
const listarUnidadesController = async (req, res) => {
    try {

        const unidades = await listarUnidades();
        res.status(200).json(unidades);

    } catch (error) {
        console.error('Erro ao listar unidades: ', error);
        res.status(500).json({mensagem: 'Erro ao listar unidades!'})
    }
};

// obter uma franquia por id 
const obterunidadeIdcontroller = async (req, res) => {
    try {
        const unidade = await obterunidadeId(req.params.id);
        res.status(200).json(unidade);

    } catch (error) {
        console.error('Erro ao obter unidade por id: ', error);
        res.status(500).json({mensagem: 'Erro ao obter unidade por id'})
    }
};

// atualizar franquia 

const atualizarUnidadeController = async (req, res) => {
    try {
        const unidade = await obterunidadeId(req.params.id);

        if (!unidade) {
           return res.status(404).json({mensagem: 'Unidade não encontrada!'})
        };

        const {
            status = unidade.status,
            tipo = unidade.tipo,
            nome = unidade.nome,
            cnpj = unidade.cnpj,
            endereco = unidade.endereco,
            cidade = unidade.cidade,
            estado = unidade.estado,
            cep = unidade.cep,
            numero = unidade.numero,
            logradouro = unidade.logradouro,
            telefone = unidade.telefone,
            email = unidade.email
        } = req.body;


        const unidadeData = {
            status,
            tipo,
            nome,
            cnpj,
            endereco,
            cidade,
            estado,
            cep,
            numero,
            logradouro,
            telefone,
            email
        };

        await atualizarUnidade(unidade.id, unidadeData);
        res.status(200).json({mensagem: 'Unidade atualizada com sucesso!'});

        
    } catch (error) {
        console.error('Erro ao atualizar unidade: ', error);
        res.status(500).json({mensagem: 'Erro ao atualizar unidade!'});
    }
};

// deletar uma franquia
const deletarUnidadeController = async (req, res) => {
  try {
    const unidade = await obterunidadeId(req.params.id); 

    if (!unidade) {
      return res.status(404).json({ mensagem: 'Unidade não encontrada' });
    }

    
    if (req.user.departamento !== "diretor geral") {
      return res.status(403).json({ mensagem: 'Função não autorizada: apenas membros do Diretor Geral podem deletar unidades' });
    }

    await deletarUnidade(unidade.id);
    res.status(200).json({ mensagem: 'Unidade excluída com sucesso', unidade });

  } catch (error) {
    console.error('Erro ao deletar unidade: ', error);
    res.status(500).json({ mensagem: 'Erro ao deletar unidade' });
  }
};

const rankingUnidadesController = async (req, res) => {
  try {
    const sql = `
      SELECT u.id, u.nome, COALESCE(SUM(v.total), 0) AS total_vendas
      FROM unidade u
      LEFT JOIN vendas v ON v.unidade_id = u.id
      WHERE u.tipo = 'franquia'
      GROUP BY u.id, u.nome
      ORDER BY total_vendas DESC
      LIMIT 5
    `;
    
    const ranking = await query(sql); // usa a função de query customizada
    res.status(200).json(ranking);
  } catch (error) {
    console.error("Erro ao gerar ranking de unidades:", error);
    res.status(500).json({ mensagem: "Erro ao gerar ranking de unidades" });
  }
};




export {criarUnidadeController, listarUnidadesController, obterunidadeIdcontroller, atualizarUnidadeController, deletarUnidadeController, atribuirGerenteAdmController, rankingUnidadesController};

