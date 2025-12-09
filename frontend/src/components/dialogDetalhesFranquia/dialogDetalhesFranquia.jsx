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
import { Loader2, DollarSign, Wallet, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function DialogDetalhesFranquia({ unidadeId, open, onOpenChange }) {
  const API_URL = "http://localhost:8080";
  const token = localStorage.getItem("token");

  const [funcionarios, setFuncionarios] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [salarios, setSalarios] = useState([]);
  const [loading, setLoading] = useState(false);

  // Métricas
  const totalVendas = useMemo(() => vendas.reduce((acc, v) => acc + Number(v.total || 0), 0), [vendas]);
  const totalFuncionarios = useMemo(() => funcionarios.length, [funcionarios]);
  const totalSalariosPagos = useMemo(() => salarios.reduce((acc, s) => acc + (s.status_pagamento === 'pago' ? Number(s.valor || 0) : 0), 0), [salarios]);
  const salariosPendentes = useMemo(() => salarios.filter(s => s.status_pagamento !== 'pago').length, [salarios]);
  const statusCounts = useMemo(() => funcionarios.reduce((acc, f) => { acc[f.status] = (acc[f.status] || 0) + 1; return acc; }, {}), [funcionarios]);

  const vendasPorMesSimulado = useMemo(() => {
    const data = {};
    vendas.forEach(v => {
      const date = new Date(v.data);
      const mesAno = `${date.getFullYear()}-${date.getMonth() + 1}`;
      data[mesAno] = (data[mesAno] || 0) + Number(v.total || 0);
    });
    return Object.entries(data).map(([mesAno, total]) => ({ mes: mesAno, total }));
  }, [vendas]);

  const fetchFuncionarios = async () => {
    const res = await fetch(`${API_URL}/funcionarios/unidade/${unidadeId}`, { headers: { Authorization: `Bearer ${token}` } });
    return res.json();
  };

  const fetchVendas = async () => {
    const res = await fetch(`${API_URL}/vendas/unidade/${unidadeId}`, { headers: { Authorization: `Bearer ${token}` } });
    return res.json();
  };

  const fetchSalarios = async () => {
    const res = await fetch(`${API_URL}/salariosFilial/unidade/${unidadeId}`, { headers: { Authorization: `Bearer ${token}` } });
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
        setFuncionarios(funcionariosData);
        setVendas(vendasData);
        setSalarios(salariosData);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar detalhes da franquia");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, unidadeId]);

  const formatBRL = (value) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const ListaFuncionarios = ({ lista, total }) => (
    <>
      <div className="p-2 mb-2 bg-green-50 rounded flex justify-between font-semibold text-green-700">
        <span>Total de Funcionários:</span>
        <span>{total}</span>
      </div>
      <ScrollArea className="max-h-64">
        {lista.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">Nenhum funcionário encontrado.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {lista.map(f => (
              <li key={f.id} className="py-2 flex justify-between text-sm">
                <span>{f.nome}</span>
                <span className="text-gray-500">{f.departamento || "Não atribuído"} - {f.status || "-"}</span>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] max-h-[90vh] rounded-xl p-0 flex flex-col">

        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>Detalhes da Franquia</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-48 flex-grow">
            <Loader2 className="animate-spin w-8 h-8 text-teal-500" />
          </div>
        ) : (
          <div className="flex-grow overflow-auto p-6 pt-4">
            <Tabs defaultValue="vendas" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="vendas">Vendas</TabsTrigger>
                <TabsTrigger value="funcionarios">Funcionários</TabsTrigger>
                <TabsTrigger value="salarios">Salários</TabsTrigger>
              </TabsList>

              {/* Vendas */}
              <TabsContent value="vendas" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-blue-50">
                    <CardHeader className="flex items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Vendas no Período</CardTitle>
                      <DollarSign className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-800">{formatBRL(totalVendas)}</div>
                      <p className="text-xs text-muted-foreground">Último período</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                      <Wallet className="w-4 h-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatBRL(totalVendas / (vendas.length || 1))}</div>
                      <p className="text-xs text-muted-foreground">{vendas.length} vendas registradas</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Itens na Venda</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">~{vendas.length}</div>
                      <p className="text-xs text-muted-foreground">Total de transações</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Evolução Histórica de Vendas</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64 flex items-center justify-center bg-gray-50">
                    {vendasPorMesSimulado.length > 0 ? (
                      <div className="text-sm text-gray-400">
                        Gráfico de Vendas Mensais (Total: {vendasPorMesSimulado.length} meses)
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Dados insuficientes para gráfico histórico.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Registro Detalhado das Vendas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64 border rounded-lg p-2">
                      {vendas.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">Nenhuma venda encontrada.</p>
                      ) : (
                        <ul className="divide-y divide-gray-200">
                          {vendas.map(v => (
                            <li key={v.id} className="py-2 flex justify-between text-sm">
                              <span>{new Date(v.data).toLocaleDateString()}</span>
                              <span className="font-semibold text-blue-600">{formatBRL(Number(v.total))}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Funcionários */}
              <TabsContent value="funcionarios" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-green-50">
                    <CardHeader className="flex items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total de Funcionários</CardTitle>
                      <User className="w-4 h-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-800">{totalFuncionarios}</div>
                      <p className="text-xs text-muted-foreground">Colaboradores ativos e inativos</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Status Ativo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{statusCounts.ativo || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Status Inativo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{statusCounts.inativo || 0}</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Lista de Funcionários ({totalFuncionarios})</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <ListaFuncionarios lista={funcionarios} total={totalFuncionarios} />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Salários */}
              <TabsContent value="salarios" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-yellow-50">
                    <CardHeader className="flex items-center justify-between pb-2">
                      <CardTitle>Total de Salários Pagos</CardTitle>
                      <DollarSign className="w-4 h-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-800">{formatBRL(totalSalariosPagos)}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Pagamentos Pendentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{salariosPendentes}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Salário Médio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatBRL(totalSalariosPagos / (salarios.length || 1))}</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Lista de Salários Registrados ({salarios.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64 border rounded-lg p-2">
                      {salarios.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">Nenhum salário registrado.</p>
                      ) : (
                        <ul className="divide-y divide-gray-200">
                          {salarios.map(s => (
                            <li key={s.id} className="py-2 flex justify-between text-sm">
                              <span className="font-medium">{s.funcionario}</span>
                              <span className={`${s.status_pagamento === 'pago' ? 'text-green-600' : 'text-red-600'}`}>
                                {formatBRL(Number(s.valor))} - {s.status_pagamento || "Aberto"}
                              </span>
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

        <DialogFooter className="p-6 pt-4 border-t">
          <DialogClose asChild>
            <button className="px-4 py-2 bg-gray-200 rounded-lg text-sm font-medium hover:bg-gray-300">
              Fechar
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
