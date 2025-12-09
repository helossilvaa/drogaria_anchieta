"use client";

import React, { useState, useEffect } from "react";
import TableBase from "@/components/tableBase/tableBase"; // Componente base de tabela
import { MoreVerticalIcon, Trash2, UserPen } from "lucide-react"; 
import { Button } from "@/components/ui/button"; // Botões estilizados
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; 
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"; // Lista de ações dentro do popover
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"; // Modal de confirmação para exclusão

import { DialogUsuario } from "@/components/dialogUsuario/dialogUsuario"; // Modal para criar usuário
import { DialogFuncionario } from "../dialogFuncionarios/dialogfuncionarios"; // Modal para editar funcionário
import { toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";
import { useUser } from "@/components/context/userContext"; // Contexto do usuário logado

// Badge colorido para status
const StatusBadge = ({ status }) => {
  const colors = {
    ativo: "bg-green-100 text-green-700",
    inativo: "bg-red-100 text-red-700",
    ferias: "bg-yellow-100 text-yellow-700",
    licença: "bg-blue-100 text-blue-700",
    atestado: "bg-orange-100 text-orange-700",
  };
  // Retorna badge estilizada
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-700"}`}>
      {String(status || "").charAt(0).toUpperCase() + String(status || "").slice(1)}
    </span>
  );
};

// Avatar do funcionário com fallback para iniciais
const Avatar = ({ nome, foto }) => {
  const [imgErro, setImgErro] = useState(false);

  if (foto && !imgErro) {
    return (
      <img
        src={`http://localhost:8080${foto}`}
        alt={nome}
        className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 object-cover rounded-full"
        onError={() => setImgErro(true)}
      />
    );
  }

  // Gera iniciais do nome
  const initials = nome
    ? nome.trim().split(/\s+/).slice(0, 2).map(n => n[0]?.toUpperCase()).join("")
    : "";

  return (
    <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gray-200 flex items-center justify-center text-sm sm:text-base font-bold text-black">
      {initials}
    </div>
  );
};

export default function TableFuncionarios() {
  const API_URL = "http://localhost:8080";
  const usuario = useUser();
  const [funcionarios, setFuncionarios] = useState([]);
  const [openDialogUsuario, setOpenDialogUsuario] = useState(false);
  const [openDialogFuncionario, setOpenDialogFuncionario] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  // Verifica se o usuário é diretor geral para permitir acesso completo
  const isDiretorGeral = usuario?.funcionario?.departamentoNome?.toLowerCase() === "diretor geral";

  // Função para buscar funcionários da API
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token") || "";

      const funcUrl = isDiretorGeral ? `${API_URL}/funcionarios` : `${API_URL}/funcionarios/unidade`;

      // Busca funcionários e departamentos simultaneamente
      const [funcRes, depRes] = await Promise.all([
        fetch(funcUrl, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/departamento`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const funcionariosRaw = await funcRes.json();
      const departamentos = await depRes.json();

      // Mapeia departamento pelo id
      const depMap = {};
      departamentos.forEach(d => (depMap[d.id] = d.departamento));

      // Adiciona nome do departamento aos funcionários
      const funcionariosComDep = funcionariosRaw.map(f => ({
        ...f,
        departamentoNome: depMap[f.departamento_id] || "-",
      }));

      setFuncionarios(funcionariosComDep);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar funcionários");
    }
  };

  useEffect(() => { fetchData(); }, [isDiretorGeral]);

  // Função para deletar funcionário
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_URL}/funcionarios/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
  
      if (!res.ok) throw new Error(data.mensagem || "Erro ao excluir usuário");
  
      toast.success(data.mensagem);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Erro ao excluir usuário");
    } finally {
      setDeleteDialog({ open: false, id: null });
    }
  };

  // Define colunas da tabela
  const columns = [
    {
      name: "Nome",
      uid: "nome",
      sortable: true,
      render: item => (
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
      render: item => <span className="text-sm capitalize">{item.departamentoNome || "-"}</span>,
    },
    {
      name: "Telefone",
      uid: "telefone",
      sortable: true,
      render: item => <span className="text-sm">{item.telefone || "-"}</span>,
    },
    {
      name: "Status",
      uid: "status",
      sortable: true,
      render: item => (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <StatusBadge status={item.status} />

          {/* Popover com ações */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="light" size="sm" className="sm:w-auto">
                <MoreVerticalIcon size={18} />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-48 p-0">
              <Command>
                <CommandList>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setSelectedFuncionario(item);
                        setOpenDialogUsuario(true);
                      }}
                      className="cursor-pointer"
                    >
                      Criar Usuário
                    </CommandItem>
                    <CommandItem
                      onSelect={() => {
                        setSelectedFuncionario(item);
                        setOpenDialogFuncionario(true);
                      }}
                      className="cursor-pointer"
                    >
                      <UserPen className="mr-2 h-4 w-4" /> Editar
                    </CommandItem>
                    <CommandItem
                      onSelect={() => setDeleteDialog({ open: true, id: item.id })}
                      className="cursor-pointer text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Excluir
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Modal de confirmação para exclusão */}
          <AlertDialog
            open={deleteDialog.open && deleteDialog.id === item.id}
            onOpenChange={(open) => setDeleteDialog({ open, id: item.id })}
          >
            <AlertDialogTrigger asChild>
              <div />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirma exclusão?</AlertDialogTitle>
                <AlertDialogDescription>
                  Você tem certeza que deseja excluir o usuário {item.nome}? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(item.id)}>Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="overflow-x-auto">
        <TableBase columns={columns} data={funcionarios} defaultSortColumn="nome" />
      </div>

      {/* Modais de usuário e funcionário */}
      {selectedFuncionario && (
        <>
          <DialogUsuario
            open={openDialogUsuario}
            onOpenChange={setOpenDialogUsuario}
            funcionario={selectedFuncionario}
            onCreated={fetchData}
          />
          <DialogFuncionario
            open={openDialogFuncionario}
            onOpenChange={setOpenDialogFuncionario}
            funcionario={selectedFuncionario}
            onSaved={fetchData}
          />
        </>
      )}
    </>
  );
}
