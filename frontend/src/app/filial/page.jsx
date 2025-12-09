"use client";

import Layout from "@/components/layout/layout";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { ChartPieLegend } from "@/components/graficoPizzaComLegenda/grafico";

export default function Page() {
  const [totalFuncionarios, setTotalFuncionarios] = useState(0);
  const [alertasEstoque, setAlertasEstoque] = useState([]);
  const [totalProdutosVendidos, setTotalProdutosVendidos] = useState(0);
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
          headers: { Authorization: `Bearer ${getToken()}` }
        });

        const data = await res.json();
        setAlertasEstoque(data);
      } catch (error) {
        console.error("Erro ao buscar alertas de estoque:", error);
      }
    }

    async function carregarTotalVendasHoje() {
      try {
        const res = await fetch(`${API_URL}/vendas/vendas-hoje`, {
          method: "GET",
          credentials: "include",
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();
        setTotalProdutosVendidos(data.total);
      } catch (error) {
        console.error("Erro ao buscar total de produtos vendidos hoje:", error);
      }
    }

    carregarAlertas();
    carregarQuantidade();
    carregarTotalVendasHoje();
  }, []);

  return (
    <Layout>

      {/*Status principais de vendas e funcionários*/}
      <main className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 rounded-xl shadow-sm">
            <CardContent>
              <p className="text-sm text-gray-500">Vendas de hoje</p>
              <p className="text-2xl font-bold">
                R${Number(totalProdutosVendidos).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="p-4 rounded-xl shadow-sm">
            <CardContent>
              <p className="text-sm text-gray-500">Total de produtos vendidos hoje</p>
              <p className="text-2xl font-bold">{totalProdutosVendidos}</p>
            </CardContent>
          </Card>

          <Card className="p-4 rounded-xl shadow-sm">
            <CardContent>
              <p className="text-sm text-gray-500">Total de funcionários da unidade</p>
              <p className="text-2xl font-bold">{totalFuncionarios}</p>
            </CardContent>
          </Card>
        </div>

        {/*Cards dos produtos mais vendidos*/}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="p-4 rounded-xl shadow-sm col-span-2">
            <CardContent>
              <h2 className="font-semibold mb-4">Produtos mais vendidos</h2>
              <div className="w-full h-48 bg-gray-100 rounded-xl" />
            </CardContent>
          </Card>

          {/*Seção de gráfico para as categorias de produtos mais vendidos*/}
          <Card className="p-4 rounded-xl shadow-sm">
            <CardContent>
              <h2 className="font-semibold mb-4">Top categorias</h2>
              <ChartPieLegend />
            </CardContent>
          </Card>
        </div>

        {/*Parte de quantidades de vendas por dia*/}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="p-4 rounded-xl shadow-sm col-span-2">
            <CardContent>
              <h2 className="font-semibold mb-4">Horários de mais vendas</h2>
              <div className="w-full h-48 bg-gray-100 rounded-xl" />
            </CardContent>
          </Card>
          {/*Alertas de estoque*/}
          <Card className="p-4 rounded-xl shadow-sm">
            <CardContent>
              <h2 className="font-semibold mb-4">Alertas de estoque</h2>
              <div className="space-y-3">
                {Array.isArray(alertasEstoque) && alertasEstoque.length > 0 ? (
                  alertasEstoque.map((item, index) => (
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