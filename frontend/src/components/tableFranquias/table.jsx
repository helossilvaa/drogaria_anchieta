"use client";
import React, { useEffect, useState } from "react";
import TableBase from "@/components/tableBase/tableBase";
import { MoreVerticalIcon, Trash2Icon, UserPen } from "lucide-react";
import { Button } from "@heroui/react";
import { Dropdown, DropdownMenu, DropdownItem, DropdownTrigger } from "@heroui/react";
// import DialogFranquia from "@/components/dialogFranquia/dialogFranquia";

// Badge colorido
const StatusBadge = ({ status }) => {
  const colors = {
    ativo: "bg-green-100 text-green-700",
    inativo: "bg-red-100 text-red-700",
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-700"}`}>
      {String(status || "").charAt(0).toUpperCase() + String(status || "").slice(1)}
    </span>
  );
};

// Avatar com iniciais (caso queira mostrar um logo ou letra inicial)
const Avatar = ({ nome }) => {
  const initials = nome
    ? nome
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase() || "")
        .join("")
    : "";

  return (
    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-black">
      {initials}
    </div>
  );
};

const columns = [
  {
    name: "Nome",
    uid: "nome",
    sortable: true,
    render: (item) => (
      <div className="flex items-center gap-3">
        <Avatar nome={item.nome} />
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{item.nome}</span>
          <span className="text-xs text-gray-500">{item.email || "-"}</span>
        </div>
      </div>
    ),
  },
  {
    name: "CNPJ",
    uid: "cnpj",
    sortable: true,
    render: (item) => <span className="text-sm">{item.cnpj || "-"}</span>,
  },
  {
    name: "Telefone",
    uid: "telefone",
    sortable: true,
    render: (item) => <span className="text-sm">{item.telefone || "-"}</span>,
  },
  {
    name: "Cidade/Estado",
    uid: "local",
    sortable: true,
    render: (item) => <span className="text-sm">{`${item.cidade || "-"} / ${item.estado || "-"}`}</span>,
  },
  {
    name: "Status",
    uid: "status",
    sortable: true,
    render: (item) => (
      <div className="flex items-center gap-3">
        <StatusBadge status={item.status} />

        <Dropdown className="bg-white shadow-lg rounded-xl">
          <DropdownTrigger>
            <Button variant="light" size="sm" isIconOnly>
              <MoreVerticalIcon size={18} />
            </Button>
          </DropdownTrigger>

          <DropdownMenu>
            <DropdownItem key="edit" startContent={<UserPen size={16} />}>
              {/* <DialogFranquia /> */}
            </DropdownItem>

            <DropdownItem key="delete" className="text-red-500" startContent={<Trash2Icon size={16} />}>
              Excluir
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    ),
  },
];

export default function TableFranquias() {
  const API_URL = "http://localhost:8080";
  const [franquias, setFranquias] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token") || "";

        const res = await fetch(`${API_URL}/unidade`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        setFranquias(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  return <TableBase columns={columns} data={franquias} defaultSortColumn="nome" />;
}
