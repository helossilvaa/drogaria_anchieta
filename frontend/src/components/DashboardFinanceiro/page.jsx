"use client";

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import ChartBarStacked from "@/components/chart-bar-stacked";
import TransacoesDashboard from "../transacoesDashboard";
import { GanhosCard } from "../cardGanhos";
import { GastosCard } from "../cardGastos";

export default function DashboardFinanceiro() {
    const [dados, setDados] = useState({
        maiorEntrada: null,
        maiorSaida: null,
        lucroTotal: 0,
        gastosTotal: 0,
    });

    const nomesUnidades = [
        "Drogaria Anchieta Matriz",
        "Drogaria Anchieta São Bernardo",
        "Drogaria Anchieta BH",
        "Drogaria Anchieta Curitiba",
        "Drogaria Anchieta Porto Alegre"
    ];


    const [graficoData, setGraficoData] = useState([]);
    const [transacoes, setTransacoes] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8080/dashboard-financeiro")
            .then((res) => res.json())
            .then((data) => setDados(data))
            .catch((err) => console.error("Erro no dashboard:", err));

        fetch("http://localhost:8080/dashboard-financeiro/dashboard-grafico")
            .then((res) => res.json())
            .then((data) => setGraficoData(data))
            .catch((err) => console.error("Erro no gráfico:", err));

        fetch("http://localhost:8080/dashboard-financeiro/ultimas-transacoes?limit=5")
            .then((res) => res.json())
            .then((data) => setTransacoes(data))
            .catch((err) => console.error("Erro nas transações:", err));
    }, []);

    return (
        <>
            <header className="flex h-16 items-center gap-2 border-b px-4">
                <Separator orientation="vertical" className="mr-2 h-4" />
            </header>

            <main className="flex flex-col flex-1 gap-6 p-6 bg-white">
                {/* Lucro Total */}
                <section className="flex flex-col">
                    <span className="text-gray-900 font-semibold text-lg mb-1">Lucro Total</span>
                    <span className="font-extrabold text-4xl">
                        R${" "}
                        {Number(dados.lucroTotal || 0).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                        })}
                    </span>
                </section>

                {/* Cards principais */}
                <section className="grid grid-cols-3 gap-4">
                    {/* Filial com mais lucros */}
                    <div className="bg-gray-100 rounded-xl p-4 flex flex-col">
                        <span className="text-gray-700 font-semibold text-sm mb-1">Filial com mais lucros</span>
                        <span className="text-green-700 font-extrabold text-2xl">
                            {dados.maiorEntrada
                                ? nomesUnidades[dados.maiorEntrada.unidade_id] || `Filial ${dados.maiorEntrada.unidade_id}`
                                : "--"}
                        </span>
                    </div>

                    {/* Filial com mais gastos */}
                    <div className="bg-gray-100 rounded-xl p-4 flex flex-col">
                        <span className="text-gray-700 font-semibold text-sm mb-1">Filial com mais gastos</span>
                        <span className="text-red-700 font-extrabold text-2xl">
                            {dados.maiorSaida
                                ? nomesUnidades[dados.maiorSaida.unidade_id] || `Filial ${dados.maiorSaida.unidade_id}`
                                : "--"}
                        </span>
                    </div>


                    <div className="bg-gray-100 rounded-xl p-4 flex flex-col">
                        <span className="text-gray-700 font-semibold text-sm mb-1">Ação que mais ocorreu</span>
                        <span
                            className={`font-extrabold text-2xl ${dados.acaoMaisFrequente === "entrada" ? "text-green-700" : "text-red-700"
                                }`}
                        >
                            {dados.acaoMaisFrequente === "entrada" ? "Entrada" : "Saída"}
                        </span>

                    </div>
                </section>

                {/* Gráfico barras */}
                <section className="mt-4">
                    <ChartBarStacked dados={graficoData} />
                </section>

                <div className="mt-6 grid grid-cols-12 gap-6">
                    {/* Transações - coluna esquerda ocupando 8/12 */}
                    <div className="col-span-8 h-full">
                        <TransacoesDashboard transacoes={transacoes} />
                    </div>

                    {/* Cards Ganhos e Gastos - coluna direita ocupando 4/12 */}
                    <div className="col-span-4 flex flex-col gap-4">
                        <GanhosCard valor={dados.lucroTotal} />
                        <GastosCard valor={dados.gastosTotal} />
                    </div>
                </div>
            </main>
        </>
    );
}
