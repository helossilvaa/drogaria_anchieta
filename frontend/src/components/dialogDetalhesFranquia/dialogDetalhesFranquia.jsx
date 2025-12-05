"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

export default function DialogDetalhesFranquia({ unidadeId, open, onOpenChange }) {
  const API_URL = "http://localhost:8080";
  const token = localStorage.getItem("token");

  const [funcionarios, setFuncionarios] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [salarios, setSalarios] = useState([]);
  const [totalVendas, setTotalVendas] = useState(0);
  const [loading, setLoading] = useState(false);

  // Função genérica para buscar dados
  const fetchData = async (endpoint, setState, errorMsg) => {
    try {
      const res = await fetch(`${API_URL}/${endpoint}/${unidadeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(errorMsg);
      const data = await res.json();
      setState(data);
    } catch (err) {
      console.error(err);
      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    if (open && unidadeId) {
      setLoading(true);
      Promise.all([
        fetchData("funcionariosPorFilial/unidade", setFuncionarios, "Erro ao buscar funcionários"),
        fetchData("vendasPorFilial/unidade", setVendas, "Erro ao buscar vendas"),
        fetchData("salariosPorFilial/unidade", setSalarios, "Erro ao buscar salários"),
      ])
        .finally(() => setLoading(false));
    }
  }, [open, unidadeId]);

  // Atualiza total de vendas quando vendas mudam
  useEffect(() => {
    const total = vendas.reduce((acc, v) => acc + Number(v.total || 0), 0);
    setTotalVendas(total);
  }, [vendas]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full rounded-xl p-6">
        <DialogHeader>
          <DialogTitle>Detalhes da Franquia</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
          </div>
        ) : (
          <Tabs defaultValue="funcionarios" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="funcionarios">Funcionários</TabsTrigger>
              <TabsTrigger value="vendas">Vendas</TabsTrigger>
              <TabsTrigger value="salarios">Salários</TabsTrigger>
            </TabsList>

            {/* Funcionários */}
            <TabsContent value="funcionarios">
              <ScrollArea className="max-h-80">
                {funcionarios.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum funcionário encontrado.</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {funcionarios.map((f) => (
                      <li key={f.id} className="py-2 flex justify-between">
                        <span>{f.nome}</span>
                        <span className="text-sm text-gray-500">{f.departamento || "-"} - {f.status || "-"}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Vendas */}
            <TabsContent value="vendas">
              <ScrollArea className="max-h-80 space-y-2">
                <div className="p-2 bg-blue-50 rounded flex justify-between font-semibold text-blue-700">
                  <span>Total de Vendas:</span>
                  <span>R$ {totalVendas.toLocaleString("pt-BR")}</span>
                </div>

                {vendas.length === 0 ? (
                  <p className="text-sm text-gray-500 mt-2">Nenhuma venda encontrada.</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {vendas.map((v) => (
                      <li key={v.id} className="py-2 flex justify-between">
                        <span>Total: R$ {v.total.toLocaleString("pt-BR")}</span>
                        <span className="text-sm text-gray-500">{new Date(v.data).toLocaleDateString()}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Salários */}
            <TabsContent value="salarios">
              <ScrollArea className="max-h-80">
                {salarios.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum salário registrado.</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {salarios.map((s) => (
                      <li key={s.id} className="py-2 flex justify-between">
                        <span>{s.funcionario}</span>
                        <span className="text-sm text-gray-500">
                          R$ {s.valor.toLocaleString("pt-BR")} - {s.status_pagamento || "-"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter className="mt-4 flex justify-end">
          <DialogClose className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Fechar</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
