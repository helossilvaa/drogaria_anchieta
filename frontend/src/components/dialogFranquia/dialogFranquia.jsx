"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PatternFormat } from "react-number-format";

// Dropdowns de estado e cidade
import DropdownEstados from "@/components/dropdownEstados/dropdownEstados";
import DropdownCidades from "@/components/dropdownCidades/cidades";

export default function DialogFranquia({ open, onOpenChange, unidade, onUpdated }) {
  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    email: "",
    telefone: "",
    cep: "",
    estado: "",
    cidade: "",
    numero: "",
    status: "",
    tipo: "",
    data_abertura: "",
  });

  const [funcionarios, setFuncionarios] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredFuncionarios, setFilteredFuncionarios] = useState([]);
  const [selectedFuncionario, setSelectedFuncionario] = useState("");

  useEffect(() => {
    if (unidade) {
      setFormData({
        nome: unidade.nome || "",
        cnpj: unidade.cnpj || "",
        email: unidade.email || "",
        telefone: unidade.telefone || "",
        cep: unidade.cep || "",
        estado: unidade.estado || "",
        cidade: unidade.cidade || "",
        numero: unidade.numero || "",
        status: unidade.status || "",
        tipo: unidade.tipo || "",
        data_abertura: unidade.data_abertura?.split("T")[0] || "",
      });
    }
  }, [unidade]);

  // Buscar funcionários já com departamento
  useEffect(() => {
    async function fetchFuncionarios() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8080/funcionarios`, {
          headers: { authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        // Filtrar apenas gerentes
        const elegiveis = data.filter(f => f.departamentoNome?.toLowerCase() === "gerente");

        setFuncionarios(elegiveis);
        setFilteredFuncionarios(elegiveis);
      } catch (err) {
        console.error("Erro ao buscar funcionários:", err);
      }
    }

    fetchFuncionarios();
  }, []);

  useEffect(() => {
    const filtro = funcionarios.filter(f =>
      f.nome.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredFuncionarios(filtro);
  }, [search, funcionarios]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleCepBlur = async () => {
    const onlyNumbers = formData.cep.replace(/\D/g, "");
    if (onlyNumbers.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${onlyNumbers}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFormData((p) => ({
          ...p,
          estado: data.uf || p.estado,
          cidade: data.localidade || p.cidade,
          logradouro: data.logradouro || p.logradouro,
        }));
      }
    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8080/unidade/${unidade.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Erro ao atualizar unidade");
      toast.success("Unidade atualizada com sucesso!");
      onUpdated();
      onOpenChange(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleNomearGerente = async () => {
    if (!selectedFuncionario) return toast.error("Selecione um funcionário.");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8080/unidade/${unidade.id}/gerente`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ unidadeId: unidade.id, funcionario_id: selectedFuncionario }),
      });
      if (!res.ok) throw new Error("Erro ao nomear gerente administrativo");
      toast.success("Gerente administrativo nomeado com sucesso!");
      onUpdated();
      setSelectedFuncionario("");
      setSearch("");
    } catch (err) {
      toast.error(err.message);
    }
  };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Editar Unidade</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 mt-3">
                    {/* Nome */}
                    <div className="col-span-2 flex flex-col">
                        <Label className="mb-2">Nome da Unidade</Label>
                        <Input name="nome" value={formData.nome} onChange={handleChange} placeholder="Nome da unidade" />
                    </div>

                    {/* CNPJ */}
                    <div className="col-span-2 flex flex-col">
                        <Label className="mb-2">CNPJ</Label>
                        <PatternFormat
                            format="##.###.###/####-##"
                            mask="_"
                            name="cnpj"
                            value={formData.cnpj}
                            disabled
                            customInput={Input}
                        />
                    </div>

                    {/* Email */}
                    <div className="col-span-2 flex flex-col">
                        <Label className="mb-2">E-mail</Label>
                        <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="E-mail" />
                    </div>

                    {/* Telefone */}
                    <div className="flex flex-col">
                        <Label className="mb-2">Telefone</Label>
                        <PatternFormat
                            format="(##) #####-####"
                            mask="_"
                            name="telefone"
                            value={formData.telefone}
                            onValueChange={(values) => setFormData((p) => ({ ...p, telefone: values.value }))}
                            customInput={Input}
                        />
                    </div>

                    {/* CEP */}
                    <div className="flex flex-col">
                        <Label className="mb-2">CEP</Label>
                        <PatternFormat
                            format="#####-###"
                            mask="_"
                            name="cep"
                            value={formData.cep}
                            onValueChange={(values) => setFormData((p) => ({ ...p, cep: values.value }))}
                            customInput={Input}
                            onBlur={handleCepBlur}
                        />
                    </div>

                    {/* Estado */}
                    <div className="flex flex-col">
                        <Label className="mb-2">Estado</Label>
                        <DropdownEstados value={formData.estado} onChange={(uf) => setFormData((p) => ({ ...p, estado: uf, cidade: "" }))} />
                    </div>

                    {/* Cidade */}
                    <div className="flex flex-col">
                        <Label className="mb-2">Cidade</Label>
                        <DropdownCidades estadoSigla={formData.estado} value={formData.cidade} onChange={(cidade) => setFormData((p) => ({ ...p, cidade }))} />
                    </div>

                    {/* Número */}
                    <div className="flex flex-col">
                        <Label className="mb-2">Número</Label>
                        <Input name="numero" value={formData.numero} onChange={handleChange} placeholder="Número" />
                    </div>

                    {/* Status */}
                    <div className="flex flex-col">
                        <Label className="mb-2">Status</Label>
                        <Select value={formData.status} onValueChange={(value) => setFormData((p) => ({ ...p, status: value }))}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ativa">Ativa</SelectItem>
                                <SelectItem value="inativa">Desativada</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tipo */}
                    <div className="flex flex-col">
                        <Label className="mb-2">Tipo</Label>
                        <Select value={formData.tipo} onValueChange={(value) => setFormData((p) => ({ ...p, tipo: value }))}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="franquia">Franquia</SelectItem>
                                <SelectItem value="matriz">Matriz</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Data de Abertura */}
                    <div className="flex flex-col">
                        <Label className="mb-2">Data de Abertura</Label>
                        <Input name="data_abertura" value={formData.data_abertura} disabled type="date" />
                    </div>

                    {/* Nomear gerente administrativo */}
                    <div className="col-span-2 flex flex-col mt-4 border-t pt-4 gap-2">
                        <Label className="mb-2">Nomear gerente administrativo</Label>
                        <Input
                            placeholder="Pesquisar funcionário..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Select onValueChange={(id) => setSelectedFuncionario(id)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione um funcionário" />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredFuncionarios.map(f => (
                                    <SelectItem key={f.id} value={f.id}>
                                        {f.nome}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="verde" onClick={handleNomearGerente}>
                            Nomear gerente administrativo
                        </Button>
                    </div>
                </div>

                <DialogFooter className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="verde">Salvar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
