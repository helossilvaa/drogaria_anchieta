"use client"
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import  ChartBarStacked from "@/components/chart-bar-stacked"

export default function DashboardFinanceiro(){
  const [dados, setDados] = useState({
    maiorEntrada: null,
    maiorSaida: null,
    lucroTotal: 0
  });

  useEffect(() => {
    fetch("http://localhost:8080/dashboard-financeiro")
      .then(res => res.json())
      .then(data => setDados(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="p-4 flex flex-col">
          <span className="text-gray-900 font-semibold">Lucro Total</span>
          <span className="font-bold text-3xl">
            R$ {Number(dados.lucroTotal || 0).toFixed(2)}
          </span>
        </div>

        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="bg-muted/50 p-3 rounded-xl flex flex-col">
            <span className="text-gray-700 font-semibold">Filial que mais lucrou</span>
            <span className="text-green-700 font-bold text-2xl">
              {dados.maiorEntrada ? `Filial ${dados.maiorEntrada.unidade_id}` : "--"}
            </span>
          </div>
          <div className="bg-muted/50 p-3 rounded-xl flex flex-col">
            <span className="text-gray-700 font-semibold">Filial que mais gastou</span>
            <span className="text-red-700 font-bold text-2xl">
              {dados.maiorSaida ? `Filial ${dados.maiorSaida.unidade_id}` : "--"}
            </span>
          </div>
          <div className="bg-muted/50 p-3 rounded-xl flex flex-col">
            <span className="text-gray-700 font-semibold">Estoque</span>
            <span className="text-red-700 font-bold text-2xl">
              
            </span>
          </div>
        </div>
        {/* 📊 AQUI ENTRA O GRÁFICO */}
  <div className="mt-4">
    <ChartBarStacked />
  </div>
      </div>
    </>
  );
}
