"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip as BarTooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { ChartContainer } from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const mesesAno = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

export function ChartVendasHora({
  data = [],
  funcionarios = [],
  periodo,
  onPeriodoChange, 
}) {
  const [chartData, setChartData] = useState([]);
  const [chartConfig, setChartConfig] = useState({});

  
  const normalizarDia = (dia) => {
    
    if (periodo === "6meses" && typeof dia === "string" && /^\d{4}-\d{2}$/.test(dia)) {
      return dia;
    }

    const dt = new Date(dia);

    if (periodo === "6meses") {
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    }

    return dt.toISOString().split("T")[0];
  };

  const formatLabel = (dia) => {
    if (!dia) return "";

    if (periodo === "6meses") {
  
      if (typeof dia === "string" && /^\d{4}-\d{2}$/.test(dia)) {
        const [, month] = dia.split("-");
        return mesesAno[Number(month) - 1];
      }
      return dia;
    }

    const dt = new Date(dia);
    if (periodo === "7dias") {
     
      return diasSemana[dt.getDay()];
    }

    if (periodo === "30dias") {
      
      return String(dt.getDate());
    }

    return dia;
  };

  useEffect(() => {
    const config = {};
    funcionarios.forEach((f, idx) => {
      config[f.nome] = {
        color: `var(--chart-${(idx % 6) + 1})`,
      };
    });
    setChartConfig(config);

    setChartData(
      data.map((d) => ({
        ...d,
        dia: normalizarDia(d.dia),
      }))
    );
  }, [data, funcionarios, periodo]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    const total = payload.reduce((sum, p) => sum + (p.value || 0), 0);

    return (
      <div className="bg-white p-3 rounded-md shadow-lg border border-gray-200">
        <div className="font-semibold mb-1">{formatLabel(label)}</div>
        <div className="mb-2 font-medium">
          Total:{" "}
          {total.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </div>
        {payload.map((p) => (
          <div key={p.dataKey} className="flex justify-between gap-2 text-sm">
            <span style={{ color: p.fill }}>{p.dataKey}</span>
            <span>
              {(p.value || 0).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex gap-3">
            Vendas <TrendingUp className="h-4 w-4" />
          </CardTitle>
          <CardDescription>Total de vendas por funcionário</CardDescription>
        </div>

       
        <Select value={periodo} onValueChange={onPeriodoChange}> 
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="7dias">Últimos 7 dias</SelectItem>
            <SelectItem value="30dias">Últimos 30 dias</SelectItem>
            <SelectItem value="6meses">Últimos 6 meses</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="w-full h-[300px]">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} />

              <XAxis
                dataKey="dia"
                tickLine={false}
                axisLine={false}
                interval={0}
                tickFormatter={formatLabel}
              />

              <BarTooltip content={<CustomTooltip />} />

              {funcionarios.map((f, idx) => (
                <Bar
                  key={f.nome}
                  dataKey={f.nome}
                  stackId="a"
                  fill={`var(--chart-${(idx % 6) + 1})`}
                  radius={[3, 3, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}