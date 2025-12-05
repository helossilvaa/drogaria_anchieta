"use client";

import React, { useEffect, useState } from "react";
import TableBase from "@/components/tableBase/tableBase";
import { MoreVerticalIcon, UserPen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
} from "@/components/ui/alert-dialog";

import DialogFranquia from "@/components/dialogFranquia/dialogFranquia";
import { toast } from "react-toastify";

const StatusBadge = ({ status }) => {
  const colors = { ativa: "bg-green-100 text-green-700", inativa: "bg-red-100 text-red-700" };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-700"}`}>
      {String(status || "").charAt(0).toUpperCase() + String(status || "").slice(1)}
    </span>
  );
};

const Avatar = ({ nome }) => {
  const initials = nome
    ? nome
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase())
        .join("")
    : "";
  return (
    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-black">
      {initials}
    </div>
  );
};

export default function TableFranquias() {
  const API_URL = "http://localhost:8080";
  const [franquias, setFranquias] = useState([]);
  const [selected, setSelected] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  const loadData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/unidade`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setFranquias(data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar unidades");
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/unidade/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Erro ao excluir");
      toast.success("Unidade excluída com sucesso!");
      loadData();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir unidade");
    } finally {
      setDeleteDialog({ open: false, id: null });
    }
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
      render: (item) => (
        <span className="text-sm">{item.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")}</span>
      ),
    },
    {
      name: "Telefone",
      uid: "telefone",
      sortable: true,
      render: (item) => (
        <span className="text-sm">{item.telefone.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3")}</span>
      ),
    },
    {
      name: "Cidade/Estado",
      uid: "local",
      sortable: true,
      render: (item) => <span className="text-sm">{item.cidade} / {item.estado}</span>,
    },
    {
      name: "Status",
      uid: "status",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <StatusBadge status={item.status} />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="light" size="sm">
                <MoreVerticalIcon size={18} />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-40 p-0">
              <Command>
                <CommandList>
                  <CommandGroup>
                    <CommandItem onSelect={() => { setSelected(item); setOpenDialog(true); }} className="cursor-pointer">
                      <UserPen className="mr-2 h-4 w-4" /> Editar
                    </CommandItem>

                    <CommandItem onSelect={() => setDeleteDialog({ open: true, id: item.id })} className="cursor-pointer text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" /> Excluir
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* AlertDialog para deletar */}
          <AlertDialog open={deleteDialog.open && deleteDialog.id === item.id} onOpenChange={(open) => setDeleteDialog({ open, id: item.id })}>
            <AlertDialogTrigger asChild><div /></AlertDialogTrigger>
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
      <TableBase columns={columns} data={franquias} defaultSortColumn="nome" />
      {openDialog && selected && (
        <DialogFranquia open={openDialog} unidade={selected} onOpenChange={setOpenDialog} onUpdated={loadData} />
      )}
    </>
  );
}
