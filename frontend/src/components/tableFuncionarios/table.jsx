"use client";
import React, { useEffect, useState } from "react";
import TableBase from "@/components/tableBase/tableBase";
import {  MoreVerticalIcon,Trash2Icon, UserPen } from "lucide-react";
import { Button } from "@heroui/react";
import { Dropdown, DropdownMenu, DropdownItem, DropdownTrigger } from "@heroui/react";
import { DialogFuncionario } from "@/components/dialogFuncionarios/dialogfuncionarios";

// Badge colorido
const StatusBadge = ({ status }) => {
  const colors = {
    ativo: "bg-green-100 text-green-700",
    inativo: "bg-red-100 text-red-700",
    ferias: "bg-yellow-100 text-yellow-700",
    licença: "bg-blue-100 text-blue-700",
    atestado: "bg-brown-100 text-brown-700"
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        colors[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {String(status || "").charAt(0).toUpperCase() + String(status || "").slice(1)}
    </span>
  );
};

// Avatar com Fallback COMPLETO
const Avatar = ({ nome, foto }) => {
  const [imgErro, setImgErro] = useState(false);

  // Se tem foto válida e não deu erro → mostra a foto
  if (foto && !imgErro) {
    return (
      <img
        src={foto}
        alt={nome}
        className="w-9 h-9 object-cover rounded-full"
        onError={() => setImgErro(true)} 
      />
    );
  }

  // Caso contrário, mostra iniciais
  const initials = nome
    ? nome
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase() || "")
        .join("")
    : "";

  return (
    <div
      className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-sm font-bold text-black avatar-initials"
      aria-hidden
    >
      {initials}
    </div>
  );
};

const columns = [
  {
    name: "Nome",
    uid: "name",
    sortable: true,
    render: (item) => (
      <div className="flex items-center gap-3">
        <Avatar nome={item.nome} foto={item.foto} />
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
      <span className="text-sm capitalize">
        {item.departamentoNome || "-"}
      </span>
    ),
  },
  {
    name: "Telefone",
    uid: "telefone",
    sortable: true,
    render: (item) => (
      <span className="text-sm capitalize">{item.telefone || "-"}</span>
    )
  },
  {
    name: "Gênero",
    uid: "genero",
    sortable: true,
    render: (item) => (
      <span className="text-sm capitalize">{item.genero || "-"}</span>
    ),
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
          <Button
            variant="light"
            size="sm"
            isIconOnly
          >
            <MoreVerticalIcon size={18} />
          </Button>
        </DropdownTrigger>

        <DropdownMenu>
          <DropdownItem
            key="edit"
            startContent={<UserPen size={16} />}
          >
           <DialogFuncionario/>
            
          </DropdownItem>

          <DropdownItem
            key="delete"
            className="text-red-500"
            startContent={<Trash2Icon size={16} />}
          >
            Excluir
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
          
      </div>
    ),
  },
];

export default function TableFuncionarios() {
  
  const API_URL = "http://localhost:8080";
  const [funcionarios, setFuncionarios] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token") || "";

        const [funcRes, depRes] = await Promise.all([
          fetch(`${API_URL}/funcionarios/unidade`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/departamento`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const funcionariosRaw = await funcRes.json();
        const departamentos = await depRes.json();

        const depMap = {};
        departamentos.forEach((d) => (depMap[d.id] = d.departamento));

        const funcionariosComDep = funcionariosRaw.map((f) => ({
          ...f,
          departamentoNome: depMap[f.departamento_id] || "-",
        }));

        setFuncionarios(funcionariosComDep);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  return (
    <TableBase columns={columns} data={funcionarios} defaultSortColumn="name" />
  );
}
