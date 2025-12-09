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

  // Métricas da página
  const [totais, setTotais] = useState({
    total: 0,
    ativos: 0,
    inativos: 0,
  });

  // Fetch principal
  const fetchDadosMatriz = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/funcionarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setFuncionarios(data);

      const total = data.length;
      const ativos = data.filter((f) => f.status === "ativo").length;
      const inativos = data.filter((f) => f.status !== "ativo").length;

      setTotais({ total, ativos, inativos });
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    }
  };

  useEffect(() => {
    fetchDadosMatriz();
  }, []);

  // Cards principais
  const metricas = [
    { title: "Total de Funcionários", amount: totais.total, growth: 0 },
    { title: "Ativos", amount: totais.ativos, growth: 0 },
    { title: "Inativos", amount: totais.inativos, growth: 0 },
  ];

  return (
    <Layout>
      {/* Container geral*/}
      <div className="w-full p-3 sm:p-5 overflow-x-hidden">

        {/* Header*/}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold">Funcionários</h1>
          <div className="w-full sm:w-auto">
            <DialogNovoFuncionario onCriado={fetchDadosMatriz} />
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">

          {/* Tabs responsivos */}
          <TabsList className="flex flex-wrap gap-2 sm:gap-4">
            <TabsTrigger className="flex-1 sm:flex-none" value="dashboard">
              Dashboard
            </TabsTrigger>
            <TabsTrigger className="flex-1 sm:flex-none" value="novo">
              Funcionários
            </TabsTrigger>
          </TabsList>

          {/* DASHBOARD */}
          <TabsContent value="dashboard" className="mt-6">

            {/* Cards */}
            <div className="
              grid 
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              gap-4
              sm:gap-6
              mb-6
            ">
              {metricas.map((m) => (
                <CardDashboard
                  key={m.title}
                  title={m.title}
                  amount={m.amount}
                  growth={m.growth}
                  description={m.title}
                />
              ))}
            </div>

            {/* Gráficos com responsividade forte */}
            <div className="
              grid
              grid-cols-1
              lg:grid-cols-2
              gap-4
              sm:gap-6
              mb-6
            ">
              <div className="w-full min-w-0">
                <FuncionariosPorDepartamento />
              </div>

              <div className="w-full min-w-0">
                <FuncionariosPorStatus />
              </div>
            </div>

          </TabsContent>

          {/* TABELA */}
          <TabsContent value="novo" className="mt-6">
            <div className="w-full overflow-x-auto rounded-lg">
              <TableFuncionarios funcionarios={funcionarios} />
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </Layout>
  );
}
