"use client";

import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-toastify";
import RankingUnidades from "@/components/rankingUnidades/rankingUnidades";
import EvolucaoVendasMensal from "@/components/evolucaoVendas/evolucaoVendas";
import { MaisVendidos } from "@/components/categoriasMaisVendidas/categoriasgrafico";
// import MapaUnidades from "@/components/mapaFranquias/mapaFranquias";
import CardTransacoes from "@/components/transacoesDashboard/transacoes";

const API_URL = "http://localhost:8080";

export default function DashboardMatriz() {
  const [franquias, setFranquias] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [estoque, setEstoque] = useState([]);
  const [totais, setTotais] = useState({ total: 0 });

  // Fetch unidades
  useEffect(() => {
    const fetchFranquias = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/unidade`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erro ao carregar unidades");
        const data = await res.json();
        setFranquias(data);
      } catch (error) {
        toast.error("Erro ao carregar unidades");
      }
    };
    fetchFranquias();
  }, []);

  // Fetch funcionários
  useEffect(() => {
    const fetchFuncionarios = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/funcionarios`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erro ao carregar funcionários");
        const data = await res.json();

        setFuncionarios(data);
        setTotais({ total: data.length });
      } catch (error) {
        toast.error("Erro ao carregar funcionários");
      }
    };
    fetchFuncionarios();
  }, []);

  // Fetch estoque
  useEffect(() => {
    const fetchEstoque = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/estoquematriz`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erro ao carregar estoque");
        const data = await res.json();
        setEstoque(data);
      } catch (error) {
        toast.error("Erro ao carregar estoque");
      }
    };
    fetchEstoque();
  }, []);

  return (
    <Layout>
      <div className="p-6 space-y-6">

        {/* Cards principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="flex flex-col justify-between p-4 bg-teal-800 text-white">
            <CardTitle>Total de Filiais</CardTitle>
            <p className="text-2xl font-bold">{franquias.length}</p>
          </Card>

          <Card className="flex flex-col justify-between p-4 bg-teal-800 text-white">
            <CardTitle>Total de funcionários</CardTitle>
            <p className="text-2xl font-bold">{totais.total}</p>
          </Card>

          <Card className="flex flex-col justify-between p-4 bg-teal-800 text-white">
            <CardTitle>Entradas</CardTitle>
            <p className="text-2xl font-bold">R$200</p>
          </Card>

          <Card className="flex flex-col justify-between p-4 bg-teal-800 text-white">
            <CardTitle>Saídas</CardTitle>
            <p className="text-2xl font-bold">R$200</p>
          </Card>
        </div>

        {/* Ranking e Alertas lado a lado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RankingUnidades />

          <Card>
            <CardHeader>
              <CardTitle>Alertas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { name: "Buscopam 250g", stock: 5, type: "Baixo" },
                { name: "Dipirona 500mg", stock: 2, type: "Próximo da validade" },
              ].map((alerta) => (
                <div
                  key={alerta.name}
                  className="flex justify-between items-center p-2 border rounded"
                >
                  <div>
                    <p className="font-semibold">{alerta.name}</p>
                    <p className="text-sm text-gray-500">
                      Em estoque: {alerta.stock} unidades
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded text-sm bg-red-100 text-red-700">
                    {alerta.type}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Categorias + Transações + Mapa */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_2fr] gap-4">

          {/* Coluna esquerda */}
          <div className="space-y-4"> 
            <MaisVendidos />
            <CardTransacoes entradas={200} saidas={200} lucro={7000} percentual="12,2" />
          </div>

          {/* Coluna direita */}
          {/* <MapaUnidades /> */}
        </div>

        {/* Espaço extra entre seções */}
        <div className="pt-4">
          <EvolucaoVendasMensal />
        </div>
      </div>
    </Layout>
  );
}
