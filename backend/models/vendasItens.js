import { create } from "../config/database.js";
 
const criarItemVenda = async (itemData) => {
    try {
        return await create("vendas_itens", itemData);
    } catch (error) {
        console.error("Erro ao criar item de venda:", error);
        throw error;
    }
};
 
export { criarItemVenda };