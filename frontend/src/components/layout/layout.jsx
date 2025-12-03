"use client";

import Sidebar from "@/components/sidebar/sidebar";
import { Search } from "lucide-react";
import { ComboboxDemo } from "../combobox/combobox";
import { PopoverNotificacoes } from "../notificacoes/notificacoes";
import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "../../app/loading";
import React from "react";  

export default function Layout({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const API_URL = "http://localhost:8080";
  const router = useRouter();

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return router.push("/");

        const decoded = jwtDecode(token);

        // Verifica expiração
        if (decoded.exp < Date.now() / 1000) {
          localStorage.removeItem("token");
          return router.push("/");
        }

        // Buscar o usuário pelo ID do token
        const usuarioRes = await fetch(`${API_URL}/usuarios/${decoded.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!usuarioRes.ok) throw new Error("Usuário não encontrado");
        const usuarioData = await usuarioRes.json();

        // Buscar o funcionário vinculado
        const funcionarioId = usuarioData.funcionario_id;

        const funcionarioRes = await fetch(`${API_URL}/funcionarios/${funcionarioId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!funcionarioRes.ok) throw new Error("Funcionário não encontrado");
        const funcionarioData = await funcionarioRes.json();

        // verificar departamento vindo do funcionario
        const departamentoFuncionario = funcionarioData.departamento?.toLowerCase();

        const allowed = ["diretor geral", "diretor administrativo", "gerente", "caixa"];

        if (!allowed.includes(departamentoFuncionario)) {
          console.log("não permitido:", departamentoFuncionario);
          localStorage.removeItem("token");
          return router.push("/");
        }

        setUsuario({
          ...usuarioData,
          funcionario: funcionarioData,
        });


      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
        setErro(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuario();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Erro: {erro}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen p-2">
      <Sidebar usuario={usuario} className="fixed" />
      <div className="flex-1 flex flex-col p-6 pt-2 gap-4">
        {/* Barra superior */}
        <div className="flex items-center justify-end gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar..."
              className="border rounded-full pl-9 pr-15 py-1 text-black focus:outline-none focus:ring focus:ring-gray-200 sm:pr-5"
            />
          </div>

          <div className="notificacoes relative cursor-pointer p-2">
            <PopoverNotificacoes />
          </div>

          <div className="profile">
            {usuario && (
              <ComboboxDemo
                usuario={usuario}
                onFotoAtualizada={(novaFoto, isFuncionario = false) => {
                  if (isFuncionario && usuario.funcionario) {
                    setUsuario((prev) => ({
                      ...prev,
                      funcionario: { ...prev.funcionario, foto: novaFoto },
                    }));
                  } else {
                    setUsuario((prev) => ({ ...prev, foto: novaFoto }));
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* Conteúdo da página */}
        <div className="conteudo bg-gray-50 rounded-2xl p-3 h-full">
        {children}
        </div>
      </div>
    </div>
  );
}
