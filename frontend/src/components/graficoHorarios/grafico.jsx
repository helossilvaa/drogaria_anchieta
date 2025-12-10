"use client";

import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, Tooltip, Line as RechartsLine } from "recharts";
import { Card } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";

export const description = "Gráfico de horários com mais vendas";

export function ChartHorarios() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const getToken = () => localStorage.getItem("token");
  const API_URL = "http://localhost:8080";

  useEffect(() => {
    async function fetchVendasPorHora() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/vendasPorFilial/vendas-por-hora`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
          },
        });

        if (!res.ok) {
          console.error("Erro ao buscar vendas por hora:", res.status, res.statusText);
          setChartData([]);
          return;
        }

        const data = await res.json();

        const formattedData = data.map(item => ({
          hora: `${String(item.hora).padStart(2, "0")}:00`,
          total: item.total,
        }));

        setChartData(formattedData);
      } catch (err) {
        console.error("Erro ao buscar vendas por hora:", err);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchVendasPorHora();
  }, []);

  return (
    <Card className="flex flex-col">
      <ChartContainer
        config={{}} // importante para não quebrar
        className="mx-auto w-full max-w-[600px] h-[200px] !bg-transparent !border-none !shadow-none p-0"
      >
        {loading ? (
          <div className="flex items-center justify-center w-full h-full">
            Carregando...
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center w-full h-full text-sm text-gray-500">
            Nenhum dado disponível
          </div>
        ) : (
          <LineChart
            width={600}
            height={300}
            data={chartData}
            margin={{ top: 20, right: 20, left: 12, bottom: 20 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="hora" tickLine={false} axisLine={false} tickMargin={8} />
            <Tooltip />
            <RechartsLine
              type="monotone"
              dataKey="total"
              stroke="#245757"
              strokeWidth={2}
              dot={{ fill: "#245757" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        )}
      </ChartContainer>
    </Card>
  );
}
