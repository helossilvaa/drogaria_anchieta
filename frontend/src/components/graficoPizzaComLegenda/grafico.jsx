"use client";

import { useEffect, useState } from "react";
import { Pie, PieChart, Cell } from "recharts";
import { Card } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

export const description = "A pie chart with a legend";

export function ChartPieLegend() {
    const [chartData, setChartData] = useState([]);
    const [chartConfig, setChartConfig] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTopCategorias() {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const response = await fetch("http://localhost:8080/itens/top-categorias", {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });

                console.log("FETCH /itens/top-categorias - status:", response.status, response.statusText);
                const ct = response.headers.get("content-type") || "";
                console.log("content-type:", ct);

                if (!response.ok) {
                    let errBody;
                    try {
                        errBody = await response.json();
                    } catch {
                        errBody = await response.text().catch(() => "<no body>");
                    }
                    console.error("Erro na API (não ok):", response.status, errBody);
                    setChartData([]);
                    setChartConfig({});
                    return;
                }

                let data;
                if (ct.includes("application/json")) {
                    data = await response.json();
                } else {
                    const txt = await response.text().catch(() => "<no body>");
                    console.error("Resposta não-JSON recebida:", txt);
                    setChartData([]);
                    setChartConfig({});
                    return;
                }

                console.log("JSON RECEBIDO (raw):", data);

                let arr;
                if (Array.isArray(data)) {
                    arr = data;
                } else if (Array.isArray(data.data)) {
                    arr = data.data;
                } else if (Array.isArray(data.resultado)) {
                    arr = data.resultado;
                } else {
                    console.error("Estrutura inesperada recebida (não é array):", data);
                    setChartData([]);
                    setChartConfig({});
                    return;
                }

                const formattedData = arr.map((item) => ({
                    categoria: item.categoria ?? item.categoria_nome ?? item.nome ?? String(item[0] ?? ""),
                    total: Number(item.total ?? item.qtd ?? item.quantidade ?? 0),
                }));

                console.log("Arr normalizado para gráfico:", formattedData);

                const colors = ["#FFCBD0", "#79B0B0", "#245757"]; // cores que você pediu
                const config = {};
                formattedData.forEach((item, index) => {
                    config[item.categoria] = { label: item.categoria, color: colors[index % colors.length] };
                });

                setChartData(formattedData);
                setChartConfig(config);
            } catch (error) {
                console.error("Erro ao carregar gráfico:", error);
                setChartData([]);
                setChartConfig({});
            } finally {
                setLoading(false);
            }
        }

        fetchTopCategorias();
    }, []);

    return (
        <Card className="flex flex-col">
            <ChartContainer
                config={chartConfig}
                aspect={1}
                className="mx-auto w-full max-w-[300px] h-[300px] !bg-transparent !border-none !shadow-none p-0 [&>div]:!bg-transparent [&>div]:!shadow-none [&>div]:!border-none"
            >
                {loading ? (
                    <div className="flex items-center justify-center w-full h-full">Carregando...</div>
                ) : chartData.length === 0 ? (
                    <div className="flex items-center justify-center w-full h-full text-sm text-gray-500">
                        Nenhum dado disponível
                    </div>
                ) : (
                    <PieChart width={300} height={300}>
                        <Pie
                            data={chartData}
                            dataKey="total"
                            nameKey="categoria"
                            label
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={["#FFCBD0", "#79B0B0", "#245757"][index % 3]} />
                            ))}
                        </Pie>
                        <ChartLegend
                            content={<ChartLegendContent nameKey="categoria" />}
                            className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
                        />
                    </PieChart>
                )}
            </ChartContainer>
        </Card>
    );
}