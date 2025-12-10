"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { CartesianGrid, Line, LineChart, XAxis, Tooltip, ResponsiveContainer } from "recharts";

// Função auxiliar para converter o nome do mês para abreviação (ex: "2023-01" -> "jan")
const formatarMesAbreviado = (mesCompleto) => {
  // Assume que o formato do mês é "YYYY-MM" ou contém o mês como número (1 a 12)
  const [ano, mesNumero] = mesCompleto.split('-');
  if (!mesNumero) {
    // Se o 'mesCompleto' já for a abreviação, retorna ele mesmo (caso de fallback)
    return mesCompleto;
  }
  const mesesAbreviados = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  // Converte para índice (o mês 1 é o índice 0)
  const indiceMes = parseInt(mesNumero, 10) - 1; 

  return mesesAbreviados[indiceMes] || mesCompleto;
};

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
        
        // 1. Transformação dos dados
        let parsedData = data.map(d => ({
          mes: d.mes, // Manter o campo original para ordenação
          mes_abrev: formatarMesAbreviado(d.mes), // Novo campo com a abreviação do mês
          total_vendas: Number(d.total_vendas)
        }));

        
       
        // ordena pelo campo 'mes' (ex: "2023-01", "2023-02", etc.)
        parsedData.sort((a, b) => a.mes.localeCompare(b.mes));
        
        // pega os últimos 12 elementos (representando o último ano de dados)
        const ultimosDozeMeses = parsedData.slice(-12);

        setDados(ultimosDozeMeses);
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
        <CardTitle>Evolução de Vendas Mensal (Últimos 12 Meses)</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dados} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
             
              <XAxis dataKey="mes_abrev" /> 
            
              <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              <Line type="monotone" dataKey="total_vendas" stroke="#4ade80" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}