import { obterUsuarioId } from "../models/usuario.js";
import { criarUnidade, listarUnidades, obterunidadeId, atualizarUnidade, deletarUnidade } from "../models/franquia.js";


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

        await atualizarUnidade(unidade, unidadeData);
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
            return res.status(404).json({mensagem: 'Unidade não encontrada'});
        };

        if (req.usuariofuncao != 'matriz') {
            return res.status(403).json({mensagem: 'Função não autorizada'});

        } else {
            await deletarUnidade(unidade);
            res.status(200).json({mensagem: 'Unidade excluída com sucesso', unidade});

        }

    } catch (error) {
        console.error('Erro ao deletar unidade: ', error);
        res.status(500).json({mensagem: 'Erro ao deletar unidade'});
    }
};


const atribuirDiretorAdmController = async (req, res) => {
    try {
        const { unidadeId, diretorId } = req.body;

        const unidade = await obterunidadeId(unidadeId);
        const diretor = await obterUsuarioId(diretorId);

        if (!unidade) return res.status(404).json({ mensagem: 'Unidade não encontrada' });
        if (!diretor) return res.status(404).json({ mensagem: 'Diretor não encontrado' });

        
        unidade.diretorAdm = diretorId;
        await atualizarUnidade(unidadeId, unidade);

        res.status(200).json({ mensagem: `Diretor administrativo atribuído à unidade ${unidade.nome} com sucesso!` });
    } catch (error) {
        console.error('Erro ao atribuir diretor administrativo:', error);
        res.status(500).json({ mensagem: 'Erro ao atribuir diretor administrativo.' });
    }
};

export {criarUnidadeController, listarUnidadesController, obterunidadeIdcontroller, atualizarUnidadeController, deletarUnidadeController, atribuirDiretorAdmController};

