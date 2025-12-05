"use client";
import Layout from "@/components/layout/layout";
import React, { useState, useEffect } from "react";
import { CircleDollarSign, Users, ShoppingCart, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { RadialBarChart, RadialBar, PolarGrid, PolarRadiusAxis, Label } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_VENDAS = "http://localhost:8080/vendas";

// KPI Card
function KPICard({ label, value, icon, variation }) {
  return (
    <Card className="cursor-pointer hover:shadow-xl transition-all rounded-xl bg-white min-w-[250px]">
      <CardContent className="flex justify-between items-center gap-4 p-6">
        <div>
          <p className="text-gray-500 text-sm">{label}</p>
          <p className="text-2xl font-bold text-pink-600">{value}</p>
          {variation !== undefined && (
            <p className={`text-xs flex items-center gap-1 ${variation >= 0 ? "text-green-600" : "text-red-600"}`}>
              <TrendingUp size={12} />
              {Math.abs(variation)}% em relação ao período anterior
            </p>
          )}
        </div>
        {icon}
      </CardContent>
    </Card>
  );
}

// Radial Chart
function ChartRadial({ data = [], dataKey = "vendas", title = "", color = "#EC4899" }) {
  const chartConfig = { [dataKey]: { label: title || "", color: color || "#EC4899" } };
  const total = data.reduce((acc, item) => acc + (item[dataKey] || 0), 0);

  return (
    <Card className="flex flex-col rounded-xl shadow-md">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>Dados do período selecionado</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig || {}} className="mx-auto aspect-square max-h-[250px]">
          <RadialBarChart data={data} endAngle={100} innerRadius={80} outerRadius={140}>
            <PolarGrid gridType="circle" radialLines={false} stroke="none" />
            <RadialBar dataKey={dataKey} background fill={color} radius={[10, 10, 10, 10]} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) =>
                  viewBox?.cx !== undefined && viewBox?.cy !== undefined ? (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-4xl font-bold">
                        {total.toLocaleString()}
                      </tspan>
                      <tspan x={viewBox.cx} y={viewBox.cy + 24} className="fill-muted-foreground">
                        {title}
                      </tspan>
                    </text>
                  ) : null
                }
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="text-muted-foreground leading-none">Visualização do período selecionado</div>
      </CardFooter>
    </Card>
  );
}

// Dashboard Principal
export default function Dashboard() {
  const [activePeriod, setActivePeriod] = useState("semana");
  const [vendas, setVendas] = useState([]);
  const [selectedDay, setSelectedDay] = useState("todos"); // dia da semana
  const [selectedMonth, setSelectedMonth] = useState("todos"); // mês

  useEffect(() => {
    async function carregarDados() {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        let userId = null;
        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]));
          userId = payload.id;
        }

        const resVendas = await fetch(API_VENDAS, { headers });
        const dataVendas = await resVendas.json();
        const vendasUsuario = userId ? dataVendas.filter(v => v.usuario_id === userId) : dataVendas;
        setVendas(vendasUsuario);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
    }
    carregarDados();
  }, []);

  // Filtra vendas pelo período e seleção
  const filtrarVendas = () => {
    const hoje = new Date();
    return vendas.filter(venda => {
      const dataObj = new Date(venda.data);
      const diaFormatado = dataObj.toLocaleDateString("pt-BR");
      const mesFormatado = `${dataObj.getMonth() + 1}/${dataObj.getFullYear()}`;
      const diaSemana = dataObj.toLocaleDateString("pt-BR", { weekday: "long" });

      if (activePeriod === "hoje") return diaFormatado === hoje.toLocaleDateString("pt-BR");
      if (activePeriod === "semana") return selectedDay === "todos" || diaSemana === selectedDay;
      if (activePeriod === "mes") return selectedMonth === "todos" || mesFormatado === selectedMonth;
      return false;
    });
  };

  const vendasFiltradas = filtrarVendas();

  // Agrupar vendas para gráfico
  const agruparVendas = () => {
    const agrupado = {};
    const hoje = new Date();

    vendasFiltradas.forEach((venda) => {
      const dataObj = new Date(venda.data);
      const diaFormatado = dataObj.toLocaleDateString("pt-BR");
      const mesFormatado = `${dataObj.getMonth() + 1}/${dataObj.getFullYear()}`;
      const diaSemana = dataObj.toLocaleDateString("pt-BR", { weekday: "long" });

      let key = "";
      if (activePeriod === "hoje") key = diaFormatado;
      else if (activePeriod === "semana") key = selectedDay === "todos" ? diaSemana : selectedDay;
      else if (activePeriod === "mes") key = selectedMonth === "todos" ? mesFormatado : selectedMonth;

      if (!agrupado[key]) agrupado[key] = { dia: key, vendas: 0, clientesSet: new Set() };
      agrupado[key].vendas += Number(venda.total);
      agrupado[key].clientesSet.add(venda.cliente_id);
    });

    return Object.values(agrupado).map(item => ({
      dia: item.dia,
      vendas: item.vendas,
      clientes: item.clientesSet.size,
    }));
  };

  const vendasArray = agruparVendas();

  const periods = ["hoje", "semana", "mes"];
  const diasSemana = ["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"];
  const meses = Array.from({ length: 12 }, (_, i) => `${i + 1}/${new Date().getFullYear()}`);

  // KPIs dinâmicos
  const kpis = [
    { label: "Vendas", value: `R$ ${vendasFiltradas.reduce((acc, v) => acc + Number(v.total), 0).toFixed(2)}`, icon: <CircleDollarSign size={28} className="text-green-800" /> },
    { label: "Clientes Atendidos", value: new Set(vendasFiltradas.map(v => v.cliente_id)).size, icon: <Users size={28} className="text-green-800" /> },
    { label: "Transações", value: vendasFiltradas.length, icon: <ShoppingCart size={28} className="text-green-800" /> },
  ];

  return (
    <Layout>
      <div className="min-h-screen p-6 bg-gray-50">
        {/* Selector de período */}
        <div className="flex gap-6 border-b border-gray-300 mb-6">
          {periods.map(p => (
            <button
              key={p}
              onClick={() => setActivePeriod(p)}
              className={`pb-2 font-medium ${activePeriod === p ? "text-pink-600 border-b-2 border-pink-600" : "text-gray-500 hover:text-pink-600"}`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* Filtros adicionais com Shadcn */}
        {activePeriod === "semana" && (
          <div className="mb-4">
            <label className="mr-2 font-medium">Dia da semana:</label>
            <Select value={selectedDay} onValueChange={v => setSelectedDay(v)}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {diasSemana.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        {activePeriod === "mes" && (
          <div className="mb-4">
            <label className="mr-2 font-medium">Mês:</label>
            <Select value={selectedMonth} onValueChange={v => setSelectedMonth(v)}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {meses.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {kpis.map(kpi => <KPICard key={kpi.label} {...kpi} />)}
        </div>

        {/* Gráficos radiais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartRadial data={vendasArray} dataKey="vendas" title="Vendas" color="#EC4899" />
          <ChartRadial data={vendasArray} dataKey="clientes" title="Clientes Atendidos" color="#F472B6" />
        </div>
      </div>
    </Layout>
  );
}
