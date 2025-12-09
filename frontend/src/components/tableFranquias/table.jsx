"use client";

import React, { useEffect, useState } from "react";
import TableBase from "@/components/tableBase/tableBase"; // Componente base de tabela
import { MoreVerticalIcon, UserPen, Trash2 } from "lucide-react"; // Ícones
import { Button } from "@/components/ui/button"; // Componente de botão do Shadcn
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Popover do Shadcn
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"; // Menu de comandos dentro do Popover
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
} from "@/components/ui/alert-dialog"; // Modal de confirmação (AlertDialog)
import { toast } from "react-toastify"; // Toast para notificações

import DialogFranquia from "@/components/dialogFranquia/dialogFranquia"; // Modal de edição de franquia
import DialogDetalhesFranquia from "@/components/dialogDetalhesFranquia/dialogDetalhesFranquia"; // Modal de detalhes

// Badge de status (ativa/inativa)
const StatusBadge = ({ status }) => {
  const colors = { ativa: "bg-green-100 text-green-800", inativa: "bg-red-100 text-red-800" };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || "bg-gray-100 text-gray-600"}`}>
      {/* Capitaliza primeira letra */}
      {String(status || "").charAt(0).toUpperCase() + String(status || "").slice(1)}
    </span>
  );
};

// Avatar com iniciais do nome
const Avatar = ({ nome }) => {
  const initials = nome
    ? nome
        .trim()
        .split(/\s+/) // Divide por espaços
        .slice(0, 2) // Pega primeiras duas palavras
        .map((n) => n[0]?.toUpperCase()) // Pega primeira letra e deixa maiúscula
        .join("")
    : "";
  return (
    <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-sm font-bold text-black">
      {initials}
    </div>
  );
};

export default function TableFranquias() {
  const API_URL = "http://localhost:8080";
  const [franquias, setFranquias] = useState([]); // Lista de franquias
  const [selected, setSelected] = useState(null); // Franquia selecionada
  const [openDialog, setOpenDialog] = useState(false); // Abrir modal edição
  const [openDetalhes, setOpenDetalhes] = useState(false); // Abrir modal detalhes
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null }); // Modal de exclusão

  const token = localStorage.getItem("token"); // Token de autenticação

  // Função para carregar franquias
  const loadData = async () => {
    try {
      const res = await fetch(`${API_URL}/unidade`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFranquias(data || []);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar unidades");
    }
  };

  useEffect(() => {
    loadData(); // Carrega franquias ao montar componente
  }, []);

  // Função para deletar unidade
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/unidade/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao excluir");
      toast.success("Unidade excluída com sucesso!");
      loadData(); // Recarrega tabela
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir unidade");
    } finally {
      setDeleteDialog({ open: false, id: null }); // Fecha modal
    }
  };

  // Abrir modal de detalhes
  const handleOpenDetalhes = (item) => {
    if (!item?.id) return toast.warn("Unidade inválida para detalhes.");
    setSelected(item);
    setOpenDetalhes(true);
  };

  // Abrir modal de edição
  const handleOpenEditar = (item) => {
    if (!item?.id) return toast.warn("Unidade inválida para edição.");
    setSelected(item);
    setOpenDialog(true);
  };

  // Colunas da tabela
  const columns = [
    {
      name: "Nome",
      uid: "nome",
      sortable: true,
      render: (item) => (
        <div
          className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md"
          onClick={() => handleOpenDetalhes(item)}
        >
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
      render: (item) => (
        <span className="text-sm">
          {item.cnpj?.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5") || "-"}
        </span>
      ),
    },
    {
      name: "Telefone",
      uid: "telefone",
      sortable: true,
      render: (item) => (
        <span className="text-sm">
          {item.telefone?.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3") || "-"}
        </span>
      ),
    },
    {
      name: "Cidade/Estado",
      uid: "local",
      sortable: true,
      render: (item) => <span className="text-sm">{item.cidade || "-"} / {item.estado || "-"}</span>,
    },
    {
      name: "Status",
      uid: "status",
      sortable: true,
      render: (item) => (
        <div className="flex items-center justify-between">
          {/* Badge de status */}
          <StatusBadge status={item.status} />

          {/* Menu de ações (popover) */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1">
                <MoreVerticalIcon size={18} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-0">
              <Command>
                <CommandList>
                  <CommandGroup>
                    <CommandItem onSelect={() => handleOpenEditar(item)} className="cursor-pointer">
                      <UserPen className="mr-2 h-4 w-4" /> Editar
                    </CommandItem>

                    <CommandItem
                      onSelect={() => item?.id && setDeleteDialog({ open: true, id: item.id })}
                      className="cursor-pointer text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Excluir
                    </CommandItem>

                    <CommandItem onSelect={() => handleOpenDetalhes(item)} className="cursor-pointer text-blue-600">
                      Detalhes
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* AlertDialog para confirmar exclusão */}
          {/* AlertDialog para deletar */}
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
                  Você tem certeza que deseja excluir a unidade {item.nome}? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
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
      {/* Tabela principal */}
      <div className="bg-white shadow rounded-xl p-4">
        <TableBase columns={columns} data={franquias} defaultSortColumn="nome" />
      </div>

      {/* Modal de edição */}
      {openDialog && selected?.id && (
        <DialogFranquia
          open={openDialog}
          unidade={selected}
          onOpenChange={(open) => {
            setOpenDialog(open);
            if (!open) setSelected(null);
          }}
          onUpdated={loadData} // Atualiza tabela após edição
        />
      )}

      {/* Modal de detalhes */}
      {openDetalhes && selected?.id && (
        <DialogDetalhesFranquia
          open={openDetalhes}
          unidadeId={selected.id}
          onOpenChange={(open) => {
            setOpenDetalhes(open);
            if (!open) setSelected(null);
          }}
        />
      )}
    </>
  );
}
