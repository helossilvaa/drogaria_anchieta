"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

const meses = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"
];

export default function ChartBarStacked({ dados = [] }) {
  const [modo, setModo] = useState("mensal");

  const dadosSeguros = Array.isArray(dados) ? dados : [];

  const chartData = meses.map((mes) => {
    const item = dadosSeguros.find((d) => d.mes === mes);
    return {
      mes,
      lucro: item?.entradas || 0,
      gasto: item?.saidas || 0,
    };
  });

  const corLucro = "#75b4a8";
  const corGasto = "#366b6d";

  return (
    <Card className="p-6 rounded-xl shadow-sm">
      {/* CABEÇALHO */}
      <CardHeader className="flex items-center justify-between mb-1 pb-2">
        <div className="flex gap-2 items-center">
          <TrendingUp className="text-green-600" />
          <CardTitle className="text-lg font-semibold">
            Análise do saldo
          </CardTitle>
        </div>

        {/* BOTÕES IGUAIS À IMAGEM */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <Button
            variant={modo === "mensal" ? "default" : "ghost"}
            size="sm"
            className={`rounded-md px-4 ${
              modo === "mensal" ? "bg-gray-300 text-black" : "text-gray-600"
            }`}
            onClick={() => setModo("mensal")}
          >
            Mensal
          </Button>

          <Button
            variant={modo === "anual" ? "default" : "ghost"}
            size="sm"
            className={`rounded-md px-4 ${
              modo === "anual" ? "bg-gray-300 text-black" : "text-gray-600"
            }`}
            onClick={() => setModo("anual")}
          >
            Anual
          </Button>
        </div>
      </CardHeader>

      {/* LEGENDA IGUAL À IMAGEM */}
      <div className="flex justify-end gap-6 pr-4 pb-3 text-sm font-medium">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: corLucro }}
          />
          Lucros
        </div>

        <div className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: corGasto }}
          />
          Gastos
        </div>
      </div>

      {/* GRÁFICO */}
      <CardContent>
        <div className="w-full h-[420px]">
          <ResponsiveContainer>
            <BarChart data={chartData} barGap={6}>
              <CartesianGrid
                stroke="#d3d3d3"
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="mes"
                tick={{ fill: "#555", fontSize: 13 }}
                axisLine={false}
                tickMargin={10}
              />

              {/* TOOLTIP IGUAL À IMAGEM */}
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload) return null;

                  return (
                    <div className="bg-white shadow-lg rounded-lg p-3 border text-sm">
                      <strong className="block mb-1">{label}</strong>

                      {/* Lucro */}
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="inline-block w-3 h-3 rounded-full"
                          style={{ backgroundColor: corLucro }}
                        />
                        R$ {payload[0]?.value?.toLocaleString("pt-BR")}
                      </div>

                      {/* Gasto */}
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block w-3 h-3 rounded-full"
                          style={{ backgroundColor: corGasto }}
                        />
                        R$ {payload[1]?.value?.toLocaleString("pt-BR")}
                      </div>
                    </div>
                  );
                }}
              />

              {/* BARRAS IGUAIS À IMAGEM */}
              <Bar
                dataKey="lucro"
                stackId="a"
                fill={corLucro}
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="gasto"
                stackId="a"
                fill={corGasto}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
