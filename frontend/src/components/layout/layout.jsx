"use client";

import Sidebar from "@/components/sidebar/sidebar";
import { Search } from "lucide-react";
import { ComboboxDemo } from "../combobox/combobox";
import { PopoverNotificacoes } from "../notificacoes/notificacoes";
import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
        if (!token) {
          router.push("/");
          return;
        }

        const decoded = jwtDecode(token);

        // Verifica departamento permitido
        const allowed = ["diretor geral", "diretor administrativo", "gerente", "caixa"];
        if (!allowed.includes(decoded.departamento.toLowerCase())) {
          localStorage.removeItem("token");
          router.push("/");
          return;
        }

        // Verifica expiração do token
        if (decoded.exp < Date.now() / 1000) {
          localStorage.removeItem("token");
          router.push("/");
          return;
        }

        // Fetch do usuário + funcionário via JOIN no backend
        const res = await fetch(`${API_URL}/usuarios/${decoded.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          localStorage.removeItem("token");
          throw new Error("Usuário não encontrado");
        }

        const data = await res.json();

        setUsuario({
          id: data.id,
          status: data.status,
          foto: data.foto || null, 
          departamento: decoded.departamento,
          funcionario: data.funcionario || null, 
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
        <p>Carregando usuário...</p>
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
                onFotoAtualizada={(fotoAtualizada, isFuncionario = false) => {
                  if (isFuncionario && usuario.funcionario) {
                    setUsuario(prev => ({
                      ...prev,
                      funcionario: { ...prev.funcionario, foto: fotoAtualizada }
                    }));
                  } else {
                    setUsuario(prev => ({ ...prev, foto: fotoAtualizada }));
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="conteudo bg-gray-50 rounded-2xl p-3 sm:flex justify-center align-center">
          {children}
        </div>
      </div>
    </div>
  );
}
