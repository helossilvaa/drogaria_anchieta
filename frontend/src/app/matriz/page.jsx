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
        console.error(error);
        toast.error("Erro ao carregar unidades");
      }
    };

    fetchFranquias();
  }, []);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="flex flex-col justify-between p-4 bg-teal-800 text-white">
            <CardTitle>Total de Filiais</CardTitle>
            <p className="text-2xl font-bold">{franquias.length}</p>
          </Card>
          <Card className="flex flex-col justify-between p-4 bg-teal-800 text-white">
            <CardTitle>Total de funcionários</CardTitle>
            <p className="text-2xl font-bold">R$200</p>
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

        
        <div className="grid grid-cols-[1fr_3fr] gap-4">
          <div className="gap-4">
          <MaisVendidos/>
          <CardTransacoes entradas={200} saidas={200} lucro={7000} percentual="12,2" />
          </div>
          <MapaUnidades/>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <EvolucaoVendasMensal />
            
              
        </div>
        
        
      </div>
    </Layout>
  );
}
