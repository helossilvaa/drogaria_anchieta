"use client";
import Layout from "@/components/layout/layout";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";

export default function SolicitacoesMatrizPage() {
    const API_SOLICITACOES = "http://localhost:8080/movimentacoesestoque/solicitacoes/pendentes";

    const [solicitacoes, setSolicitacoes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Status local para cada solicitação
    const [statusLocal, setStatusLocal] = useState({});

    const carregarSolicitacoes = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await fetch(API_SOLICITACOES, {
                headers: { Authorization: token ? `Bearer ${token}` : "" },
            });
            if (!res.ok) throw new Error("Erro ao carregar solicitações.");
            const data = await res.json();
            setSolicitacoes(Array.isArray(data) ? data : []);
            // Inicializa status como "pendente"
            const statusInit = {};
            (Array.isArray(data) ? data : []).forEach((s) => (statusInit[s.id] = "pendente"));
            setStatusLocal(statusInit);
        } catch (error) {
            console.error(error);
            toast.error("Falha ao carregar solicitações.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarSolicitacoes();
    }, []);

    const atualizarStatusLocal = (id, novoStatus) => {
        setStatusLocal((prev) => ({ ...prev, [id]: novoStatus }));
        toast.success(`Solicitação ${novoStatus === "aprovado" ? "aprovada" : "rejeitada"}!`);
    };

    return (
        <Layout>
            <div className="p-6">
                <Toaster richColors position="top-right" />
                <h1 className="text-2xl font-bold mb-4">Solicitações Pendentes</h1>

                {loading && <p>Carregando solicitações...</p>}

                {!loading && solicitacoes.length === 0 && (
                    <p className="text-gray-500">Nenhuma solicitação pendente.</p>
                )}

                {!loading && solicitacoes.length > 0 && (
                    <table className="w-full table-auto border border-gray-300 rounded-md">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border px-4 py-2">Produto</th>
                                <th className="border px-4 py-2">Filial</th>
                                <th className="border px-4 py-2">Quantidade</th>
                                <th className="border px-4 py-2">Data</th>
                                <th className="border px-4 py-2">Status</th>
                                <th className="border px-4 py-2">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {solicitacoes.map((s) => (
                                <tr key={s.id}>
                                    <td className="border px-4 py-2">{s.nome_produto || "Produto desconhecido"}</td>
                                    <td className="border px-4 py-2">{s.unidade_id}</td>
                                    <td className="border px-4 py-2">{s.quantidade}</td>
                                    <td className="border px-4 py-2">{new Date(s.data_movimentacao).toLocaleString()}</td>
                                    <td className="border px-4 py-2">
                                        <span
                                            className={`px-2 py-1 rounded text-white font-semibold ${statusLocal[s.id] === "pendente"
                                                    ? "bg-yellow-400"
                                                    : statusLocal[s.id] === "aprovado"
                                                        ? "bg-green-500"
                                                        : "bg-red-500"
                                                }`}
                                        >
                                            {statusLocal[s.id] || "pendente"}
                                        </span>
                                    </td>
                                    <td className="border px-4 py-2 space-x-2">
                                        <Button
                                            onClick={() => atualizarStatusLocal(s.id, "aprovado")}
                                            className="bg-green-500 hover:bg-green-600 text-white"
                                            disabled={statusLocal[s.id] !== "pendente"}
                                        >
                                            Aprovar
                                        </Button>
                                        <Button
                                            onClick={() => atualizarStatusLocal(s.id, "rejeitado")}
                                            className="bg-red-500 hover:bg-red-600 text-white"
                                            disabled={statusLocal[s.id] !== "pendente"}
                                        >
                                            Rejeitar
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </Layout>
    );
}
