"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
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
  const [fotoArquivo, setFotoArquivo] = useState(null);
  const API_URL = "http://localhost:8080";

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
  });

  useEffect(() => {
    if (!open || !usuario) return;

    const funcionario = usuario.funcionario;

    setFormValues({
      nome: funcionario?.nome || "",
      cpf: funcionario?.cpf || "",
      data_nascimento: funcionario?.data_nascimento?.split("T")[0] || "",
      email: funcionario?.email || "",
      telefone: funcionario?.telefone || "",
      rua: funcionario?.logradouro || "",
      numero: funcionario?.numero || "",
      cidade: funcionario?.cidade || "",
      estado: funcionario?.estado || "",
    });

    
    setPreviewImage(usuario.foto ? `${API_URL}${usuario.foto}` : null);

  }, [open, usuario]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFotoArquivo(file);

   
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    setFormValues(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token || !usuario) return;

    const funcionarioId = usuario.funcionario?.id;
    const usuarioId = usuario.id;

    try {
   
      await fetch(`${API_URL}/funcionarios/${funcionarioId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: formValues.nome,
          cpf: formValues.cpf,
          data_nascimento: formValues.data_nascimento,
          email: formValues.email,
          telefone: formValues.telefone,
          logradouro: formValues.rua,
          numero: formValues.numero,
          cidade: formValues.cidade,
          estado: formValues.estado,
        }),
      });

      let fotoAtualizadaUrl = null;

      
      if (fotoArquivo) {
        const formData = new FormData();
        formData.append("foto", fotoArquivo);

        const response = await fetch(`${API_URL}/usuarios/${usuarioId}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await response.json();

        
        if (data?.foto) {
          fotoAtualizadaUrl = `${API_URL}${data.foto}`;
        }
      }

      toast.success("Dados atualizados com sucesso!");

    
      if (onFotoAtualizada && fotoAtualizadaUrl) {
        onFotoAtualizada(fotoAtualizadaUrl, true);
      }

      onOpenChange(false);

    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar alterações");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ToastContainer position="top-right" autoClose={2000} />
      <DialogContent className="!max-w-[900px] p-6">
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
          <DialogDescription>Altere seus dados e foto.</DialogDescription>
        </DialogHeader>

     
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

        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="grid gap-2">
            <Label>CPF</Label>
            <Input name="cpf" value={formValues.cpf} onChange={handleChange} size="sm" />
          </div>
          <div className="grid gap-2">
            <Label>Data de Nascimento</Label>
            <CalendarioConfig
              value={formValues.data_nascimento}
              onChange={(v) => setFormValues(prev => ({ ...prev, data_nascimento: v }))}
            />
          </div>
        </div>

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

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="grid grid-cols-[1fr_100px] gap-2">
            <div>
              <Label>Rua</Label>
              <Input name="rua" value={formValues.rua} onChange={handleChange} size="sm" />
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
