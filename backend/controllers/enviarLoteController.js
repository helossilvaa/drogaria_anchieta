import { read, update, create } from "../config/database.js";
import { criarMovimentacao } from "../models/movimentacaoEstoque.js";

export const enviarLoteController = async (req, res) => {
    try {
        const { produto_id, filial_id, quantidade } = req.body;

        const estoqueMatriz = await read(
            "estoque_matriz",
            `produto_id = ${produto_id}`
        );

        if (!estoqueMatriz)
            return res.status(400).json({ mensagem: "Produto não existe na matriz." });

        if (estoqueMatriz.quantidade < quantidade)
            return res.status(400).json({ mensagem: "Quantidade insuficiente na matriz." });

        await update(
            "estoque_matriz",
            { quantidade: estoqueMatriz.quantidade - quantidade },
            `produto_id = ${produto_id}`
        );

        const estoqueFilial = await read(
            "estoque_franquia",
            `produto_id = ${produto_id} AND unidade_id = ${filial_id}`
        );

        if (estoqueFilial) {
            await update(
                "estoque_franquia",
                { quantidade: estoqueFilial.quantidade + quantidade },
                `produto_id = ${produto_id} AND unidade_id = ${filial_id}`
            );
        } else {
            await create("estoque_franquia", {
                produto_id,
                unidade_id: filial_id,
                quantidade
            });
        }

        await criarMovimentacao({
            produto_id,
            unidade_id: filial_id,
            tipo_movimento: "envio",
            quantidade,
            data_movimentacao: new Date(),
            usuario_id: req.user.id
        });

        return res.json({ mensagem: "Lote enviado com sucesso!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Erro ao enviar lote." });
    }
};
