"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

import Layout from "@/components/layout/layout";
import DialogNovoFuncionario from "@/components/addFuncionario/addFuncionario";
import TableFuncionarios from "@/components/tableFuncionarios/table";
import { ChartVendasHora } from "@/components/vendasFuncionariosCharts/vendasFuncionariosCharts";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [totais, setTotais] = useState({ total: 0, ativos: 0, novos: 0, verificados: 0 });
  const [crescimento, setCrescimento] = useState({ ativos: 0, novos: 0, verificados: 0 });

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

  const fetchVendas = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/vendas`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    // Montar dados para gráfico: vendas por hora por funcionário
    const chartData = [];
    const horas = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    horas.forEach(hour => {
      const entry = { hour };
      funcionarios.forEach(f => {
        const total = data
          .filter(v => v.funcionarioId === f.id && new Date(v.data).getHours() === parseInt(hour))
          .reduce((sum, v) => sum + parseFloat(v.total), 0);
        entry[f.nome] = total;
      });
      chartData.push(entry);
    });

    setVendas(chartData);
  };

  useEffect(() => {
    fetchFuncionarios();
  }, []);

  useEffect(() => {
    if (funcionarios.length > 0) fetchVendas();
  }, [funcionarios]);

  const MiniIndicador = ({ valor }) => (
    <div className={`flex items-center px-2 py-1 rounded-md text-sm font-medium ${valor >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
      {valor >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
      <span>{Math.abs(valor)}%</span>
    </div>
  );

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
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader><CardTitle>Total de Funcionários</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{totais.total}</span>
                  <MiniIndicador valor={crescimento.ativos} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Ativos</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{totais.ativos}</span>
                  <MiniIndicador valor={crescimento.ativos} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Novos este mês</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{totais.novos}</span>
                  <MiniIndicador valor={crescimento.novos} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Verificados</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{totais.verificados}</span>
                  <MiniIndicador valor={crescimento.verificados} />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartVendasHora data={vendas} funcionarios={funcionarios} />

              <Card className="h-64">
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
