"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { CartesianGrid, Line, LineChart, XAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function EvolucaoVendasMensal() {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:8080";

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/vendas/evolucaomensal`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const parsedData = data.map(d => ({
          mes: d.mes,
          total_vendas: Number(d.total_vendas)
        }));
        setDados(parsedData);
      } catch (err) {
        console.error("Erro ao carregar evolução mensal:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDados();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução de Vendas Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dados} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <Tooltip formatter={(value) => `R$ ${value.toLocaleString()}`} />
              <Line type="monotone" dataKey="total_vendas" stroke="#4ade80" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
