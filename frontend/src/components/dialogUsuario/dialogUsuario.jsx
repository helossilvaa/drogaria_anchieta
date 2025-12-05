"use client";

import React, { useState, useEffect } from "react";
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
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function DialogUsuario({ open, onOpenChange, funcionario, onCreated }) {
  const [senha, setSenha] = useState("");
  const [usuarioExistente, setUsuarioExistente] = useState(false);

  // Limpa a senha e verifica existência sempre que abrir
  useEffect(() => {
    setSenha("");
    if (funcionario) {
      // Se funcionário tiver usuário, habilita modo atualização
      setUsuarioExistente(!!funcionario.usuarioId);
    }
  }, [open, funcionario]);

  const handleSubmit = async () => {
    try {
      if (!senha) {
        toast.error("Digite a senha!");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token || !funcionario) return;

      let res;

      if (usuarioExistente) {
        // PATCH para alterar senha
        res = await fetch(
          `http://localhost:8080/auth/usuarios/${funcionario.usuarioId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ senha }),
          }
        );
      } else {
        // POST para criar usuário
        const formData = new FormData();
        formData.append("funcionario_id", funcionario.id);
        formData.append("senha", senha);
        formData.append("departamento_id", funcionario.departamento_id);

        res = await fetch("http://localhost:8080/auth/cadastro", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.mensagem || "Erro ao criar/alterar usuário");
      }

      toast.success(
        usuarioExistente
          ? "Senha alterada com sucesso!"
          : "Usuário criado com sucesso!"
      );

      onCreated?.();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error(`Erro: ${err.message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ToastContainer position="top-right" autoClose={2000} />
      <DialogContent className="!max-w-[400px] p-6">
        <DialogHeader>
          <DialogTitle>
            {usuarioExistente ? "Alterar senha" : "Criar usuário"}
          </DialogTitle>
          <DialogDescription>
            {usuarioExistente
              ? `Altere a senha do usuário do funcionário ${funcionario?.nome}`
              : `Crie o usuário para o funcionário ${funcionario?.nome}`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 mt-4">
          <div>
            <Label>Email (do funcionário)</Label>
            <Input value={funcionario?.email || ""} size="sm" disabled />
          </div>

          <div>
            <Label>Senha</Label>
            <Input
              name="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              size="sm"
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              Cancelar
            </Button>
          </DialogClose>
          <Button size="sm" onClick={handleSubmit}>
            {usuarioExistente ? "Alterar senha" : "Criar usuário"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
