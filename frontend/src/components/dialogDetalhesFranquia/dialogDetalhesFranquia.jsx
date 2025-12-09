"use client";

import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  Loader2,
  DollarSign,
  Wallet,
  User,
  AlertTriangle,
  Zap,
  ListOrdered
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card";

import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

// --- Funções Auxiliares de Formatação ---
const formatBRL = value =>
  Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2
  });

const mesesAbreviados = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// --- Componente Principal ---
export default function DialogDetalhesFranquia({ unidadeId, open, onOpenChange }) {
  const API_URL = "http://localhost:8080";
  const token = localStorage.getItem("token");

  const [funcionarios, setFuncionarios] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [salarios, setSalarios] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Mapeamento e Agregação de Dados ---
  const vendasAgregadas = useMemo(() => {
    const vendasPorMes = vendas.reduce((acc, v) => {
      const dataVenda = new Date(v.data);
      const anoMes = dataVenda.toISOString().substring(0, 7);
      const total = Number(v.total || 0);

      if (!acc[anoMes]) {
        acc[anoMes] = {
          mes_ordenado: anoMes,
          mes_exibicao: `${mesesAbreviados[dataVenda.getMonth()]}/${dataVenda.getFullYear().toString().slice(-2)}`,
          total: 0
        };
      }
      acc[anoMes].total += total;
      return acc;
    }, {});

    return Object.values(vendasPorMes)
      .sort((a, b) => a.mes_ordenado.localeCompare(b.mes_ordenado))
      .slice(-12);
  }, [vendas]);

  const totalVendas = useMemo(() =>
    vendas.reduce((acc, v) => acc + Number(v.total || 0), 0),
    [vendas]
  );
  const ticketMedio = useMemo(() => totalVendas / (vendas.length || 1), [totalVendas, vendas.length]);
  const totalFuncionarios = useMemo(() => funcionarios.length, [funcionarios]);
  const totalSalariosPagos = useMemo(() =>
    salarios.reduce((acc, s) =>
      acc + (s.status_pagamento === "pago" ? Number(s.valor || 0) : 0),
      0
    ),
    [salarios]
  );
  const salariosPendentes = useMemo(() =>
    salarios.filter(s => s.status_pagamento && s.status_pagamento.toLowerCase() !== "pago").length,
    [salarios]
  );
  const statusCounts = useMemo(() =>
    funcionarios.reduce((acc, f) => {
      acc[f.status] = (acc[f.status] || 0) + 1;
      return acc;
    }, {}),
    [funcionarios]
  );

  // --- Fetchs ---
  const fetchFuncionarios = async () => {
    const res = await fetch(`${API_URL}/funcionarios/unidade/${unidadeId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  };

  const fetchVendas = async () => {
    const res = await fetch(`${API_URL}/vendas/unidade/${unidadeId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  };

  const fetchSalarios = async () => {
    const res = await fetch(`${API_URL}/salariosFilial/unidade/${unidadeId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  };

  useEffect(() => {
    if (!open || !unidadeId) return;

    setLoading(true);

    (async () => {
      try {
        const [funcionariosData, vendasData, salariosData] = await Promise.all([
          fetchFuncionarios(),
          fetchVendas(),
          fetchSalarios()
        ]);

        setFuncionarios(funcionariosData.map(f => ({
          ...f,
          departamento: f.departamentoNome || 'Não Atribuído',
          status: f.status || 'Ativo'
        })));
        setVendas(vendasData);
        setSalarios(salariosData);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar detalhes da franquia");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, unidadeId, token]);

  // --- Componente Lista de Funcionários ---
  const ListaFuncionarios = ({ lista }) => (
    <ScrollArea className="h-64 border rounded-lg p-2 overflow-auto">
      {lista.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          Nenhum funcionário encontrado.
        </p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {lista.map(f => (
            <li key={f.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm gap-1 sm:gap-0">
              <span className="font-medium text-gray-700 truncate">{f.nome}</span>
              <div className="flex items-center space-x-2 text-right">
                <span className="text-xs text-gray-500">{f.departamento}</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    f.status?.toLowerCase() === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {f.status || "-"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </ScrollArea>
  );

  // --- Renderização do Dialog ---
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] w-full max-h-[90vh] rounded-xl p-0 flex flex-col">

        {/* HEADER */}
        <DialogHeader className="p-6 pb-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-bold text-gray-800">
            Detalhes da Franquia
          </DialogTitle>
        </DialogHeader>

        {/* LOADING */}
        {loading ? (
          <div className="flex items-center justify-center h-64 flex-grow">
            <Loader2 className="animate-spin w-8 h-8 text-teal-600" />
            <span className="ml-3 text-gray-600">Carregando dados...</span>
          </div>
        ) : (
          <div className="flex-grow overflow-auto p-6 pt-4">

            <Tabs defaultValue="vendas" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg shadow-inner">
                <TabsTrigger value="vendas" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white transition-colors duration-200">
                  Vendas
                </TabsTrigger>
                <TabsTrigger value="funcionarios" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white transition-colors duration-200">
                  Funcionários
                </TabsTrigger>
                <TabsTrigger value="salarios" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white transition-colors duration-200">
                  Salários
                </TabsTrigger>
              </TabsList>

              {/* ---------------------- TAB VENDAS ---------------------- */}
              <TabsContent value="vendas" className="space-y-6">
                {/* Cards métricas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <Card className="shadow-lg border-l-4 border-teal-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-semibold text-gray-600">Total de Vendas</CardTitle>
                      <DollarSign className="w-5 h-5 text-teal-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-extrabold text-teal-800">{formatBRL(totalVendas)}</div>
                      <p className="text-xs text-muted-foreground mt-1">{vendas.length} transações registradas</p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg border-l-4 border-gray-400">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-semibold text-gray-600">Ticket Médio</CardTitle>
                      <Wallet className="w-5 h-5 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-extrabold text-gray-800">{formatBRL(ticketMedio)}</div>
                      <p className="text-xs text-muted-foreground mt-1">Média por transação</p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg border-l-4 border-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-semibold text-gray-600">Volume de Vendas</CardTitle>
                      <Zap className="w-5 h-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-extrabold text-blue-800">{vendas.length}</div>
                      <p className="text-xs text-muted-foreground mt-1">Total de transações únicas</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Gráfico */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Evolução de Vendas por Mês</CardTitle>
                    <p className="text-sm text-gray-500">Total de vendas nos últimos 12 meses.</p>
                  </CardHeader>
                  <CardContent className="h-[300px] p-4">
                    {vendasAgregadas.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={vendasAgregadas} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis dataKey="mes_exibicao" stroke="#555" fontSize={12} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px', padding: '10px' }}
                            formatter={value => formatBRL(value)}
                            labelStyle={{ fontWeight: 'bold', color: '#333' }}
                          />
                          <Line type="monotone" dataKey="total" name="Vendas" stroke="#0d9488" strokeWidth={3} dot={{ fill: '#0d9488', r: 5 }} activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">Nenhum dado de vendas disponível para o gráfico.</div>
                    )}
                  </CardContent>
                </Card>

                {/* Lista detalhada de vendas */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Registro Detalhado de Vendas ({vendas.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64 border rounded-lg p-3 bg-gray-50 overflow-auto">
                      {vendas.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">Nenhuma venda encontrada.</p>
                      ) : (
                        <ul className="divide-y divide-gray-200">
                          {vendas.map(v => (
                            <li key={v.id} className="py-3 flex justify-between items-center text-sm transition hover:bg-white px-2 rounded-md">
                              <span className="text-gray-700">Venda # {v.id}</span>
                              <div className="flex space-x-4 items-center">
                                <span className="text-xs text-gray-500">{new Date(v.data).toLocaleDateString()}</span>
                                <span className="font-bold text-teal-600">{formatBRL(Number(v.total))}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ---------------------- TAB FUNCIONÁRIOS ---------------------- */}
              <TabsContent value="funcionarios" className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <Card className="shadow-lg border-l-4 border-green-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-semibold text-gray-600">Total de Funcionários</CardTitle>
                      <User className="w-5 h-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-extrabold text-green-800">{totalFuncionarios}</div>
                      <p className="text-xs text-muted-foreground mt-1">Colaboradores no total</p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg border-l-4 border-green-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-semibold text-gray-600">Ativos</CardTitle>
                      <ListOrdered className="w-5 h-5 text-green-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-extrabold text-green-600">{statusCounts.ativo || 0}</div>
                      <p className="text-xs text-muted-foreground mt-1">Funcionários atualmente em serviço</p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg border-l-4 border-red-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-semibold text-gray-600">Inativos/Afastados</CardTitle>
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-extrabold text-red-600">{statusCounts.inativo || 0}</div>
                      <p className="text-xs text-muted-foreground mt-1">Funcionários não ativos</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Lista Detalhada de Funcionários</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <ListaFuncionarios lista={funcionarios} />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ---------------------- TAB SALÁRIOS ---------------------- */}
              <TabsContent value="salarios" className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <Card className="shadow-lg border-l-4 border-yellow-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-semibold text-gray-600">Salários Pagos (Período)</CardTitle>
                      <DollarSign className="w-5 h-5 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-extrabold text-yellow-800">{formatBRL(totalSalariosPagos)}</div>
                      <p className="text-xs text-muted-foreground mt-1">Total de pagamentos efetuados</p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg border-l-4 border-red-600">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-semibold text-gray-600">Pagamentos Pendentes</CardTitle>
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-extrabold text-red-700">{salariosPendentes}</div>
                      <p className="text-xs text-muted-foreground mt-1">Salários com status diferente de 'pago'</p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg border-l-4 border-gray-400">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-semibold text-gray-600">Total de Registros</CardTitle>
                      <ListOrdered className="w-5 h-5 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-extrabold text-gray-800">{salarios.length}</div>
                      <p className="text-xs text-muted-foreground mt-1">Total de registros de salários</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Registro Detalhado de Salários</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64 border rounded-lg p-3 bg-gray-50 overflow-auto">
                      {salarios.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">Nenhum salário registrado.</p>
                      ) : (
                        <ul className="divide-y divide-gray-200">
                          {salarios.map(s => (
                            <li key={s.id} className="py-3 flex justify-between items-center text-sm transition hover:bg-white px-2 rounded-md">
                              <span className="text-gray-700">{s.funcionarioNome}</span>
                              <div className="flex space-x-4 items-center">
                                <span className="text-xs text-gray-500">{new Date(s.data_atualizado).toLocaleDateString()}</span>
                                <span className="font-bold text-teal-600">{formatBRL(Number(s.valor))}</span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                  s.status_pagamento?.toLowerCase() === 'pago' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {s.status_pagamento || "-"}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* FOOTER */}
        <DialogFooter className="p-6 pt-4 border-t border-gray-200">
          <DialogClose asChild>
            <button className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors">
              Fechar
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
