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

                // logging detalhado para debug
                console.log("FETCH /itens/top-categorias - status:", response.status, response.statusText);
                const ct = response.headers.get("content-type") || "";
                console.log("content-type:", ct);

                // Se não OK, tente extrair mensagem de erro legível e abortar
                if (!response.ok) {
                    // tenta json, se não, texto
                    let errBody;
                    try {
                        errBody = await response.json();
                    } catch {
                        errBody = await response.text().catch(() => "<no body>");
                    }
                    console.error("Erro na API (não ok):", response.status, errBody);
                    setChartData([]); // fallback vazio
                    setChartConfig({});
                    return;
                }

                // tenta ler JSON com segurança
                let data;
                if (ct.includes("application/json")) {
                    try {
                        data = await response.json();
                    } catch (err) {
                        console.error("Falha ao parsear JSON:", err);
                        setChartData([]);
                        setChartConfig({});
                        return;
                    }
                } else {
                    // se não for JSON (html/text), log e aborta
                    const txt = await response.text().catch(() => "<no body>");
                    console.error("Resposta não-JSON recebida:", txt);
                    setChartData([]);
                    setChartConfig({});
                    return;
                }

                console.log("JSON RECEBIDO (raw):", data);

                // normalize: se o backend retornou { data: [...] } ou { resultado: [...] }
                let arr;
                if (Array.isArray(data)) {
                    arr = data;
                } else if (Array.isArray(data.data)) {
                    arr = data.data;
                } else if (Array.isArray(data.resultado)) {
                    arr = data.resultado;
                } else {
                    // se vier objeto único, talvez seja erro ou estrutura inesperada
                    console.error("Estrutura inesperada recebida (não é array):", data);
                    setChartData([]);
                    setChartConfig({});
                    return;
                }

                // agora é seguro mapear
                const formattedData = arr.map((item) => ({
                    categoria: item.categoria ?? item.categoria_nome ?? item.nome ?? String(item[0] ?? ""),
                    total: Number(item.total ?? item.qtd ?? item.quantidade ?? 0),
                }));

                // gera cores previsíveis (padrão)
                const colors = ["#FFCBD0", "#ADD9D9", "#245757"];
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
                className="mx-auto aspect-square max-h-[300px] !bg-transparent !border-none !shadow-none p-0 [&>div]:!bg-transparent [&>div]:!shadow-none [&>div]:!border-none"
            >

                {loading ? (
                    <div className="flex items-center justify-center w-full h-full">Carregando...</div>
                ) : chartData.length === 0 ? (
                    <div className="flex items-center justify-center w-full h-full text-sm text-gray-500">
                        Nenhum dado disponível
                    </div>
                ) : (
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
                )}
            </ChartContainer>
        </Card>
    );
}