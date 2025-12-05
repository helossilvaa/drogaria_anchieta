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
import { UserContext } from "@/components/context/userContext";

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
        if (decoded.exp < Date.now() / 1000) {
          localStorage.removeItem("token");
          return router.push("/");
        }

        const allowed = ["diretor geral", "diretor administrativo", "gerente", "caixa"];
        if (!allowed.includes(decoded.departamento.toLowerCase())) {
          localStorage.removeItem("token");
          return router.push("/");
        }

        const usuarioRes = await fetch(`${API_URL}/usuarios/${decoded.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!usuarioRes.ok) throw new Error("Usuário não encontrado");
        const usuarioData = await usuarioRes.json();

        let funcionarioData = null;
        if (usuarioData.funcionario_id) {
          const funcionarioRes = await fetch(`${API_URL}/funcionarios/${usuarioData.funcionario_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (funcionarioRes.ok) {
            funcionarioData = await funcionarioRes.json();
          }
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
    <UserContext.Provider value={usuario}>
      <div className="flex flex-col lg:flex-row min-h-screen p-2 gap-2">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <Sidebar usuario={usuario} />
        </div>

<<<<<<< HEAD
       
        <div className="conteudo bg-gray-50 rounded-2xl p-3 h-full justify-center align-center">
          {children}
=======
        {/* Conteúdo principal */}
        <div className="flex-1 flex flex-col p-4 gap-4">
          {/* Barra superior */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
          

            <div className="flex items-center gap-3 mt-2 sm:mt-0">
              <PopoverNotificacoes />
              {usuario && (
                <ComboboxDemo
                  usuario={usuario}
                  onFotoAtualizada={(novaFoto, isFuncionario = false) => {
                    if (isFuncionario && usuario.funcionario) {
                      setUsuario(prev => ({
                        ...prev,
                        funcionario: { ...prev.funcionario, foto: novaFoto }
                      }));
                    } else {
                      setUsuario(prev => ({ ...prev, foto: novaFoto }));
                    }
                  }}
                />
              )}
            </div>
          </div>

          {/* Conteúdo */}
          <div className="conteudo bg-gray-50 rounded-2xl p-3 h-full sm:flex flex-col lg:gap-4">
            {children}
          </div>
>>>>>>> 6650b1c4b17a3844697712570c4f2eadddbf6a48
        </div>
      </div>
    </UserContext.Provider>
  );
}
