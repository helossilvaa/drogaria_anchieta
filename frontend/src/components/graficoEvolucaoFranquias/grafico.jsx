"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function EvolucaoVendasMensal({ unidadeId }) {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:8080";

  // meses abreviados
  const meses = ["jan", "fev", "mar", "abr", "mai", "jun",
                 "jul", "ago", "set", "out", "nov", "dez"];

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/vendas/evolucaomensal/unidade/${unidadeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        // filtra para pegar apenas 1 ano (o mais recente)
        const anoMaisRecente = Math.max(...data.map(d => d.ano));

        const filtrado = data
          .filter(d => d.ano === anoMaisRecente)
          .map(d => ({
            mes: meses[d.mes - 1],
            total_vendas: Number(d.total_vendas),
          }));

        setDados(filtrado);
      } catch (err) {
        console.error("Erro ao carregar evolução mensal:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
  }, [unidadeId]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Evolução Mensal</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
  {loading ? (
    <p className="p-4">Carregando...</p>
  ) : (
    <div className="w-full h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={dados}
          margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <Tooltip formatter={(value) => `R$ ${value.toLocaleString()}`} />
          <Line
            type="monotone"
            dataKey="total_vendas"
            stroke="#4ade80"
            strokeWidth={2}
            dot
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )}
</CardContent>

    </Card>
  );
}
