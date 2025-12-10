"use client";

import { ArrowUp, ArrowDown } from "lucide-react";

export default function TransacoesDashboard({ transacoes = [] }) {
  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm">

      {/* Título */}
      <h2 className="text-xl font-semibold mb-4">Transações</h2>

      {/* Cabeçalho da tabela */}
      <div className="grid grid-cols-2 bg-[#74b4a7] text-white py-2 px-4 rounded-md font-semibold text-sm">
        <span>TIPO</span>
        <span className="text-right">QUANTIA</span>
      </div>

      {/* Linhas */}
      <div className="mt-2 flex flex-col">
        {transacoes.map((t) => (
          <div
            key={t.id}
            className="grid grid-cols-2 py-4 px-2 border-b last:border-b-0 items-center"
          >
            {/* Esquerda: ícone + texto */}
            <div className="flex items-center gap-3">

              {/* Ícone circular igual ao da imagem */}
              <div className="w-12 h-12 rounded-full bg-[#d5f5cb] flex items-center justify-center">
                {t.tipo_movimento === "ENTRADA" ? (
                  <ArrowUp className="text-green-700" size={28} />
                ) : (
                  <ArrowDown className="text-red-700" size={28} />
                )}
              </div>

              {/* Texto */}
              <div className="flex flex-col">
                <span className="font-medium">
                  {t.categoria_nome || "Transação"}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(t.data_transferencia).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>

            {/* Quantia */}
            <div className="text-right font-bold text-lg">
              {t.tipo_movimento === "ENTRADA" ? (
                <span className="text-green-600">
                  +R${Number(t.entradas).toLocaleString("pt-BR")}
                </span>
              ) : (
                <span className="text-red-600">
                  -R${Number(t.saidas).toLocaleString("pt-BR")}
                </span>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
