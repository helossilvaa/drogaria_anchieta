"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/layout/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CardDashboard from "@/components/cardFuncionarios/card";
import TableFuncionarios from "@/components/tableFuncionarios/table";
import DialogNovoFuncionario from "@/components/addFuncionario/addFuncionario";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import FuncionariosPorDepartamento from "@/components/graficoDepartamentos/grafico";
import FuncionariosPorStatus from "@/components/graficoStatus/grafico";

export default function FuncionariosMatriz() {
  const API_URL = "http://localhost:8080";

  const [funcionarios, setFuncionarios] = useState([]);
  const [totais, setTotais] = useState({ total: 0, ativos: 0, inativos: 0, novos: 0 });
  const [crescimento, setCrescimento] = useState({ novos: 0 });
  const [departamentosData, setDepartamentosData] = useState([]);
  const [topFuncionarios, setTopFuncionarios] = useState([]);
  const [vendasPorDepartamento, setVendasPorDepartamento] = useState([]);
  const [periodo, setPeriodo] = useState("30dias");

 

  const fetchDadosMatriz = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/funcionarios`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setFuncionarios(data);

      const hoje = new Date();
      const mesAnterior = new Date();
      mesAnterior.setMonth(hoje.getMonth() - 1);

      const total = data.length;
      const ativos = data.filter(f => f.status === "ativo").length;
      const inativos = data.filter(f => f.status !== "ativo").length;
      const novos = data.filter(f => {
        const dt = new Date(f.dataContratacao);
        return dt.getMonth() === hoje.getMonth() && dt.getFullYear() === hoje.getFullYear();
      }).length;

      const novosAnterior = data.filter(f => {
        const dt = new Date(f.dataContratacao);
        return dt.getMonth() === mesAnterior.getMonth() && dt.getFullYear() === mesAnterior.getFullYear();
      }).length;

      setTotais({ total, ativos, inativos, novos });
      setCrescimento({ novos: calcularCrescimento(novos, novosAnterior) });

      // Dados por departamento
      const depMap = {};
      data.forEach(f => {
        const dep = f.departamentoNome || "Sem departamento";
        depMap[dep] = (depMap[dep] || 0) + 1;
      });
      setDepartamentosData(Object.entries(depMap).map(([name, value]) => ({ name, value })));

    } catch (err) {
      console.error("Erro ao carregar dados da matriz:", err);
    }
  };

  const calcularCrescimento = (atual, anterior) => {
    if (anterior === 0) return 100;
    return Math.round(((atual - anterior) / anterior) * 100);
  };

  useEffect(() => { fetchDadosMatriz(); }, []);

  const metricas = [
    { title: "Total de Funcionários", amount: totais.total },
    { title: "Ativos", amount: totais.ativos },
    { title: "Inativos", amount: totais.inativos },
    { title: "Novos este mês", amount: totais.novos, growth: crescimento.novos },
  ];

  return (
    <Layout>
      <div className="w-full p-5">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Funcionários</h1>
          <DialogNovoFuncionario onCriado={fetchDadosMatriz} />
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="novo">Funcionários</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
         
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {metricas.map(m => (
                <CardDashboard key={m.title} title={m.title} amount={m.amount} growth={m.growth} description={m.title} />
              ))}
            </div>

            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <FuncionariosPorDepartamento/>
                <FuncionariosPorStatus/>
            
            </div>

            {/* Top funcionários */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topFuncionarios.map(f => (
                <Card key={f.id} className="shadow-lg border-2">
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg font-semibold text-black text-center">{f.nome}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center text-center p-6">
                    <Avatar className="w-20 h-20 mb-3 border-4 border-yellow-400">
                      <AvatarImage src={f.foto ? `http://localhost:8080${f.foto}` : undefined} />
                      <AvatarFallback>{f.nome.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm text-muted-foreground">{f.departamentoNome || "Sem departamento"}</div>
                    <div className="text-xl font-bold mt-2">{f.totalVendas} vendas</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tabela completa */}
          <TabsContent value="novo" className="mt-6">
            <TableFuncionarios funcionarios={funcionarios} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
