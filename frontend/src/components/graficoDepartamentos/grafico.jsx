"use client"

import { useEffect, useState } from "react"
import { TrendingUp } from "lucide-react"
import { Pie, PieChart, Cell } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export default function FuncionariosPorDepartamento() {
  const [chartData, setChartData] = useState([])

  const API_URL = "http://localhost:8080"

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")

        // Buscar departamentos
        const resDep = await fetch(`${API_URL}/departamento`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const departamentos = await resDep.json()

        // Buscar funcionários
        const resFunc = await fetch(`${API_URL}/funcionarios`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const funcionarios = await resFunc.json()

        // Contar funcionários por departamento
        const data = departamentos.map(dep => {
          const count = funcionarios.filter(f => f.departamento_id === dep.id).length
          return {
            name: dep.departamento,
            value: count,
          }
        })

        setChartData(data)

      } catch (err) {
        console.error("Erro ao buscar dados do chart:", err)
      }
    }

    fetchData()
  }, [])
//cores do gráfico
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A", "#8884D8"]

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Funcionários por Departamento</CardTitle>
        <CardDescription>Total de funcionários em cada departamento</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
  <ChartContainer
    config={{ value: { label: "Funcionários" } }}
    className="mx-auto aspect-square max-h-[250px] px-0"
  >
    <PieChart>
      <ChartTooltip content={<ChartTooltipContent nameKey="value" hideLabel />} />
      <Pie
        data={chartData}
        dataKey="value"
        nameKey="name"
        labelLine={false}
        label={({ payload, ...props }) => (
          <text
            cx={props.cx}
            cy={props.cy}
            x={props.x}
            y={props.y}
            textAnchor={props.textAnchor}
            dominantBaseline={props.dominantBaseline}
            fill="hsla(var(--foreground))"
          >
            {payload.value}
          </text>
        )}
      >
        {chartData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
    </PieChart>
  </ChartContainer>
</CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Distribuição atual de funcionários <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Mostrando a quantidade de funcionários por departamento
        </div>
      </CardFooter>
    </Card>
  )
}
