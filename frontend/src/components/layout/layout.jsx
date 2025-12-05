"use client";

import Sidebar from "@/components/sidebar/sidebar";
import { Search } from "lucide-react";
import { ComboboxDemo } from "../combobox/combobox";
import { PopoverNotificacoes } from "../notificacoes/notificacoes";
import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Loading from "../../app/loading";
import React from "react";
import { UserContext } from "@/components/context/userContext";

export default function Layout({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const API_URL = "http://localhost:8080";
  const router = useRouter();
  const pathname = usePathname();

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

        console.log("decoded JWT:", decoded);

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

        const usuarioCompleto = { ...usuarioData, funcionario: funcionarioData };
        setUsuario(usuarioCompleto);


        if (usuarioCompleto) {
          const pathBase = pathname.split("/")[1];
          const mapaDepartamentos = {
            filial: ["diretor administrativo"],
            matriz: ["diretor geral"],
            pdv: ["caixa", "gerente"]
          };

          const departamentoNome = usuarioCompleto.funcionario?.departamentoNome || "";

          const permitido = mapaDepartamentos[pathBase]?.some(
            dep => dep.toLowerCase().trim() === departamentoNome.toLowerCase().trim()
          );

          if (!permitido) {
            router.replace("/forbbiden");
          }
    
        }


      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
        setErro(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuario();
  }, [router, pathname]);

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
      <div className="flex flex-col lg:flex-row min-h-screen p-2">
        {/* Sidebar */}
        <div className="lg:w-55 flex-shrink-0">
          <Sidebar usuario={usuario} />
        </div>

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
        </div>
      </div>
    </UserContext.Provider>
  );
}
