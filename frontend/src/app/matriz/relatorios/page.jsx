"use client";

import Layout from "@/components/layout/layout";
import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from "@/components/ui/card";
import {
  Loader2,
  Users,
  ShoppingCart,
  DollarSign,
  Star,
  Package
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer
} from "recharts";

// ------------------------------
//   DADOS FAKE (evita erro)
// ------------------------------
const dadosFake = {
  vendasResumo: {
    totalVendas: 150,
    vendasHoje: 12,
    ticketMedio: 85.4,
  },
  financeiro: {
    faturamento: 15800,
    despesas: 4300,
    lucro: 11500,
  },
  produtosMaisVendidos: [
    { produto: "Bolo de Chocolate", qtd: 42 },
    { produto: "Coxinha", qtd: 30 },
    { produto: "Suco Natural", qtd: 22 },
  ],
  unidadesDestaque: [
    { unidade: "Matriz", vendas: 87 },
    { unidade: "Filial 2", vendas: 42 },
    { unidade: "Filial 3", vendas: 21 },
  ],
  graficoFaturamento: [
    { mes: "Jan", valor: 1200 },
    { mes: "Fev", valor: 1850 },
    { mes: "Mar", valor: 1600 },
    { mes: "Abr", valor: 2300 },
    { mes: "Mai", valor: 2100 },
    { mes: "Jun", valor: 2800 },
  ],
  graficoProdutos: [
    { nome: "Bolo", vendas: 42 },
    { nome: "Coxinha", vendas: 30 },
    { nome: "Suco", vendas: 22 },
  ],
};

export default function Relatorios() {
  const [dados, setDados] = useState(null);

  useEffect(() => {
    // Quando tiver backend real, trocamos
    setTimeout(() => {
      setDados(dadosFake);
    }, 600);
  }, []);

  if (!dados) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-[#d66678]" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4">

        <h1 className="text-2xl font-bold mb-6">Relatórios Gerais</h1>

        {/* 🔥 RESUMO DE VENDAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-pink-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#d66678]">
                <ShoppingCart /> Total de Vendas
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">
              {dados.vendasResumo.totalVendas}
            </CardContent>
          </Card>

          <Card className="border-pink-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#d66678]">
                <ShoppingCart /> Vendas Hoje
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">
              {dados.vendasResumo.vendasHoje}
            </CardContent>
          </Card>

          <Card className="border-pink-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#d66678]">
                <DollarSign /> Ticket Médio
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">
              R$ {dados.vendasResumo.ticketMedio.toFixed(2)}
            </CardContent>
          </Card>
        </div>

        {/* 💰 FINANCEIRO */}
        <Card className="border-pink-200 shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="text-[#d66678]">Financeiro</CardTitle>
            <CardDescription>Resumo geral de faturamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg bg-[#ffe6ea]">
                <p className="font-semibold">Faturamento</p>
                <p className="text-2xl font-bold text-[#d66678]">
                  R$ {dados.financeiro.faturamento}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[#ffe6ea]">
                <p className="font-semibold">Despesas</p>
                <p className="text-2xl font-bold text-[#d66678]">
                  R$ {dados.financeiro.despesas}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[#ffe6ea]">
                <p className="font-semibold">Lucro</p>
                <p className="text-2xl font-bold text-[#d66678]">
                  R$ {dados.financeiro.lucro}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ⭐ PRODUTOS MAIS VENDIDOS */}
        <Card className="border-pink-200 shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="text-[#d66678] flex items-center gap-2">
              <Package /> Produtos Mais Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dados.produtosMaisVendidos.map((p, i) => (
              <div
                key={i}
                className="flex justify-between p-3 mb-2 rounded-lg bg-[#ffe6ea]"
              >
                <span>{p.produto}</span>
                <span className="font-bold text-[#d66678]">{p.qtd} vendas</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 🏬 UNIDADES EM DESTAQUE */}
        <Card className="border-pink-200 shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="text-[#d66678] flex items-center gap-2">
              <Star /> Unidades em Destaque
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dados.unidadesDestaque.map((u, i) => (
              <div
                key={i}
                className="flex justify-between p-3 mb-2 rounded-lg bg-[#ffe6ea]"
              >
                <span>{u.unidade}</span>
                <span className="font-bold text-[#d66678]">{u.vendas} vendas</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 📊 GRÁFICO DE FATURAMENTO */}
        <Card className="border-pink-200 shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="text-[#d66678]">Gráfico: Faturamento Mensal</CardTitle>
            <CardDescription>Faturamento acumulado mês a mês</CardDescription>
          </CardHeader>
          <CardContent style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dados.graficoFaturamento}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="valor" stroke="#d66678" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 📦 GRÁFICO DE PRODUTOS MAIS VENDIDOS */}
        <Card className="border-pink-200 shadow-sm mb-10">
          <CardHeader>
            <CardTitle className="text-[#d66678]">Gráfico: Produtos Mais Vendidos</CardTitle>
            <CardDescription>Volume de vendas por produto</CardDescription>
          </CardHeader>
          <CardContent style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dados.graficoProdutos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="vendas" fill="#d66678" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </Layout>
  );
}
