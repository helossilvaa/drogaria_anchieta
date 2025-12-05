"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/layout/layout";
import DialogNovoFuncionario from "@/components/addFuncionario/addFuncionario";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

export default function Funcionarios() {
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

                // Verifica departamento permitido
                const allowed = ["diretor geral", "diretor administrativo", "gerente", "caixa"];
                if (!allowed.includes(decoded.departamento.toLowerCase())) {
                    localStorage.removeItem("token");
                    return router.push("/");
                }

                // Fetch do usuário
                const usuarioRes = await fetch(`${API_URL}/usuarios/${decoded.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!usuarioRes.ok) throw new Error("Usuário não encontrado");
                const usuarioData = await usuarioRes.json();

                // Fetch do funcionário relacionado
                const funcionarioId = usuarioData.funcionario_id;
                const funcionarioRes = await fetch(`${API_URL}/funcionarios/${funcionarioId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!funcionarioRes.ok) throw new Error("Funcionário não encontrado");
                const funcionarioData = await funcionarioRes.json();

                // Combina os dados
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

    if (!usuario) return <p>Carregando usuário...</p>;

    return (
        <Layout>
            <div className="w-full p-5">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Funcionários</h1>
                    <DialogNovoFuncionario usuario={usuario} />
                </div>
            </div>
        </Layout>
    );
}
