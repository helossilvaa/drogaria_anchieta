import {readAll} from '../config/database.js';

const listarTipoPagamento = async () =>{
    try{
        return await readAll ('tipos_pagamento');
    }catch (error){
        console.error('Erro ao listar tipo de pagamento: ', error);
        throw error;
    }
};

export {listarTipoPagamento};