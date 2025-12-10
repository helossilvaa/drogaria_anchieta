"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function RankingUnidades() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:8080";

  useEffect(() => {
    //fetch das unidades que mais dao dinheiro
    const fetchRanking = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/unidade/rankingunidades`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        // Converte total_vendas para número e define 0 se vier null
        const parsedData = data.map(u => ({
          ...u,
          total_vendas: u.total_vendas ? Number(u.total_vendas) : 0
        }));

        setRanking(parsedData);
      } catch (err) {
        console.error("Erro ao carregar ranking:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

  const maxVendas = ranking.length > 0 ? Math.max(...ranking.map((u) => u.total_vendas)) : 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking de Filiais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p>Carregando ranking...</p>
        ) : ranking.length === 0 ? (
          <p>Nenhuma filial encontrada.</p>
        ) : (
          ranking.map((unidade) => (
            <div key={unidade.id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{unidade.nome}</span>
                <span>R$ {unidade.total_vendas.toFixed(2)}</span>
              </div>
              <Progress
                value={(unidade.total_vendas / maxVendas) * 100}
                className="h-2 rounded-full"
              />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
