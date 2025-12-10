"use client";

import React, { useState, useEffect } from "react";
import TableBase from "@/components/tableBase/tableBase";
import { MoreVerticalIcon, Trash2, UserPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

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

import { DialogUsuario } from "@/components/dialogUsuario/dialogUsuario";
import { DialogFuncionario } from "../dialogFuncionarios/dialogfuncionarios";
import { toast } from "react-toastify";
import { useUser } from "@/components/context/userContext";

// Badge de status
const StatusBadge = ({ status }) => {
  const colors = {
    ativo: "bg-green-100 text-green-700",
    inativo: "bg-red-100 text-red-700",
    ferias: "bg-yellow-100 text-yellow-700",
    licença: "bg-blue-100 text-blue-700",
    atestado: "bg-orange-100 text-orange-700",
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

// Avatar com fallback
const Avatar = ({ nome, foto }) => {
  const [imgErro, setImgErro] = useState(false);

  if (foto && !imgErro) {
    return (
      <img
        src={`http://localhost:8080${foto}`}
        alt={nome}
        className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
        onError={() => setImgErro(true)}
      />
    );
  }

  const initials = nome
    ? nome.trim().split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase()).join("")
    : "";

  return (
    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-300 flex items-center justify-center text-sm md:text-base font-semibold">
      {initials}
    </div>
  );
};

export default function TableFuncionarios() {
  const API_URL = "http://localhost:8080";
  const usuario = useUser();

  const [funcionarios, setFuncionarios] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [openDialogUsuario, setOpenDialogUsuario] = useState(false);
  const [openDialogFuncionario, setOpenDialogFuncionario] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  //identificar se o departamento é diretor geral (tabela modifica)
  const isDiretorGeral = usuario?.funcionario?.departamentoNome?.toLowerCase() === "diretor geral";

  // filtros
  const [filtroUnidade, setFiltroUnidade] = useState("todas");
  const [filtroDepartamento, setFiltroDepartamento] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  // buscar dados
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token") || "";

      const funcUrl = isDiretorGeral
        ? `${API_URL}/funcionarios`
        : `${API_URL}/funcionarios/unidade`;

      const [funcRes, depRes] = await Promise.all([
        fetch(funcUrl, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/departamento`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const funcionariosRaw = await funcRes.json();
      const departamentosData = await depRes.json();
      setDepartamentos(departamentosData);

      // busca unidades só se DG
      let unidadesData = [];
      if (isDiretorGeral) {
        const uniRes = await fetch(`${API_URL}/unidade`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        unidadesData = await uniRes.json();
        setUnidades(unidadesData);
      }

      // map departamento
      const depMap = {};
      departamentosData.forEach((d) => (depMap[d.id] = d.departamento));

      // map unidade
      const uniMap = {};
      unidadesData.forEach((u) => (uniMap[u.id] = u.nome));

      // monta objeto final
      const funcionariosFinal = funcionariosRaw.map((f) => ({
        ...f,
        departamentoNome: depMap[f.departamento_id] || "-",
        unidadeNome: isDiretorGeral ? uniMap[f.unidade_id] || "-" : null,
      }));

      setFuncionarios(funcionariosFinal);

    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar funcionários");
    }
  };

  useEffect(() => {
    fetchData();
  }, [isDiretorGeral]);

  // filtragem
  const funcionariosFiltrados = funcionarios.filter((f) => {
    const matchUnidade =
      filtroUnidade === "todas" || String(f.unidade_id) === String(filtroUnidade);

    const matchDepartamento =
      filtroDepartamento === "todos" || String(f.departamento_id) === String(filtroDepartamento);

    const matchStatus = filtroStatus === "todos" || f.status === filtroStatus;

    return matchUnidade && matchDepartamento && matchStatus;
  });

  // limpar filtros
  const limparFiltros = () => {
    setFiltroUnidade("todas");
    setFiltroDepartamento("todos");
    setFiltroStatus("todos");
  };

  // colunas da tabela
  const columns = [
    {
      name: "Nome",
      uid: "nome",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <Avatar nome={item.nome} foto={item.foto} />
          <div>
            <p className="font-semibold text-sm">{item.nome}</p>
            <p className="text-xs text-gray-600">{item.email}</p>
          </div>
        </div>
      ),
    },

    {
      name: "Departamento",
      uid: "departamento",
      sortable: true,
      render: (item) => (
        <span className="capitalize text-sm">{item.departamentoNome || "-"}</span>
      ),
    },

    {
      name: "Telefone",
      uid: "telefone",
      render: (item) => <span className="text-sm">{item.telefone || "-"}</span>,
    },

    {
      name: "Status",
      uid: "status",
      render: (item) => (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <StatusBadge status={item.status} />

          {/* menu ações */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="light" size="sm">
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
                    >
                      Criar Usuário
                    </CommandItem>

                    <CommandItem
                      onSelect={() => {
                        setSelectedFuncionario(item);
                        setOpenDialogFuncionario(true);
                      }}
                    >
                      <UserPen className="w-4 h-4 mr-2" />
                      Editar
                    </CommandItem>

                    <CommandItem
                      className="text-red-600"
                      onSelect={() =>
                        setDeleteDialog({ open: true, id: item.id })
                      }
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Excluir
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* modal delete */}
          <AlertDialog
            open={deleteDialog.open && deleteDialog.id === item.id}
            onOpenChange={(open) => setDeleteDialog({ open, id: item.id })}
          >
            <AlertDialogTrigger />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Funcionário</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir {item.nome}?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(item.id)}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* FILTROS - responsivo */}
      <div className="w-full flex flex-wrap justify-center md:justify-end gap-4 mb-6">

        {/* filtro unidade */}
        {isDiretorGeral && (
          <div className="min-w-[160px]">
            <p className="text-xs text-gray-600 mb-1">Unidade</p>
            <Select onValueChange={setFiltroUnidade} value={filtroUnidade}>
              <SelectTrigger className="h-11 min-w-[180px]">
                <SelectValue placeholder="Selecionar unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {unidades.map((u) => (
                  <SelectItem key={u.id} value={String(u.id)}>
                    {u.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* filtro departamento */}
        <div className="min-w-[160px]">
          <p className="text-xs text-gray-600 mb-1">Departamento</p>
          <Select onValueChange={setFiltroDepartamento} value={filtroDepartamento}>
            <SelectTrigger className="h-11 min-w-[180px]">

              <SelectValue placeholder="Selecionar departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {departamentos.map((d) => (
                <SelectItem key={d.id} value={String(d.id)}>
                  {d.departamento}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* filtro status */}
        <div className="min-w-[160px]">
          <p className="text-xs text-gray-600 mb-1">Status</p>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="h-11 min-w-[180px]">
              <SelectValue placeholder="Selecionar status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
              <SelectItem value="ferias">Férias</SelectItem>
              <SelectItem value="licença">Licença</SelectItem>
              <SelectItem value="atestado">Atestado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* limpar filtros */}
        <div className="flex items-end min-w-[130px]">
          <Button variant="outline" className="w-full" onClick={limparFiltros}>
            Limpar filtros
          </Button>
        </div>
      </div>

      {/* tabela */}
      <div className="overflow-x-auto">
        <TableBase columns={columns} data={funcionariosFiltrados} defaultSortColumn="nome" />
      </div>

      {/* modais */}
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
