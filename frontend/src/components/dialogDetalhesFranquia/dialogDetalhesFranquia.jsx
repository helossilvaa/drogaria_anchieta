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
  const [totalFuncionarios, setTotalFuncionarios] = useState(0);
  const [vendas, setVendas] = useState([]);
  const [totalVendas, setTotalVendas] = useState(0);
  const [salarios, setSalarios] = useState([]);
  const [loading, setLoading] = useState(false);

  // Funções de fetch
 const fetchFuncionarios = async () => {
  const res = await fetch(`${API_URL}/funcionarios/${unidadeId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

  const fetchQuantidadeFuncionarios = async () => {
    const res = await fetch(`${API_URL}/funcionarios/unidade/quantidade?id=${unidadeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  };

  const fetchVendas = async () => {
    const res = await fetch(`${API_URL}/vendas/unidade/${unidadeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  };

  const fetchSalarios = async (funcionariosData) => {
    const salariosPromises = funcionariosData.map(f =>
      fetch(`${API_URL}/salariosFilial/funcionario/${f.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => res.json())
    );
    const salariosArrays = await Promise.all(salariosPromises);
    return salariosArrays.flat();
  };

  // Carregar dados ao abrir o modal
  useEffect(() => {
    if (!open || !unidadeId) return;

    setLoading(true);
    (async () => {
      try {
        const funcionariosData = await fetchFuncionarios();
        setFuncionarios(funcionariosData);

        const totalFuncData = await fetchQuantidadeFuncionarios();
        setTotalFuncionarios(totalFuncData.total || funcionariosData.length);

        const vendasData = await fetchVendas();
        setVendas(vendasData);
        const totalVendasCalc = vendasData.reduce((acc, v) => acc + Number(v.total || 0), 0);
        setTotalVendas(totalVendasCalc);

        const salariosData = await fetchSalarios(funcionariosData);
        setSalarios(salariosData);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar detalhes da franquia");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, unidadeId]);

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
              <div className="p-2 mb-2 bg-green-50 rounded flex justify-between font-semibold text-green-700">
                <span>Total de Funcionários:</span>
                <span>{totalFuncionarios}</span>
              </div>
              <ScrollArea className="max-h-80">
                {funcionarios.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum funcionário encontrado.</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {funcionarios.map(f => (
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
              <div className="p-2 mb-2 bg-blue-50 rounded flex justify-between font-semibold text-blue-700">
                <span>Total de Vendas:</span>
                <span>R$ {totalVendas.toLocaleString("pt-BR")}</span>
              </div>
              <ScrollArea className="max-h-80">
                {vendas.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhuma venda encontrada.</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {vendas.map(v => (
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
              <div className="p-2 mb-2 bg-yellow-50 rounded flex justify-between font-semibold text-yellow-700">
                <span>Total de Salários:</span>
                <span>{salarios.length}</span>
              </div>
              <ScrollArea className="max-h-80">
                {salarios.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum salário registrado.</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {salarios.map(s => (
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
          <DialogClose className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Fechar
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
