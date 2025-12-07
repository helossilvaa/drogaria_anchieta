"use client";

import Layout from "@/components/layout/layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function Page() {
  const [totalFuncionarios, setTotalFuncionarios] = useState(0);
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

  carregarQuantidade();
}, []);

  return (
    <Layout>

      {/*Status principais de vendas e funcionários*/}
      <main className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 rounded-xl shadow-sm">
            <CardContent>
              <p className="text-sm text-gray-500">Vendas de hoje</p>
              <p className="text-2xl font-bold">R$200,00</p>
            </CardContent>
          </Card>

          <Card className="p-4 rounded-xl shadow-sm">
            <CardContent>
              <p className="text-sm text-gray-500">Total de produtos vendidos</p>
              <p className="text-2xl font-bold">10</p>
            </CardContent>
          </Card>

          <Card className="p-4 rounded-xl shadow-sm">
            <CardContent>
              <p className="text-sm text-gray-500">Total de funcionários da unidade</p>
              <p className="text-2xl font-bold">{totalFuncionarios}</p>
            </CardContent>
          </Card>
        </div>

        {/*Funil de Vendas*/}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="p-4 rounded-xl shadow-sm col-span-2">
            <CardContent>
              <h2 className="font-semibold mb-2">Funil de vendas</h2>
              <div className="w-full h-40 bg-gray-100 rounded-xl" />
            </CardContent>
          </Card>

          {/*Seção de gráfico para as categorias de produtos mais vendidos*/}
          <Card className="p-4 rounded-xl shadow-sm">
            <CardContent>
              <h2 className="font-semibold mb-4">Top categorias</h2>
              <div className="w-full h-40 bg-gray-100 rounded-xl mb-4" />
              <ul className="text-sm space-y-1">
                <li>🟣 Cosméticos — 21,4%</li>
                <li>🟡 Remédios — 20%</li>
                <li>🟢 Conveniência — 17,8%</li>
              </ul>
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

          {/*Alertas de estoque*/}
          <Card className="p-4 rounded-xl shadow-sm">
            <CardContent>
              <h2 className="font-semibold mb-4">Alertas de estoque</h2>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 border rounded-xl">Buscopam 250g — Baixo</div>
                <div className="p-3 bg-red-50 border rounded-xl">Buscopam 250g — Baixo</div>
                <div className="p-3 bg-yellow-50 border rounded-xl">Buscopam 250g — Alerta</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/*Parte de quantidades de vendas por dia*/}
        <Card className="p-4 rounded-xl shadow-sm">
          <CardContent>
            <h2 className="font-semibold mb-4">Quantidade de vendas por dia</h2>
            <div className="w-full h-48 bg-gray-100 rounded-xl" />
          </CardContent>
        </Card>
      </main>
    </Layout>
  );
}