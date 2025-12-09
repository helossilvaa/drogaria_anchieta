"use client";

import { useEffect, useState } from "react";
import { Pie, PieChart } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";

export const description = "A pie chart with a legend";

export function ChartPieLegend() {
    const [chartData, setChartData] = useState([]);
    const [chartConfig, setChartConfig] = useState({});

    useEffect(() => {
        async function fetchTopCategorias() {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch("http://localhost:8080/itens/top-categorias", {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                const data = await response.json();

                console.log("RESPONSE RAW:", response);
                console.log("JSON RECEBIDO:", data);

                // transforma para o padrão do gráfico
                const formattedData = data.map((item) => ({
                    categoria: item.categoria,
                    total: Number(item.total),
                }));

                // gera dinamicamente cores e legenda
                const config = {};
                formattedData.forEach((item, index) => {
                    const colors = ["#FFCBD0", "#ADD9D9", "#245757"];
                    config[item.categoria] = { label: item.categoria, color: colors[index] };
                });

                setChartData(formattedData);
                setChartConfig(config);
            } catch (error) {
                console.error("Erro ao carregar gráfico:", error);
            }
        }

        fetchTopCategorias();
    }, []);

    return (
        <Card className="flex flex-col">
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[300px]"
                >
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="total"
                            nameKey="categoria"
                            label
                        />

                        <ChartLegend
                            content={<ChartLegendContent nameKey="categoria" />}
                            className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}