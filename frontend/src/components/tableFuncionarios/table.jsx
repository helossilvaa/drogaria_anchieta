"use client";
import React, { useEffect, useState } from "react";
import TableBase from "@/components/tableBase/tableBase";

// Badge colorido
const StatusBadge = ({ status }) => {
  const colors = {
    ativa: "bg-green-100 text-green-700",
    inativa: "bg-yellow-100 text-yellow-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-700"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Colunas da tabela
const columns = [
  {
    name: "Nome",
    uid: "name",
    sortable: true,
    render: (item) => (
      <div className="flex items-center gap-3">
        <img
          src={item.avatar || "https://placehold.co/150x150/000000/FFFFFF?text=AV"}
          alt={item.nome}
          className="w-9 h-9 object-cover rounded-full"
        />
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{item.nome}</span>
          <span className="text-xs text-gray-500">{item.email}</span>
        </div>
      </div>
    ),
  },
  {
    name: "Departamento",
    uid: "departamento",
    sortable: true,
    render: (item) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium capitalize">{item.departamento || "-"}</span>
      </div>
    ),
  },
  {
    name: "Telefone",
    uid: "telefone",
    sortable: true,
  },
  {
    name: "Genero",
    uid: "Genero",
    sortable: true,
  },
  {
    name: "Status",
    uid: "status",
    sortable: true,
    render: (item) => <StatusBadge status={item.status} />,
  },
];

export default function TableFuncionarios() {
  const API_URL = "http://localhost:8080";
  const [funcionarios, setFuncionarios] = useState([]);

  useEffect(() => {
    const fetchFuncionarios = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const res = await fetch(`${API_URL}/funcionarios/unidade`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (!res.ok) throw new Error("Erro ao buscar funcionários");
  
        const data = await res.json();
        setFuncionarios(data);
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchFuncionarios();
  }, []);
  

  return <TableBase columns={columns} data={funcionarios} defaultSortColumn="name" />;
}
