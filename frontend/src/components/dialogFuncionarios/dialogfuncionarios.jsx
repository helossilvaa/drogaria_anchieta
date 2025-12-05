"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DropdowMenuEstados from "../dropdownEstados/dropdownEstados";
import { CalendarioConfig } from "../calendarioConfig/calendario";
import { ImagePlus } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export function DialogFuncionario({ open, onOpenChange, onSaved, funcionario }) {
  const [previewImage, setPreviewImage] = useState(null);
  const [fotoArquivo, setFotoArquivo] = useState(null);
  const API_URL = "http://localhost:8080";

  const [formValues, setFormValues] = useState({
    registro: "",
    nome: "",
    cpf: "",
    data_nascimento: "",
    email: "",
    telefone: "",
    logradouro: "",
    numero: "",
    cidade: "",
    estado: "",
    cep: "",
    genero: "",
    departamento_id: "",
    status: "ativo",
  });

  useEffect(() => {
    if (!open || !funcionario) return;

    setFormValues({
      registro: funcionario.registro || "",
      nome: funcionario.nome || "",
      cpf: funcionario.cpf || "",
      data_nascimento: funcionario.data_nascimento?.split("T")[0] || "",
      email: funcionario.email || "",
      telefone: funcionario.telefone || "",
      logradouro: funcionario.logradouro || "",
      numero: funcionario.numero || "",
      cidade: funcionario.cidade || "",
      estado: funcionario.estado || "",
      cep: funcionario.cep || "",
      genero: funcionario.genero || "",
      departamento_id: funcionario.departamento_id || "",
      status: funcionario.status || "ativo",
    });

    setPreviewImage(funcionario.foto ? `${API_URL}${funcionario.foto}` : null);
  }, [open, funcionario]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFotoArquivo(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    setFormValues(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // PATCH geral dos dados do funcionário (exceto status)
  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token || !funcionario) return;

    try {
      await fetch(`${API_URL}/funcionarios/${funcionario.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: formValues.nome,
          data_nascimento: formValues.data_nascimento,
          email: formValues.email,
          telefone: formValues.telefone,
          logradouro: formValues.logradouro,
          numero: formValues.numero,
          cidade: formValues.cidade,
          estado: formValues.estado,
          cep: formValues.cep,
          genero: formValues.genero,
          departamento_id: formValues.departamento_id,
        }),
      });

      if (fotoArquivo) {
        const formData = new FormData();
        formData.append("foto", fotoArquivo);

        const response = await fetch(`${API_URL}/funcionarios/${funcionario.id}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await response.json();
        if (data?.foto) setPreviewImage(`${API_URL}${data.foto}`);
      }

      toast.success("Dados do funcionário atualizados!");
      onSaved?.();
      onOpenChange(false);

    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar alterações");
    }
  };

  // PUT apenas para alterar o status
  const handleStatusChange = async (novoStatus) => {
    const token = localStorage.getItem("token");
    if (!token || !funcionario) return;

    try {
      const res = await fetch(`${API_URL}/funcionarios/${funcionario.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: novoStatus }),
      });

      if (!res.ok) throw new Error("Erro ao alterar status");

      toast.success("Status atualizado!");
      setFormValues(prev => ({ ...prev, status: novoStatus }));
      onSaved?.();

    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar status");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ToastContainer position="top-right" autoClose={2000} />
      <DialogContent className="!max-w-[900px] p-6">
        <DialogHeader>
          <DialogTitle>Editar funcionário</DialogTitle>
          <DialogDescription>Altere os dados do funcionário (CPF e registro não podem ser alterados)</DialogDescription>
        </DialogHeader>

        {/* FOTO E NOME */}
        <div className="grid grid-cols-[80px_1fr] gap-3 items-center mb-4">
          <div className="flex flex-col items-center">
            <Label htmlFor="file-upload">Foto</Label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor="file-upload"
              className="flex items-center justify-center w-16 h-16 rounded-full border border-dashed border-gray-400 cursor-pointer hover:bg-gray-100 transition overflow-hidden"
            >
              {previewImage ? (
                <img src={previewImage} className="w-full h-full object-cover" />
              ) : (
                <ImagePlus className="w-5 h-5 text-gray-600" />
              )}
            </label>
          </div>
          <div className="grid gap-2">
            <Label>Nome</Label>
            <Input name="nome" value={formValues.nome} onChange={handleChange} size="sm" />
          </div>
        </div>

        {/* REGISTRO, CPF, DATA */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="grid gap-2">
            <Label>Registro (não pode alterar)</Label>
            <Input name="registro" value={formValues.registro} size="sm" disabled />
          </div>
          <div className="grid gap-2">
            <Label>CPF (não pode alterar)</Label>
            <Input name="cpf" value={formValues.cpf} size="sm" disabled />
          </div>
          <div className="grid gap-2">
            <Label>Data de Nascimento</Label>
            <CalendarioConfig
              value={formValues.data_nascimento}
              onChange={(v) => setFormValues(prev => ({ ...prev, data_nascimento: v }))}
            />
          </div>
        </div>

        {/* EMAIL, TELEFONE */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <Label>Email</Label>
            <Input name="email" value={formValues.email} onChange={handleChange} size="sm" />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input name="telefone" value={formValues.telefone} onChange={handleChange} size="sm" />
          </div>
        </div>

        {/* ENDEREÇO */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="grid grid-cols-[1fr_100px] gap-2">
            <div>
              <Label>Rua</Label>
              <Input name="logradouro" value={formValues.logradouro} onChange={handleChange} size="sm" />
            </div>
            <div>
              <Label>Nº</Label>
              <Input name="numero" value={formValues.numero} onChange={handleChange} size="sm" />
            </div>
          </div>
          <div className="grid grid-cols-[1fr_200px] gap-2">
            <div>
              <Label>Cidade</Label>
              <Input name="cidade" value={formValues.cidade} onChange={handleChange} size="sm" />
            </div>
            <div>
              <Label>Estado</Label>
              <DropdowMenuEstados
                value={formValues.estado}
                onChange={(v) => setFormValues(prev => ({ ...prev, estado: v }))}
              />
            </div>
          </div>
        </div>

        {/* CEP, GÊNERO, STATUS */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <Label>CEP</Label>
            <Input name="cep" value={formValues.cep} onChange={handleChange} size="sm" />
          </div>
          <div>
            <Label>Gênero</Label>
            <Input name="genero" value={formValues.genero} onChange={handleChange} size="sm" />
          </div>
          <div>
            <Label>Status</Label>
            <Select
              value={formValues.status}
              onValueChange={(v) => handleStatusChange(v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="de férias">Férias</SelectItem>
                <SelectItem value="de licença">Licença</SelectItem>
                <SelectItem value="de atestado">Atestado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm">Cancelar</Button>
          </DialogClose>
          <Button size="sm" onClick={handleSubmit}>Salvar alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
