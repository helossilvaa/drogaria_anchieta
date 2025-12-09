import{
    listarVenda,
    obterVendaPorID,
    atualizarVenda,
    criarVenda
} from "../models/vendas.js";

import { criarItemVenda } from "../models/vendasItens.js";
import { query } from "../config/database.js";


const criarVendaController = async (req, res) => {
    try {
        const {
            cliente_id,
            usuario_id,
            unidade_id,
            tipo_pagamento_id,
            desconto_id,     
            desconto_valor,  
            total,
            data,
            itens
        } = req.body;

        const vendaData = {
            cliente_id,
            usuario_id,
            unidade_id,
            tipo_pagamento_id,
            desconto_id,
            desconto_valor,     
            total,
            data
        };

        const novaVenda = await criarVenda(vendaData);

        for (const item of itens) {
            await criarItemVenda({
                venda_id: novaVenda.insertId,
                produto_id: item.produto_id,
                quantidade: item.quantidade,
                preco: item.preco,
                subtotal: item.subtotal
            });
        }

        res.status(201).json({
            mensagem: "Venda criada com sucesso!",
            venda_id: novaVenda.insertId
        });

    } catch (error) {
        console.error("Erro ao criar venda: ", error);
        res.status(500).json({ mensagem: "Erro ao criar venda" });
    }
};


const listarVendaController = async (req, res) => {
    try {
        const Venda = await listarVenda();
        res.status(200).json(Venda);
    }catch (error) {
        console.error('Erro ao listar vendas: ', error);
        res.status(500).json({mensagem: 'Erro ao listar vendas'});
    }
};

const obterVendaPorIDController = async (req, res) => {
    try{
        const {id} = req.params;
        const Venda = await obterVendaPorID(id);

        if (!Venda){
            return res.status(404).json({mensagem: 'Venda não encontrada'});
        }

        res.status(200).json(Venda);
    }catch (error){
        console.error ('Erro ao obter venda por ID: ', error);
        res.status(500).json({mensagem:'Erro ao obter venda'});
    }
};


const atualizarVendaController = async (req, res) =>{
    try{
        const {id} = req.params;
        const {cliente_id, usuario_id, unidade_id, tipo_pagamento_id, desconto_id, total, data} = req.body;

        const VendaExistir = await obterVendaPorID(id);
        if (!VendaExistir){
            return res.status(404).json({mensagem: 'Venda não encontrada'});
        }
        const VendaData = {id, cliente_id, usuario_id, unidade_id, tipo_pagamento_id, desconto_id, total, data};

        await atualizarVenda (id, VendaData);
        res.status(200).json({mensagem:'Venda atualizada'});
    }catch (error) {
        console.error('Erro ao atualizar: ', error);
        res.status(500).json({mensagem: 'Erro ao atualizar'});
    }
};

//evolucao geral de vendas de todas as redes
const evolucaoVendasMensalController = async (req, res) => {
  try {
    const sql = `
      SELECT DATE_FORMAT(data, '%Y-%m') AS mes,
             COALESCE(SUM(total), 0) AS total_vendas
      FROM vendas
      GROUP BY mes
      ORDER BY mes ASC
    `;

    const dados = await query(sql);
    res.status(200).json(dados);
  } catch (error) {
    console.error("Erro ao gerar evolução mensal de vendas:", error);
    res.status(500).json({ mensagem: "Erro ao gerar evolução mensal de vendas" });
  }
};


const listarVendasPorUnidade = async (req, res) => {
  const unidadeId = req.params.id;
  try {
    const vendas = await query('SELECT * FROM vendas WHERE unidade_id = ?', [unidadeId]);
    res.json(vendas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar vendas' });
  }
};

export{
    criarVendaController,
    listarVendaController,
    obterVendaPorIDController,
    atualizarVendaController,
    evolucaoVendasMensalController,
    listarVendasPorUnidade
};