"use client"

import {useState, useEffect} from "react"
import { Pie, PieChart, Cell, Label } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export default function FuncionariosPorStatus() {
  const [chartData, setChartData] = useState([])

  const API_URL = "http://localhost:8080"
  const statusList = ["ativo", "inativo", "licença", "atestado", "férias"]

  //fetch dos funcionários e filtragem dos status
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${API_URL}/funcionarios`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const funcionarios = await res.json()

        const data = statusList.map((status) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: funcionarios.filter((f) => f.status === status).length,
        }))

        setChartData(data)
      } catch (err) {
        console.error("Erro ao buscar dados do chart:", err)
      }
    }

    fetchData()
  }, [])
  //cores do grafico
  const COLORS = ["#00C49F", "#00976aff", "#1c967bff", "#004234ff", "#AA336A"]

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-0">
        <CardTitle>Funcionários por Status</CardTitle>
        <CardDescription>Distribuição de funcionários por status</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={{ value: { label: "Funcionários" } }}
          className="mx-auto aspect-square max-h-[300px] w-full"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="value" hideLabel />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={100}
              labelLine={false}
              label={({ payload, x, y, textAnchor, dominantBaseline }) => (
                <text
                  x={x}
                  y={y}
                  textAnchor={textAnchor}
                  dominantBaseline={dominantBaseline}
                  fill="hsla(var(--foreground))"
                  fontSize={12}
                >
                  {payload.name}: {payload.value}
                </text>
              )}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    const total = chartData.reduce((acc, cur) => acc + cur.value, 0)
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {total}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Funcionários
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
