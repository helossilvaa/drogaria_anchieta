import { criarDepartamento, atualizarDepartamento, deletarDepartamento, listarDepartamento, obterDepartamentoId } from "../models/departamento.js";

const criarDepartamentoController = async (req, res) => {
    try {
        const {
            departamento
        } = req.body;

        const departamentoData = {
            departamento: departamento
        };

        const departamentoId = await criarDepartamento(departamentoData);
        res.status(201).json({mensagem: 'Departamento criado com sucesso!', id: departamentoId});
        
    } catch (error) {
        console.error('Erro ao criar departamento', error);
        res.status(500).json({mensagem: 'Erro ao criar departamento'})
    }
};

const listarDepartamentoController = async (req, res) => {
    try {
        const departamentos = await listarDepartamento();
        res.status(200).json(departamentos);
        
    } catch (error) {
        console.error('Erro ao listar departamentos', error);
        res.status(500).json({mensagem: 'Erro ao listar departamentos'})
    }
};

const atualizarDepartamentoController = async (req, res) => {

    try {
        const departamentoId = await obterDepartamentoId(req.params.id);
    
        if(!departamentoId) {
           return res.status(404).json({mensagem: 'Departamento não encontrado'})
        }

        const {
            departamento
        } = req.body;

        const departamentoData = {
           departamento: departamento,
        };

        await atualizarDepartamento(departamentoId, departamentoData);
        res.status(201).json({mensagem: 'Departamento atualizado com sucesso!'});
     
        
    } catch (error) {
        console.error('Erro ao atualizar departamento: ', error);
        res.status(500).json({mensagem: 'Erro ao atualizar departamento!'});
    }
};

const deletarDepartamentoController = async (req, res) => {
    try {

        const departamentoId = await obterDepartamentoId(req.params.id);
    
        if(!departamentoId) {
           return res.status(404).json({mensagem: 'Departamento não encontrado'})
        };

        await deletarDepartamento(departamentoId);
        res.status(201).json({mensagem: 'Departamento deletado com sucesso!'});
        
    } catch (error) {
        console.error('Erro ao deletar departamento: ', error);
        res.status(500).json({mensagem: 'Erro ao deletar departamento!'});
    }
};

const obterDepartamentoIdController = async (req, res) => {
    try {
        const departamentoId = await obterdepartamentoId(req.params.id);
        res.status(201).json(departamentoId);
        
    } catch (error) {
        console.error('Erro ao obter departamento por id: ', error);
        res.status(500).json({mensagem: 'Erro ao obter departamento por id!'});
    }
}

export {deletarDepartamentoController, atualizarDepartamentoController, criarDepartamentoController, obterDepartamentoIdController, listarDepartamentoController};

