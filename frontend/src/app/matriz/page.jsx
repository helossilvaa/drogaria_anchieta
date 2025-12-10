"use client";

import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-toastify";
import RankingUnidades from "@/components/rankingUnidades/rankingUnidades";
import EvolucaoVendasMensal from "@/components/evolucaoVendas/evolucaoVendas";
import { MaisVendidos } from "@/components/categoriasMaisVendidas/categoriasgrafico";
import MapaUnidades from "@/components/mapaFranquias/mapaFranquias";
import CardTransacoes from "@/components/transacoesDashboard/transacoes";

const API_URL = "http://localhost:8080";

export default function DashboardMatriz() {
  const [franquias, setFranquias] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [estoque, setEstoque] = useState([]);
  const [totais, setTotais] = useState({ total: 0 });
  const [totalEntradas, setTotalEntradas] = useState(0);
  const [totalSaidas, setTotalSaidas] = useState(0);
  const [totalLucroLiquido, setTotalLucroLiquido] = useState(0);
  const [transacoes, setTransacoes] = useState([]);
  const [produtos, setProdutos] = useState([]);

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

        const faltando = data.filter((e) => e.quantidade >= 30);
        setEstoque(data);
      } catch (error) {
        toast.error("Erro ao carregar estoque");
      }
    };

    fetchEstoque();
  }, []);



  // fetch produtos
  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/produtos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setProdutos(data);
      } catch (error) {
        toast.error("Erro ao carregar produtos");
      }
    };
    fetchProdutos();
  }, []);


  useEffect(() => {
    const fetchTransacoes = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/transacoes-matriz`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setTransacoes(Array.isArray(data.transacoes) ? data.transacoes : []);

        setTotalEntradas(
          (data.transacoes || []).reduce((acc, t) => acc + Number(t.entradas || 0), 0)
        );
        setTotalSaidas(
          (data.transacoes || []).reduce((acc, t) => acc + Number(t.saidas || 0), 0)
        );
        setTotalLucroLiquido(
          (data.transacoes || []).reduce((acc, t) => acc + Number(t.lucro_liquido || 0), 0)
        );
      } catch (e) {
        console.error(e);
      }
    };
    fetchTransacoes();
  }, [])

  // calcula percentual baseado no lucro
  const percentualLucro = totalEntradas
    ? ((totalLucroLiquido / totalEntradas) * 100).toFixed(1)
    : "0";



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
            <p className="text-2xl font-bold">
              R${totalEntradas.toLocaleString("pt-BR")}
            </p>
          </Card>

          <Card className="flex flex-col justify-between p-4 bg-teal-800 text-white">
            <CardTitle>Saídas</CardTitle>
            <p className="text-2xl font-bold">
              R${totalSaidas.toLocaleString("pt-BR")}
            </p>
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
              {estoque
                .filter(
                  (item) => item.quantidade <= 30 || item.quantidade > item.estoque_maximo
                )
                .slice(0, 3)
                .map((alerta) => {
                  const produto = produtos.find((p) => p.id === alerta.produto_id);

                  let statusText = "";
                  let statusColor = "";

                  if (alerta.quantidade <= 10) {
                    statusText = "Baixo";
                    statusColor = "bg-red-100 text-red-700";
                  } else if (alerta.quantidade <= 30) {
                    statusText = "Médio";
                    statusColor = "bg-yellow-100 text-yellow-700";
                  } else if (alerta.quantidade > alerta.estoque_maximo) {
                    statusText = "Em excesso";
                    statusColor = "bg-green-100 text-green-700";
                  }

                  return (
                    <div
                      key={alerta.produto_id}
                      className="flex justify-between items-center p-2 border rounded"
                    >
                      <div>
                        <p className="font-semibold">
                          {produto ? produto.nome : "Produto desconhecido"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Em estoque: {alerta.quantidade} unidades
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-sm ${statusColor}`}>
                        {statusText}
                      </span>
                    </div>
                  );
                })}
              {estoque.filter(
                (item) => item.quantidade <= 30 || item.quantidade > item.estoque_maximo
              ).length === 0 && (
                  <p className="text-sm text-gray-500">Nenhum item com alerta de estoque</p>
                )}
            </CardContent>
          </Card>
        </div>

        {/* Categorias + Transações + Mapa */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_2fr] gap-4">

          {/* Coluna esquerda */}
          <div className="space-y-4">
            <MaisVendidos />
            <CardTransacoes
              entradas={totalEntradas}
              saidas={totalSaidas}
              lucro={totalLucroLiquido}
              percentual={percentualLucro}
            />
          </div>

          {/* Coluna direita */}
          <MapaUnidades />
        </div>

        {/* Espaço extra entre seções */}
        <div className="pt-4">
          <EvolucaoVendasMensal />
        </div>
      </div>
    </Layout>
  );
}
