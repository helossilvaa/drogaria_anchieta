"use client";

import Layout from "@/components/layout/layout";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { ChartPieLegend } from "@/components/graficoPizzaComLegenda/grafico";
import { ChartHorarios } from "@/components/graficoHorarios/grafico";

export default function Page() {
  const [totalFuncionarios, setTotalFuncionarios] = useState(0);
  const [alertasEstoque, setAlertasEstoque] = useState([]);
  const [totalVendasHoje, setTotalVendasHoje] = useState(0); // valor em R$
  const [totalProdutosVendidosHoje, setTotalProdutosVendidosHoje] = useState(0); // quantidade de produtos
  const [topProdutos, setTopProdutos] = useState([]);
  const getToken = () => localStorage.getItem("token");
  const API_URL = "http://localhost:8080";

  useEffect(() => {
    async function carregarQuantidade() {
      try {
        const res = await fetch(`${API_URL}/funcionarios/unidade/quantidade`, {
          method: "GET",
          credentials: "include",
          headers: { Authorization: `Bearer ${getToken()}` },
        });

        const data = await res.json();
        setTotalFuncionarios(data.quantidade);
      } catch (error) {
        console.error("Erro ao buscar quantidade da unidade:", error);
      }
    }

    async function carregarAlertas() {
      try {
        const res = await fetch(`${API_URL}/estoqueFilial/alertas/baixa-quantidade`, {
          method: "GET",
          credentials: "include",
          headers: { Authorization: `Bearer ${getToken()}` },
        });

        const data = await res.json();
        console.log("Alertas recebidos:", data);
        setAlertasEstoque(data);
      } catch (error) {
        console.error("Erro ao buscar alertas de estoque:", error);
      }
    }

    async function carregarTotais() {
      try {
        // Buscar total de vendas e produtos vendidos em um único endpoint
        const res = await fetch(`${API_URL}/vendasPorFilial/totais-hoje`, {
          method: "GET",
          credentials: "include",
          headers: { Authorization: `Bearer ${getToken()}` },
        });

        const data = await res.json();
        setTotalVendasHoje(data.totalVendas); // valor em R$
        setTotalProdutosVendidosHoje(data.totalProdutosVendidos); // quantidade de produtos
      } catch (error) {
        console.error("Erro ao buscar totais:", error);
      }
    }

    async function carregarTopProdutos() {
      try {
        const res = await fetch(`${API_URL}/vendasPorFilial/top-produtos`, {
          method: "GET",
          credentials: "include",
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();
        setTopProdutos(data);
      } catch (err) {
        console.error("Erro ao buscar top produtos:", err);
      }
    }

    carregarTopProdutos();
    carregarQuantidade();
    carregarAlertas();
    carregarTotais();
  }, []);

  return (
    <Layout>
      <main className="flex flex-1 flex-col gap-4 p-4">
        {/* Status principais de vendas e funcionários */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 rounded-xl shadow-sm">
            <CardContent>
              <p className="text-sm text-gray-500">Vendas de hoje</p>
              <p className="text-2xl font-bold">
                R${Number(totalVendasHoje).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="p-4 rounded-xl shadow-sm">
            <CardContent>
              <p className="text-sm text-gray-500">Total de produtos vendidos hoje</p>
              <p className="text-2xl font-bold">{totalProdutosVendidosHoje}</p>
            </CardContent>
          </Card>

          <Card className="p-4 rounded-xl shadow-sm">
            <CardContent>
              <p className="text-sm text-gray-500">Total de funcionários da unidade</p>
              <p className="text-2xl font-bold">{totalFuncionarios}</p>
            </CardContent>
          </Card>
        </div>

        {/* Cards dos produtos mais vendidos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="p-4 rounded-xl shadow-sm col-span-2">
            <CardContent>
              <h2 className="font-semibold mb-4">Produtos mais vendidos</h2>
              <div className="space-y-4">
                {topProdutos.length > 0 ? (
                  topProdutos.map((prod, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-3 border rounded-xl bg-white shadow-sm hover:shadow-md transition"
                    >
                      <img
                        src={`${API_URL}/uploads/produtos/${prod.foto}`}
                        className="w-16 h-10 object-cover rounded-md border"
                        alt="Produto"
                      />

                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{prod.nome}</p>
                        <p className="text-sm text-gray-500">
                          Preço: R$ {Number(prod.preco_unitario).toFixed(2)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold">{prod.total_vendido}</p>
                        <p className="text-xs text-gray-500">vendidos</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Nenhuma venda registrada ainda.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Seção de gráfico para as categorias de produtos mais vendidos */}
          <Card className="p-4 rounded-xl shadow-sm">
            <CardContent>
              <h2 className="font-semibold mb-4">Top categorias</h2>
              <ChartPieLegend />
            </CardContent>
          </Card>
        </div>

        {/* Parte de quantidades de vendas por dia */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="p-4 rounded-xl shadow-sm col-span-2">
            <CardContent>
              <h2 className="font-semibold mb-4">Horários de mais vendas</h2>
              <ChartHorarios />
            </CardContent>
          </Card>

          {/* Alertas de estoque */}
          <Card className="p-4 rounded-xl shadow-sm">
            <CardContent>
              <h2 className="font-semibold mb-4">Alertas de estoque</h2>
              <div className="space-y-3">
                {Array.isArray(alertasEstoque) && alertasEstoque.length > 0 ? (
                  alertasEstoque.slice(0, 4).map((item, index) => (
                    <div
                      key={index}
                      className={`p-3 border rounded-xl ${item.quantidade <= item.estoque_minimo
                        ? "bg-red-300 border-red-700"
                        : "bg-red-100 border-red-300"
                        }`}
                    >
                      {item.produto_nome ?? `Produto ${item.produto_id}`} — Estoque: {item.quantidade}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Nenhum produto com estoque baixo</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </Layout>
  );
}