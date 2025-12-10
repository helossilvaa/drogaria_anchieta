import { read, update, create } from "../config/database.js";
import { criarMovimentacao } from "../models/movimentacaoEstoque.js";

// Listar solicitações pendentes
export const listarSolicitacoesController = async (req, res) => {
    try {
        const solicitacoes = await read("solicitacoes_estoque", "status = 'pendente'");
        res.json(solicitacoes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Erro ao listar solicitações" });
    }
};


// Enviar lote para filial
export const enviarLoteController = async (req, res) => {
    try {
        const { produto_id, filial_id, quantidade, solicitacao_id } = req.body;

        if (!produto_id || !filial_id || !quantidade || !solicitacao_id) {
            return res.status(400).json({ mensagem: "Dados inválidos para envio." });
        }

        const qty = Number(quantidade);
        if (qty <= 0) {
            return res.status(400).json({ mensagem: "Quantidade inválida." });
        }

        // 1. ESTOQUE MATRIZ
        let estoqueMatrizRaw = await read("estoque_matriz", `produto_id = ${produto_id}`);
        let estoqueMatriz = Array.isArray(estoqueMatrizRaw) ? estoqueMatrizRaw[0] : estoqueMatrizRaw;

        if (!estoqueMatriz) {
            return res.status(400).json({ mensagem: "Produto não encontrado na matriz." });
        }

        if (Number(estoqueMatriz.quantidade) < qty) {
            return res.status(400).json({ mensagem: "Estoque insuficiente na matriz." });
        }

        // 2. SUBTRAIR ESTOQUE MATRIZ
        await update(
            "estoque_matriz",
            { quantidade: Number(estoqueMatriz.quantidade) - qty },
            `produto_id = ${produto_id}`
        );

        // 3. ESTOQUE DA FILIAL (estoque_franquia)
        let estoqueFranquiaRaw = await read(
            "estoque_franquia",
            `produto_id = ${produto_id} AND unidade_id = ${filial_id}`
        );

        let estoqueFranquia = Array.isArray(estoqueFranquiaRaw)
            ? estoqueFranquiaRaw[0]
            : estoqueFranquiaRaw;

        if (estoqueFranquia) {
            await update(
                "estoque_franquia",
                { quantidade: Number(estoqueFranquia.quantidade) + qty },
                `produto_id = ${produto_id} AND unidade_id = ${filial_id}`
            );
        } else {
            await create("estoque_franquia", {
                produto_id,
                unidade_id: filial_id,
                quantidade: qty,
                estoque_matriz_id: estoqueMatriz.id 
            });
        }

        // 4. REGISTRAR MOVIMENTAÇÃO
        try {
            await criarMovimentacao({
                produto_id,
                lote_id: null,
                unidade_id: filial_id,
                tipo_movimento: "envio",
                quantidade: qty,
                data_movimentacao: new Date(),
                usuario_id: req.user?.id || null,
            });
        } catch (err) {
            console.warn("Falha ao registrar movimentação:", err);
        }

        // 5. MARCAR SOLICITAÇÃO COMO ENVIADA
        await update(
            "solicitacoes_estoque",
            { status: "enviado", data_atendimento: new Date() },
            `id = ${solicitacao_id}`
        );

        return res.json({ mensagem: "Lote enviado com sucesso!" });

    } catch (error) {
        console.error("Erro enviarLoteController:", error);
        return res.status(500).json({ mensagem: "Erro ao enviar lote." });
    }
};
