"use client";

import { useState } from "react";
import {
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

export default function SolicitacaoModal({ produto, fechar }) {
    const [quantidade, setQuantidade] = useState("");

   const enviarSolicitacao = async () => {
    try {
        const token = localStorage.getItem("token");

        const produtoId =
            produto.produto_id ??
            produto.id ??
            produto.id_produto ??
            produto.codigo ??
            null;

        const filialId =
            produto.unidade_id ??
            produto.filial_id ??
            produto.estoque_matriz_id ??
            produto.unidadeId ??
            null;

        const qty = Number(quantidade);

        console.log(">> produtoId:", produtoId);
        console.log(">> filialId:", filialId);
        console.log(">> quantidade:", qty);
        console.log(">> token existe?", !!token);
        console.log(">> objeto produto completo:", produto);
        if (!produtoId || !filialId || !qty || isNaN(qty) || qty <= 0) {
            toast.error("Preencha todos os campos corretamente antes de enviar.");
            return;
        }

        const payload = {
            produto_id: produtoId,
            filial_id: filialId,
            quantidade: qty,
        };

        const response = await fetch(
            "http://localhost:8080/movimentacoesestoque/solicitar",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            }
        );

        let data;
        try {
            data = await response.json();
        } catch (err) {
            console.error("Resposta não-JSON do servidor:", err);
            data = { mensagem: "Resposta do servidor não é JSON" };
        }

        if (!response.ok) {
            console.error("Erro do servidor:", data);
            const detalhe = data?.detalhe ? ` (${data.detalhe})` : "";
            toast.error(data.mensagem + detalhe);
            return;
        }

        toast.success("Solicitação enviada com sucesso!");
        fechar();

    } catch (error) {
        console.error("Erro ao solicitar reposição:", error);
        toast.error("Erro inesperado ao solicitar reposição: " + error.message);
    }
};

    return (
        <DialogContent className="bg-white">
            <DialogHeader>
                <DialogTitle>Solicitar Reposição</DialogTitle>
                <DialogDescription>
                    Produto: <b>{produto.nome_produto}</b>
                </DialogDescription>
            </DialogHeader>

            <div className="mt-4">
                <label className="text-gray-700">Quantidade</label>
                <input
                    type="number"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    className="w-full border p-2 rounded mt-1"
                />
            </div>

            <DialogFooter>
                <Button variant="ghost" onClick={fechar}>
                    Cancelar
                </Button>
                <Button onClick={enviarSolicitacao} className="bg-[#79b0b0] hover:bg-[#5d8080]">
                    Enviar
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
