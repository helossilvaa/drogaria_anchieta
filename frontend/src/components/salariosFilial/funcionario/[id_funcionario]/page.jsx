"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function SalarioFuncionario() {
  const params = useParams();
  const { id_funcionario } = params;
  const [salarios, setSalarios] = useState([]);

  useEffect(() => {
    const fetchSalarios = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8080/api/salariosFilial/funcionario/${id_funcionario}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSalarios(data);
    };

    fetchSalarios();
  }, [id_funcionario]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Salários do Funcionário {id_funcionario}</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Valor</th>
            <th className="p-2">Status</th>
            <th className="p-2">Data</th>
          </tr>
        </thead>
        <tbody>
          {salarios.map((s) => (
            <tr key={s.id} className="border-t">
              <td className="p-2">{s.valor}</td>
              <td className="p-2">{s.status_pagamento}</td>
              <td className="p-2">{new Date(s.data_atualizado).toLocaleDateString("pt-BR")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
