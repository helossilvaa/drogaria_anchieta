"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/layout/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CardDashboard from "@/components/cardFuncionarios/card";
import TableFuncionarios from "@/components/tableFuncionarios/table";
import DialogNovoFuncionario from "@/components/addFuncionario/addFuncionario";
import FuncionariosPorDepartamento from "@/components/graficoDepartamentos/grafico";
import FuncionariosPorStatus from "@/components/graficoStatus/grafico";

export default function FuncionariosMatriz() {
  const API_URL = "http://localhost:8080";

  const [funcionarios, setFuncionarios] = useState([]);

  // Métricas principais da página
  const [totais, setTotais] = useState({
    total: 0,
    ativos: 0,
    inativos: 0,
  });

  // Busca todos os funcionários da matriz
  const fetchDadosMatriz = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/funcionarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setFuncionarios(data);

      // Total geral
      const total = data.length;

      // Quantidade de ativos
      const ativos = data.filter((f) => f.status === "ativo").length;

      // Quantidade de inativos
      const inativos = data.filter((f) => f.status !== "ativo").length;

      // Atualiza métricas
      setTotais({ total, ativos, inativos });

    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    }
  };

  // Carregar dados ao abrir a página
  useEffect(() => {
    fetchDadosMatriz();
  }, []);

  // Cards que aparecem no topo (todos com growth = 0 para evitar NaN)
  const metricas = [
    { title: "Total de Funcionários", amount: totais.total, growth: 0 },
    { title: "Ativos", amount: totais.ativos, growth: 0 },
    { title: "Inativos", amount: totais.inativos, growth: 0 },
  ];

  return (
    <Layout>
      <div className="w-full p-5">

        {/* Título + botão de adicionar funcionário */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Funcionários</h1>
          <DialogNovoFuncionario onCriado={fetchDadosMatriz} />
        </div>

        <Tabs defaultValue="dashboard" className="w-full">

          {/* Navegação entre abas */}
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="novo">Funcionários</TabsTrigger>
          </TabsList>

          {/* Aba Dashboard */}
          <TabsContent value="dashboard" className="mt-6">

            {/* Cards principais (responsivos) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {metricas.map((m) => (
                <CardDashboard
                  key={m.title}
                  title={m.title}
                  amount={m.amount}
                  growth={m.growth} // evita NaN
                  description={m.title}
                />
              ))}
            </div>

            {/* Gráficos lado a lado no desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <FuncionariosPorDepartamento />
              <FuncionariosPorStatus />
            </div>

          </TabsContent>

          {/* Aba tabela completa */}
          <TabsContent value="novo" className="mt-6">
            <TableFuncionarios funcionarios={funcionarios} />
          </TabsContent>

        </Tabs>
      </div>
    </Layout>
  );
}
