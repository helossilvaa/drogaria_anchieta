"use client";

import * as React from "react";
import { PieChart, Pie, Label, Tooltip, ResponsiveContainer } from "recharts";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { useEffect, useState } from "react";

export function MaisVendidos() {
  const [categorias, setCategorias] = useState([]);
  const API_URL = "http://localhost:8080";

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/categorias/maisvendidas`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        const cores = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#6B7280"];
        const chartData = data.map((item, index) => ({
          ...item,
          fill: cores[index % cores.length],
        }));

        setCategorias(chartData);
      } catch (err) {
        console.error("Erro ao buscar categorias mais vendidas:", err);
      }
    };

    fetchCategorias();
  }, []);

  const total = categorias.reduce((sum, d) => sum + Number(d.value), 0);

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-0">
        <CardTitle>Categorias mais vendidas</CardTitle>
        <CardDescription>
          Categorias mais vendidas em todas as filiais por mês
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center pb-0">
        {/* Gráfico mais pra cima */}
        <div className="w-full h-[350px] -mt-30 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categorias}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="75%"
                startAngle={180}
                endAngle={0}
                innerRadius="50%"
                outerRadius="80%"
                stroke="none"
              >

                <Label
                  position="centerBottom"
                  content={({ viewBox }) => (
                    <g>
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy - 40} // título acima do total
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-foreground text-sm font-medium"
                      >
                        VENDAS CATEGORIAS
                      </text>
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy + 0} // total central
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-foreground text-2xl font-bold"
                      >
                        {total}
                      </text>
                    </g>
                  )}
                />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legenda com porcentagem */}
        <div className="mt-2 flex flex-col gap-4 w-full">
  {categorias.map((cat) => {
    const perc = ((cat.value / total) * 100).toFixed(1);
    return (
      <div key={cat.categoria_id} className="flex items-center justify-between w-full">
        {/* Bolinha + nome */}
        <div className="flex items-center gap-3">
          <span
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: cat.fill }}
          />
          <span className="text-base font-semibold whitespace-nowrap">{cat.name}</span>
        </div>

        {/* Percentual */}
        <span className="text-base font-semibold whitespace-nowrap">({perc}%)</span>
      </div>
    );
  })}
</div>


      </CardContent>

    </Card>
  );
}
