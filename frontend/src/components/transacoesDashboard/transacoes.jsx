"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { ArrowUp, Clock } from "lucide-react";

export default function CardTransacoes({ entradas, saidas, lucro, percentual }) {
  return (
    <Card className="p-4 bg-white shadow-md">
      <CardHeader className="pb-2">
        <CardTitle>Evolução de Vendas</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Entradas */}
        <div className="flex flex-col">
          <span className="text-sm text-gray-500">Entradas</span>
          <span className="text-2xl font-bold text-gray-900">
            R${entradas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Saídas */}
        <div className="flex flex-col">
          <span className="text-sm text-gray-500">Saídas</span>
          <span className="text-2xl font-bold text-gray-900">
            R${saidas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Lucro Líquido */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Lucro Líquido</span>
            <span className="text-2xl font-bold text-gray-900">
              R${lucro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Badge percentual */}
          <div className="flex items-center gap-2 bg-teal-700 text-white px-3 py-1 rounded-lg text-sm">
            <Clock size={16} />
            <div className="flex flex-col">
              <span>{lucro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              <span className="flex items-center gap-1">
                <ArrowUp size={14} /> {percentual}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
