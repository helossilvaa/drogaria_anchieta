"use client";

import { BarChart, Bar, XAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";

export function ChartVendasHora({ data, funcionarios }) {
  // Configurando cores para cada funcionário
  const chartConfig = {};
  funcionarios.forEach((f, idx) => {
    chartConfig[f.nome] = {
      label: f.nome,
      color: `var(--chart-${(idx % 6) + 1})`, // cores alternadas
    };
  });

  // Transformando os dados para stacked bar chart
  const chartData = data.map(entry => {
    const obj = { hour: entry.hour };
    funcionarios.forEach(f => {
      obj[f.nome] = entry[f.nome] || 0;
    });
    return obj;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas por hora</CardTitle>
        <CardDescription>Total de vendas por funcionário</CardDescription>
      </CardHeader>
      <CardContent className="h-64 w-full">
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="hour" tickLine={false} axisLine={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            {funcionarios.map((f, idx) => (
              <Bar
                key={f.id}
                dataKey={f.nome}
                stackId="a"
                fill={`var(--chart-${(idx % 6) + 1})`}
                radius={[idx === 0 ? 4 : 0, idx === 0 ? 4 : 0, idx === 0 ? 4 : 0, idx === 0 ? 4 : 0]}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Vendas <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
}
