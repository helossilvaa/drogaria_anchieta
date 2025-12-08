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
      produto.id_produto ??
      produto.id ??
      produto.codigo ??
      null;

    const filialId =
      produto.unidade_id ??
      produto.estoque_matriz_id ??
      produto.filial_id ??
      produto.unidadeId ??
      null;

    const qty = Number(quantidade);

    const payload = {
      produto_id: produtoId,
      filial_id: filialId,
      quantidade: qty,
    };
    console.log(">> Enviando solicitação - payload:", payload);
    console.log(">> token (existe?):", !!token);
    console.log(">> objeto produto completo:", produto);

    if (!produtoId || !filialId || !qty || isNaN(qty) || qty <= 0) {
      toast.error("Preencha todos os campos corretamente antes de enviar.");
      return;
    }

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
      toast.error(data.mensagem || "Erro ao enviar solicitação");
      return;
    }

    toast.success("Solicitação enviada com sucesso!");
    fechar();

  } catch (error) {
    console.error("Erro ao solicitar reposição:", error);
    toast.error("Erro inesperado ao solicitar reposição");
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
                <Button onClick={enviarSolicitacao} className="bg-pink-600">
                    Enviar
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
