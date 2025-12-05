"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/layout/layout";
import DialogNovoFuncionario from "@/components/addFuncionario/addFuncionario";
import TableFuncionarios from "@/components/tableFuncionarios/table";
import { ChartVendasHora } from "@/components/vendasFuncionariosCharts/vendasFuncionariosCharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CardDashboard  from "@/components/cardFuncionarios/card";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [totais, setTotais] = useState({ total: 0, ativos: 0, novos: 0, verificados: 0 });
  const [crescimento, setCrescimento] = useState({ ativos: 0, novos: 0, verificados: 0 });
  const [periodo, setPeriodo] = useState("30d"); // "7d", "30d", "6m"

  const API_URL = "http://localhost:8080";

  const calcularCrescimento = (atual, anterior) => {
    if (anterior === 0) return atual * 100;
    return Math.round(((atual - anterior) / anterior) * 100);
  };

  const fetchFuncionarios = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/funcionarios/unidade`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setFuncionarios(data);

    const hoje = new Date();
    const mesAnterior = new Date();
    mesAnterior.setMonth(hoje.getMonth() - 1);

    const total = data.length;
    const ativos = data.filter(f => f.status === "ativo").length;
    const novos = data.filter(f => {
      const dt = new Date(f.dataContratacao);
      return dt.getMonth() === hoje.getMonth() && dt.getFullYear() === hoje.getFullYear();
    }).length;
    const verificados = data.filter(f => f.status === "verificado").length;

    const ativosAnterior = data.filter(f => f.status === "ativo" &&
      new Date(f.dataContratacao).getMonth() === mesAnterior.getMonth()).length;
    const novosAnterior = data.filter(f => {
      const dt = new Date(f.dataContratacao);
      return dt.getMonth() === mesAnterior.getMonth();
    }).length;
    const verificadosAnterior = data.filter(f => f.status === "verificado" &&
      new Date(f.dataContratacao).getMonth() === mesAnterior.getMonth()).length;

    setTotais({ total, ativos, novos, verificados });
    setCrescimento({
      ativos: calcularCrescimento(ativos, ativosAnterior),
      novos: calcularCrescimento(novos, novosAnterior),
      verificados: calcularCrescimento(verificados, verificadosAnterior),
    });
  };

  const gerarIntervalo = (periodo) => {
    const hoje = new Date();
    let dias = [];

    if (periodo === "7d") {
      dias = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(hoje.getDate() - (6 - i));
        return d.toISOString().split("T")[0];
      });
    } else if (periodo === "30d") {
      dias = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(hoje.getDate() - (29 - i));
        return d.toISOString().split("T")[0];
      });
    } else if (periodo === "6m") {
      dias = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(hoje.getMonth() - (5 - i));
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      });
    }

    return dias;
  };

  const fetchVendas = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/vendas`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    const mapaUsuarioParaFuncionario = {};
    funcionarios.forEach(f => {
      if (f.usuarioId) {
        mapaUsuarioParaFuncionario[f.usuarioId] = f.id;
      }      
    });

    const dias = gerarIntervalo(periodo);
    const chartData = dias.map((dia) => {
      const entry = { dia };
      funcionarios.forEach((f) => (entry[f.nome] = 0));
      return entry;
    });

    data.forEach((v) => {
      const funcionarioId = mapaUsuarioParaFuncionario[v.usuario_id];
      if (!funcionarioId) return;

      const funcionario = funcionarios.find((f) => f.id === funcionarioId);
      if (!funcionario) return;

      let dia;
      const dt = new Date(v.data);
      if (periodo === "6m") {
        dia = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      } else {
        dia = dt.toISOString().split("T")[0];
      }

      const entry = chartData.find((e) => e.dia === dia);
      if (entry) {
        entry[funcionario.nome] += Number(v.total);
      }
    });

    setVendas(chartData);
  };

  useEffect(() => {
    fetchFuncionarios();
  }, []);

  useEffect(() => {
    if (funcionarios.length > 0) fetchVendas();
  }, [funcionarios, periodo]);

  const metricas = [
    { title: "Total de Funcionários", amount: totais.total, growth: crescimento.ativos, description: "Crescimento este mês" },
    { title: "Ativos", amount: totais.ativos, growth: crescimento.ativos, description: "Funcionários ativos" },
    { title: "Novos este mês", amount: totais.novos, growth: crescimento.novos, description: "Contratações recentes" }
  ];

  return (
    <Layout>
      <div className="w-full p-5">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Funcionários</h1>
          <DialogNovoFuncionario onCriado={fetchFuncionarios} />
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="novo">Funcionários</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="w-full mt-6">
            {/* Cards dinâmicos usando RevenueCard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {metricas.map((m) => (
                <CardDashboard
                  key={m.title}
                  title={m.title}
                  amount={m.amount}
                  growth={m.growth}
                  description={m.description}
                />
              ))}
            </div>

            {/* Gráfico */}
            <div className="w-full mb-6">
              <ChartVendasHora
                data={vendas}
                funcionarios={funcionarios}
                periodo={periodo}
              />
            </div>

            {/* Card de Gerenciamento */}
            <div className="mb-6">
              <Card className="h-full">
                <CardHeader><CardTitle>Gerenciamento</CardTitle></CardHeader>
                <CardContent className="h-full flex items-center justify-center">
                  Em desenvolvimento
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="novo" className="w-full mt-6">
            <TableFuncionarios funcionarios={funcionarios} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
