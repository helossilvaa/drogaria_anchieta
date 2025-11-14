"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DropdowMenuEstados from "../dropdownEstados/dropdownEstados";
import { CalendarioConfig } from "../calendarioConfig/calendario";
import { ImagePlus } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function DialogConfig({ open, onOpenChange, onFotoAtualizada, usuario }) {
  const [previewImage, setPreviewImage] = useState(null);
  const [formValues, setFormValues] = useState({
    nome: "",
    cpf: "",
    data_nascimento: "",
    email: "",
    telefone: "",
    rua: "",
    numero: "",
    cidade: "",
    estado: "",
    foto: null
  });

  const API_URL = "http://localhost:8080";

  useEffect(() => {
    if (!open || !usuario) return;

    const funcionario = usuario.funcionario;

    setFormValues({
      nome: funcionario?.nome || usuario.nome || "",
      cpf: funcionario?.cpf || "",
      data_nascimento: funcionario?.data_nascimento?.split("T")[0] || "",
      email: funcionario?.email || "",
      telefone: funcionario?.telefone || "",
      rua: funcionario?.logradouro || "",
      numero: funcionario?.numero || "",
      cidade: funcionario?.cidade || "",
      estado: funcionario?.estado || "",
      foto: funcionario?.foto || usuario.foto || null
    });

    setPreviewImage(funcionario?.foto || usuario.foto || null);

  }, [open, usuario]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormValues(prev => ({ ...prev, foto: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token || !usuario) return;

    const funcionarioId = usuario.funcionario?.id;

    let fotoBase64 = formValues.foto?.startsWith("data:image") ? formValues.foto.split(",")[1] : null;

    try {
      const res = await fetch(`${API_URL}/funcionarios/${funcionarioId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formValues,
          foto: fotoBase64,
          data_nascimento: formValues.data_nascimento
            ? new Date(formValues.data_nascimento).toISOString().split("T")[0]
            : null
        })
      });

      if (!res.ok) throw new Error("Erro ao atualizar funcionário");

      toast.success("Dados atualizados com sucesso!");

      if (onFotoAtualizada && formValues.foto) {
        onFotoAtualizada(formValues.foto, true);
      }

      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar alterações");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ToastContainer position="top-right" autoClose={2000} pauseOnHover={false} theme="light" />
      <DialogContent className="!max-w-[900px] p-6">
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
          <DialogDescription>
            Faça alterações no seu perfil aqui. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>

        {/* Foto + Nome */}
        <div className="grid grid-cols-[80px_1fr] gap-3 items-center mb-4">
          <div className="flex flex-col items-center">
            <Label htmlFor="file-upload">Foto</Label>
            <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <label htmlFor="file-upload" className="flex items-center justify-center w-16 h-16 rounded-full border border-dashed border-gray-400 cursor-pointer hover:bg-gray-100 transition overflow-hidden">
              {previewImage ? (
                <img src={previewImage} alt="Pré-visualização" className="w-full h-full object-cover" />
              ) : (
                <ImagePlus className="w-5 h-5 text-gray-600" />
              )}
            </label>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" name="nome" value={formValues.nome} onChange={handleChange} size="sm" />
          </div>
        </div>

        {/* CPF + Data de Nascimento */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="grid gap-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input id="cpf" name="cpf" value={formValues.cpf} onChange={handleChange} size="sm" />
          </div>
          <div className="grid gap-2">
            <Label>Data de Nascimento</Label>
            <CalendarioConfig value={formValues.data_nascimento} onChange={val => setFormValues(prev => ({ ...prev, data_nascimento: val }))} />
          </div>
        </div>

        {/* Email + Telefone */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" value={formValues.email} onChange={handleChange} size="sm" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input id="telefone" name="telefone" value={formValues.telefone} onChange={handleChange} size="sm" />
          </div>
        </div>

        {/* Endereço */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="grid grid-cols-[1fr_100px] gap-2">
            <div className="grid gap-2">
              <Label htmlFor="rua">Rua</Label>
              <Input id="rua" name="rua" value={formValues.rua} onChange={handleChange} size="sm" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="numero">Nº</Label>
              <Input id="numero" name="numero" value={formValues.numero} onChange={handleChange} size="sm" />
            </div>
          </div>
          <div className="grid grid-cols-[1fr_200px] gap-2">
            <div className="grid gap-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input id="cidade" name="cidade" value={formValues.cidade} onChange={handleChange} size="sm" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="estado">Estado</Label>
              <DropdowMenuEstados value={formValues.estado} onChange={val => setFormValues(prev => ({ ...prev, estado: val }))} />
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline" size="sm">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSubmit} size="sm">Salvar alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
