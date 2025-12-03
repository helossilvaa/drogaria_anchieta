"use client";
import Layout from "@/components/layout/layout";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircleDollarSign, Users, Package, ShoppingCart, ArrowUp, ArrowDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts";

// API endpoints
const API_VENDAS = "http://localhost:8080/vendas";
const API_CLIENTES = "http://localhost:8080/clientes";
const API_PRODUTOS = "http://localhost:8080/produtos";
const API_TRANSACOES = "http://localhost:8080/transacoes";

function KPICard({ label, value, icon, variation, onClick }) {
  return (
    <Card onClick={onClick} className="cursor-pointer hover:shadow-lg transition-all">
      <CardContent className="flex justify-between items-center gap-4">
        <div>
          <p className="text-gray-500 text-sm">{label}</p>
          <p className="text-2xl font-bold text-pink-600">{value}</p>
          {variation !== undefined && (
            <p className={`text-xs flex items-center gap-1 ${variation >= 0 ? "text-green-600" : "text-red-600"}`}>
              {variation >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
              {Math.abs(variation)}% em relação ao período anterior
            </p>
          )}
        </div>
        {icon}
      </CardContent>
    </Card>
  );
}

function ChartArea({ data, dataKey, title }) {
  const chartConfig = {
    [dataKey]: {
      label: dataKey === "vendas" ? "Vendas" : "Clientes",
      color: dataKey === "vendas" ? "var(--chart-3)" : "var(--chart-2)",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Dados do período selecionado</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart data={data} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="dia" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <Area
              type="natural"
              dataKey={dataKey}
              fill={`var(--color-${dataKey})`}
              fillOpacity={0.4}
              stroke={`var(--color-${dataKey})`}
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-gray-500">Visualização do período selecionado</p>
      </CardFooter>
    </Card>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [activePage, setActivePage] = useState("produtos");
  const [activePeriod, setActivePeriod] = useState("semana");

  const [vendas, setVendas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [produtosVendidos, setProdutosVendidos] = useState(0);
  const [transacoes, setTransacoes] = useState(0);

  useEffect(() => {
    async function carregarDados() {
      try {
        const token = localStorage.getItem("token");

        // Vendas
        const resVendas = await fetch(API_VENDAS, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const dataVendas = await resVendas.json();
        setVendas(dataVendas);

        // Clientes
        const resClientes = await fetch(API_CLIENTES, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const dataClientes = await resClientes.json();
        setClientes(dataClientes);

        // Produtos
        const resProdutos = await fetch(API_PRODUTOS, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const dataProdutos = await resProdutos.json();
        setProdutos(dataProdutos);
        const totalVendidos = dataProdutos.reduce((acc, item) => acc + (item.quantidade_vendida || 0), 0);
        setProdutosVendidos(totalVendidos);

        // Transações
        const resTransacoes = await fetch(API_TRANSACOES, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const dataTransacoes = await resTransacoes.json();
        setTransacoes(dataTransacoes.length);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
    }

    carregarDados();
  }, []);

  // Agrupar vendas por período
  const agruparVendas = () => {
    const agrupado = {};
    const agora = new Date();

    vendas.forEach(venda => {
      const dataObj = new Date(venda.data);
      let key = "";

      if (activePeriod === "hoje") {
        key = dataObj.toLocaleDateString("pt-BR");
      } else if (activePeriod === "semana") {
        const primeiraSegunda = new Date(agora.setDate(agora.getDate() - agora.getDay() + 1));
        key = `Semana ${Math.ceil((dataObj - primeiraSegunda) / (1000*60*60*24*7)) + 1}`;
      } else if (activePeriod === "mes") {
        key = `${dataObj.getMonth()+1}/${dataObj.getFullYear()}`;
      }

      if (!agrupado[key]) agrupado[key] = { dia: key, vendas: 0, clientes: 0 };
      agrupado[key].vendas += Number(venda.total);
      agrupado[key].clientes += 1;
    });

    return Object.values(agrupado);
  };

  const vendasArray = agruparVendas();

  const pages = [
    { label: "Nova venda", path: "novaVenda" },
    { label: "Produtos", path: "produtos" },
    { label: "Programa de Fidelidade", path: "fidelidade" },
  ];

  const periods = ["hoje", "semana", "mes"];

  const kpis = [
    {
      label: "Vendas",
      value: `R$ ${vendas.reduce((acc, v) => acc + Number(v.total), 0)}`,
      icon: <CircleDollarSign size={28} className="text-pink-400" />,
      variation: 12,
      onClick: () => alert("Detalhes das vendas"),
    },
    {
      label: "Clientes Atendidos",
      value: new Set(vendas.map(v => v.cliente_id)).size, // ✅ clientes únicos
      icon: <Users size={28} className="text-pink-400" />,
      variation: -5,
      onClick: () => alert("Detalhes dos clientes"),
    },
    {
      label: "Produtos Vendidos",
      value: produtosVendidos, // ✅ soma da coluna quantidade_vendida
      icon: <Box size={28} className="text-pink-400" />,
      onClick: () => alert("Detalhes dos produtos"),
    },
    {
      label: "Transações",
      value: transacoes,
      icon: <ShoppingCart size={28} className="text-pink-400" />,
      onClick: () => alert("Detalhes das transações"),
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen p-6 bg-gray-50">
        {/* Navegação */}
        <div className="flex flex-wrap gap-4 mb-6">
          {pages.map((page) => {
            const isActive = activePage === page.path;
            return (
              <button
                key={page.label}
                onClick={() => { setActivePage(page.path); router.push(`/pdv/${page.path}`); }}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold transition-all ${
                  isActive ? "bg-pink-600 text-white shadow-lg" : "bg-pink-100 text-pink-600 hover:bg-pink-200"
                }`}
              >
                {page.path === "produtos" && <Package size={20} />}
                {page.path === "caixa" && <CircleDollarSign size={20} />}
                {page.path === "usuarios" && <Users size={20} />}
                {page.label}
              </button>
            );
          })}
        </div>

        {/* Selector de período */}
        <div className="flex gap-6 border-b border-gray-300 mb-6">
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => setActivePeriod(period)}
              className={`pb-2 font-medium ${
                activePeriod === period ? "text-pink-600 border-b-2 border-pink-600" : "text-gray-500 hover:text-pink-600"
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {kpis.map((kpi) => <KPICard key={kpi.label} {...kpi} />)}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartArea data={vendasArray} dataKey="vendas" title="Vendas" />
          <ChartArea data={vendasArray} dataKey="clientes" title="Clientes Atendidos" />
        </div>
      </div>
    </Layout>
  );
}
