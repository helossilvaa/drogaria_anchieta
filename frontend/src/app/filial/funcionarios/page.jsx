"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/layout/layout";
import DialogNovoFuncionario from "@/components/addFuncionario/addFuncionario";
import TableFuncionarios from "@/components/tableFuncionarios/table";
import { ChartVendasHora } from "@/components/vendasFuncionariosCharts/vendasFuncionariosCharts";
import CardDashboard from "@/components/cardFuncionarios/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [totais, setTotais] = useState({ total: 0, ativos: 0, inativos: 0 });
  const [crescimento, setCrescimento] = useState({ ativos: 0, inativos: 0 });
  const [periodo, setPeriodo] = useState("7dias");
  const [funcionarioDestaque, setFuncionarioDestaque] = useState(null);

  const API_URL = "http://localhost:8080";

  const calcularCrescimento = (atual, anterior) => {
    if (anterior === 0) return atual * 100;
    return Math.round(((atual - anterior) / anterior) * 100);
  };

  // Buscar Funcionários
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
    const inativos = data.filter(f => f.status === "inativo").length;

    const ativosAnterior = data.filter(f =>
      f.status === "ativo" &&
      new Date(f.dataContratacao).getMonth() === mesAnterior.getMonth()
    ).length;

    const inativosAnterior = data.filter(f =>
      f.status === "inativo" &&
      new Date(f.dataContratacao).getMonth() === mesAnterior.getMonth()
    ).length;

    setTotais({ total, ativos, inativos });
    setCrescimento({
      ativos: calcularCrescimento(ativos, ativosAnterior),
      inativos: calcularCrescimento(inativos, inativosAnterior),
    });
  };

  // Gerar intervalo
  const gerarIntervalo = (periodo) => {
    const hoje = new Date();

    if (periodo === "7dias") {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(hoje);
        d.setDate(hoje.getDate() - (6 - i));
        return d.toISOString().split("T")[0];
      });
    }

    if (periodo === "30dias") {
      return Array.from({ length: 30 }, (_, i) => {
        const d = new Date(hoje);
        d.setDate(hoje.getDate() - (29 - i));
        return d.toISOString().split("T")[0];
      });
    }

    if (periodo === "6meses") {
      return Array.from({ length: 6 }, (_, i) => {
        const d = new Date(hoje);
        d.setDate(1);
        d.setMonth(hoje.getMonth() - (5 - i));
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      });
    }

    return [];
  };

  // Buscar vendas
  const fetchVendas = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/vendas`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    const mapaUsuarioParaFuncionario = {};
    funcionarios.forEach(f => {
      if (f.usuarioId) mapaUsuarioParaFuncionario[f.usuarioId] = f.id;
    });

    const dias = gerarIntervalo(periodo);

    const chartData = dias.map(dia => {
      const entry = { dia };
      funcionarios.forEach(f => (entry[f.nome] = 0));
      return entry;
    });

    data.forEach(v => {
      const funcionarioId = mapaUsuarioParaFuncionario[v.usuario_id];
      if (!funcionarioId) return;

      const funcionario = funcionarios.find(f => f.id === funcionarioId);
      if (!funcionario) return;

      const dt = new Date(v.data);
      const dia = periodo === "6meses"
        ? `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`
        : dt.toISOString().split("T")[0];

      const entry = chartData.find(e => e.dia === dia);
      if (entry) entry[funcionario.nome] += Number(v.total);
    });

    setVendas(chartData);
  };

  // Funcionário destaque
  const fetchFuncionarioDestaque = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/funcionarios/destaque`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return setFuncionarioDestaque(null);

      const data = await res.json();
      setFuncionarioDestaque(data);
    } catch (err) {
      console.error("Erro ao buscar funcionário destaque:", err);
    }
  };

  useEffect(() => { fetchFuncionarios(); }, []);
  useEffect(() => { if (funcionarios.length > 0) fetchVendas(); }, [funcionarios, periodo]);
  useEffect(() => { fetchFuncionarioDestaque(); }, []);

  // cards de metricas gerais sobre funcionários da filial
  const metricas = [
    {
      title: "Total de Funcionários",
      amount: totais.total,
      growth: crescimento.ativos + crescimento.inativos, 
      description: "Total cadastrado",
    },
    {
      title: "Ativos",
      amount: totais.ativos,
      growth: crescimento.ativos,
      description: "Funcionários ativos",
    },
    {
      title: "Inativos",
      amount: totais.inativos,
      growth: crescimento.inativos,
      description: "Funcionários inativos",
    },
  ];

  return (
    <Layout>
      <div className="w-full p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Funcionários</h1>
          <DialogNovoFuncionario onCriado={fetchFuncionarios} />
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="flex flex-wrap gap-2">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="novo">Funcionários</TabsTrigger>
          </TabsList>

          {/* DASHBOARD */}
          <TabsContent value="dashboard" className="w-full mt-6">

            {/* MÉTRICAS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {metricas.map(m => (
                <CardDashboard
                  key={m.title}
                  title={m.title}
                  amount={m.amount}
                  growth={m.growth}
                  description={m.description}
                />
              ))}
            </div>

            {/* GRÁFICO + FUNCIONARIO DESTAQUE */}
            <div className="flex flex-col lg:flex-row gap-6 mb-6 w-full">
              
              <div className="flex-1 w-full">
                <ChartVendasHora
                  data={vendas}
                  funcionarios={funcionarios}
                  periodo={periodo}
                  onPeriodoChange={setPeriodo}
                  className="w-full h-[350px] sm:h-[400px] lg:h-[450px]"
                />
              </div>

              <div className="flex-shrink-0 w-full lg:w-[300px]">
                {funcionarioDestaque ? (
                  <Card className="shadow-lg border-2">
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg font-semibold text-black text-center">
                        FUNCIONÁRIO DESTAQUE
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="flex flex-col items-center text-center p-6">
                      <Avatar className="w-20 h-20 mb-3 border-4 border-yellow-400">
                        <AvatarImage src={funcionarioDestaque.foto ? `http://localhost:8080${funcionarioDestaque.foto}` : undefined} />
                        <AvatarFallback>{funcionarioDestaque.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>

                      <div className="text-xl font-bold mb-1">{funcionarioDestaque.nome}</div>
                      <div className="text-sm text-muted-foreground">{funcionarioDestaque.departamentoNome || "Vendas"}</div>
                    </CardContent>

                    <CardFooter className="flex flex-col items-center p-4">
                      <p className="text-sm text-green-700 font-medium">Total de vendas no mês</p>
                      <div className="text-2xl font-bold">{funcionarioDestaque.total_vendas}</div>
                    </CardFooter>
                  </Card>
                ) : (
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle>Destaque do Mês</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-muted-foreground pt-6">
                      Nenhuma venda registrada este mês.
                    </CardContent>
                  </Card>
                )}
              </div>

            </div>
          </TabsContent>

          {/* TABELA DE FUNCIONARIOS */}
          <TabsContent value="novo" className="w-full mt-6">
            <div className="overflow-x-auto w-full">
              <TableFuncionarios funcionarios={funcionarios} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
