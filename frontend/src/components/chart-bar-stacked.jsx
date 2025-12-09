"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer } from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";

const meses = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"
];

export default function ChartBarStacked({ dados = [] }) {
  const [modo, setModo] = useState("mensal");
  const dadosSeguros = Array.isArray(dados) ? dados : [];

  const chartData = meses.map((mes, i) => ({
    mes,
    lucro: dadosSeguros[i]?.entradas || 0,
    gasto: dadosSeguros[i]?.saidas || 0,
  }));

  const chartConfig = {
  lucro: {
    label: "Lucros",
    color: "#75b4a8",
  },
  gasto: {
    label: "Gastos",
    color: "#366b6d",
  },
};


  return (
    <Card className="p-4">
      <CardHeader className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <TrendingUp className="text-green-600" />
          <CardTitle className="text-lg">Análise do saldo</CardTitle>
        </div>

        <div className="flex gap-2">
          <Button
            variant={modo === "mensal" ? "default" : "outline"}
            size="sm"
            onClick={() => setModo("mensal")}
          >
            Mensal
          </Button>

          <Button
            variant={modo === "anual" ? "default" : "outline"}
            size="sm"
            onClick={() => setModo("anual")}
          >
            Anual
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="w-full h-[350px]">
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis dataKey="mes" tickMargin={10} />

              <Tooltip
                formatter={(value) =>
                  `R$ ${Number(value).toLocaleString("pt-BR", {
                    minimumFractionDigits: 0,
                  })}`
                }
              />

              <Legend wrapperStyle={{ fontSize: 12 }} />

              <Bar dataKey="lucro" name="Lucros" stackId="a" fill="#75b4a8" />
              <Bar dataKey="gasto" name="Gastos" stackId="a" fill="#366b6d" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
