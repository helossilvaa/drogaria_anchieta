"use client";

import Layout from "@/components/layout/layout";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import SolicitacaoModal from "@/components/solicitacaoModal/solicitacaoModal";
import { toast } from "react-toastify";

export default function EstoqueFilialPage() {
  const [estoque, setEstoque] = useState([]);
  const [open, setOpen] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  useEffect(() => {
    carregarEstoque();
  }, []);

  const carregarEstoque = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8080/estoqueFilial", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("ESTOQUE FILIAL:", data);

      if (!response.ok) {
        toast.error(data.mensagem || "Erro ao carregar estoque!");
        return;
      }

      setEstoque(data);
    } catch (error) {
      console.error("Erro ao carregar estoque:", error);
      toast.error("Erro ao carregar estoque!");
    }
  };

  const abrirModal = (produto) => {
    setProdutoSelecionado(produto);
    setOpen(true);
  };

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-white mb-6">
          Estoque da Filial
        </h1>

        {/* GRID DE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {estoque.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-xl bg-gradient-to-br from-white/90 to-gray-100 shadow-lg border border-gray-200 hover:shadow-2xl hover:scale-[1.01] transition-all duration-200"
            >
              <h2 className="font-bold text-xl text-gray-800 mb-2 flex items-center gap-2">
                {item.nome_produto}
              </h2>

              <p className="text-gray-700 text-lg">
                <b>Quantidade:</b> {item.quantidade}
              </p>

              {/* BOLINHA DE STATUS */}
              <div className="mt-3 flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    item.quantidade <= item.estoque_minimo
                      ? "bg-red-500 shadow-red-500 shadow-sm"
                      : item.quantidade >= item.estoque_maximo
                      ? "bg-blue-500 shadow-blue-500 shadow-sm"
                      : "bg-green-500 shadow-green-500 shadow-sm"
                  }`}
                ></span>

                <span className="text-gray-600 text-sm">
                  {item.quantidade <= item.estoque_minimo
                    ? "Estoque baixo"
                    : item.quantidade >= item.estoque_maximo
                    ? "Acima do ideal"
                    : "Normal"}
                </span>
              </div>

              <Button
                className="mt-4 w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg py-2"
                onClick={() => abrirModal(item)}
              >
                Solicitar Reposição
              </Button>
            </div>
          ))}
        </div>

        {/* MODAL */}
        <Dialog open={open} onOpenChange={setOpen}>
          {open && produtoSelecionado && (
            <SolicitacaoModal
              produto={produtoSelecionado}
              fechar={() => setOpen(false)}
            />
          )}
        </Dialog>
      </div>
    </Layout>
  );
}
