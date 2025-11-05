"use client";

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
import { Input } from "@heroui/react";
import { CalendarioConfig } from "../calendarioConfig/calendario";
import { ImagePlus } from "lucide-react";
import DropdowMenuEstados from "../dropdownEstados/dropdownEstados";
import { Button } from "@/components/ui/button";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

export function DialogConfig({ open, onOpenChange }) {
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
    if (!open) return;

    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const decoded = jwtDecode(token);
      const id = decoded.id;

      try {
        const res = await fetch(`${API_URL}/usuarios/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erro ao carregar usuário");

        const data = await res.json();

        setFormValues({
          nome: data.nome || "",
          cpf: data.cpf || "",
          data_nascimento: data.data_nascimento
            ? data.data_nascimento.split("T")[0] : "",
          email: data.email || "",
          telefone: data.telefone || "",
          rua: data.logradouro || "",
          numero: data.numero || "",
          cidade: data.cidade || "",
          estado: data.estado || "",
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const decoded = jwtDecode(token);
    const id = decoded.id;

    try {
      const res = await fetch(`${API_URL}/usuarios/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formValues,
          data_nascimento: formValues.data_nascimento
            ? new Date(formValues.data_nascimento)
              .toISOString()
              .split("T")[0]
            : null,
        }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar usuário");

      alert("Dados atualizados com sucesso!");
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar alterações");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[900px] p-6">
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
          <DialogDescription>
            Faça alterações no seu perfil aqui. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-2">
          {/* Linha 1: Foto + Nome */}
          <div className="grid grid-cols-[80px_1fr] gap-3 items-center">
            <div className="flex flex-col items-center">
              <Label htmlFor="file-upload">Foto</Label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center w-16 h-16 rounded-full border border-dashed border-gray-400 cursor-pointer hover:bg-gray-100 transition"
              >
                <ImagePlus className="w-5 h-5 text-gray-600" />
              </label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                name="nome"
                value={formValues.nome}
                onChange={handleChange}
                size="sm"
                className="shadow-none focus:ring-0"
              />
            </div>
          </div>

          {/* Linha 2: CPF + Data de Nascimento */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                name="cpf"
                value={formValues.cpf}
                onChange={handleChange}
                size="sm"
                className="shadow-none focus:ring-0"
              />
            </div>
            <div className="grid gap-2">
              <Label>Data de Nascimento</Label>
              <CalendarioConfig
                value={formValues.data_nascimento}
                onChange={(val) =>
                  setFormValues((prev) => ({ ...prev, data_nascimento: val }))
                }
              />
            </div>
          </div>

          {/* Linha 3: Email + Telefone */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                value={formValues.email}
                onChange={handleChange}
                size="sm"
                className="shadow-none focus:ring-0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                name="telefone"
                value={formValues.telefone}
                onChange={handleChange}
                size="sm"
                className="shadow-none focus:ring-0"
              />
            </div>
          </div>

          {/* Linha 4: Endereço */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid grid-cols-[1fr_100px] gap-2">
              <div className="grid gap-2">
                <Label htmlFor="rua">Rua</Label>
                <Input
                  id="rua"
                  name="rua"
                  value={formValues.rua}
                  onChange={handleChange}
                  size="sm"
                  className="shadow-none focus:ring-0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="numero">Nº</Label>
                <Input
                  id="numero"
                  name="numero"
                  value={formValues.numero}
                  onChange={handleChange}
                  size="sm"
                  className="shadow-none focus:ring-0"
                />
              </div>
            </div>

            <div className="grid grid-cols-[1fr_200px] gap-2">
              <div className="grid gap-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  name="cidade"
                  value={formValues.cidade}
                  onChange={handleChange}
                  size="sm"
                  className="shadow-none focus:ring-0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="estado">Estado</Label>
                <DropdowMenuEstados
                  value={formValues.estado}
                  onValueChange={(val) =>
                    setFormValues((prev) => ({ ...prev, estado: val }))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 mt-2 flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              Cancelar
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} size="sm">
            Salvar alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
