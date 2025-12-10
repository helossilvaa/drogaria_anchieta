"use client";
import Layout from "@/components/layout/layout";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function SolicitacoesMatrizPage() {
    const API_SOLICITACOES = "http://localhost:8080/movimentacoesestoque/solicitacoes/pendentes";

    const [solicitacoes, setSolicitacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusLocal, setStatusLocal] = useState({});
    const [modalAberto, setModalAberto] = useState(false);
    const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState(null);
    const [estoqueMatriz, setEstoqueMatriz] = useState(0);
    const [quantidadeEnvio, setQuantidadeEnvio] = useState("");
    const [enviando, setEnviando] = useState(false);

    // ---------- CARREGAR SOLICITAÇÕES ----------
    const carregarSolicitacoes = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const res = await fetch(API_SOLICITACOES, {
                headers: { Authorization: token ? `Bearer ${token}` : "" },
            });

            if (!res.ok) throw new Error("Erro ao carregar solicitações.");

            const data = await res.json();
            const solicitacoesArray = Array.isArray(data) ? data : [];
            setSolicitacoes(solicitacoesArray);

            const statusInit = {};
            solicitacoesArray.forEach((s) => (statusInit[s.id] = "pendente"));
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

    // ---------- ABRIR MODAL ----------
    const abrirModalEnvio = async (solicitacao) => {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(
                `http://localhost:8080/estoquematriz/produto/${solicitacao.produto_id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!res.ok) throw new Error("Erro ao buscar estoque da matriz.");

            const data = await res.json();
            const estoqueAtual = Array.isArray(data) ? data[0]?.quantidade ?? 0 : data.quantidade ?? 0;

            setEstoqueMatriz(estoqueAtual);
            setSolicitacaoSelecionada(solicitacao);
            setQuantidadeEnvio(solicitacao.quantidade);
            setModalAberto(true);

        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar estoque da matriz.");
        }
    };

    // ---------- ENVIAR PARA A FILIAL ----------
    const confirmarEnvio = async () => {
        if (enviando) return; // previne cliques múltiplos
        if (!solicitacaoSelecionada) return;

        const quantidadeNumber = Number(quantidadeEnvio);
        if (!quantidadeNumber || quantidadeNumber <= 0) return toast.error("Digite uma quantidade válida!");
        if (quantidadeNumber > estoqueMatriz) return toast.error("Quantidade maior que o estoque da matriz!");

        setEnviando(true);

        try {
            const token = localStorage.getItem("token");
            const body = {
                produto_id: solicitacaoSelecionada.produto_id,
                filial_id: solicitacaoSelecionada.unidade_id,
                quantidade: quantidadeNumber,
                solicitacao_id: solicitacaoSelecionada.id
            };

            const res = await fetch("http://localhost:8080/solicitacoes/enviar-lote", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (!res.ok) return toast.error(data.mensagem || "Erro ao enviar lote.");

            toast.success("Lote enviado com sucesso!");
            setModalAberto(false);
            setQuantidadeEnvio("");
            atualizarStatusLocal(solicitacaoSelecionada.id, "aprovado");
            carregarSolicitacoes();

        } catch (error) {
            console.error(error);
            toast.error("Erro inesperado ao enviar lote.");
        } finally {
            setEnviando(false);
        }
    };

    // ---------- MODAL ----------
    const ModalEnvio = () => {
        if (!modalAberto || !solicitacaoSelecionada) return null;

        return (
            <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-2xl shadow-2xl w-[380px]">
                    <h2 className="text-xl font-bold mb-4 text-[#00554f]">Enviar produto para filial</h2>

                    <p className="text-gray-700">
                        <span className="font-semibold">Produto:</span>{" "}
                        {solicitacaoSelecionada.nome_produto}
                    </p>

                    <p className="text-gray-700 mt-2">
                        <span className="font-semibold">Estoque matriz:</span> {estoqueMatriz}
                    </p>

                    <div className="mt-4">
                        <label className="text-sm font-semibold text-[#073d39]">Quantidade a enviar</label>
                        <input
                            type="number"
                            value={quantidadeEnvio}
                            onChange={(e) => setQuantidadeEnvio(e.target.value)}
                            className="w-full border border-[#567c73] rounded-lg p-2 mt-1"
                            min={1}
                            max={estoqueMatriz}
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            onClick={() => setModalAberto(false)}
                            className="bg-[#567c73] hover:bg-[#073d39] text-white"
                        >
                            Cancelar
                        </Button>

                        <Button
                            onClick={confirmarEnvio}
                            className="bg-[#00554f] hover:bg-[#073d39] text-white"
                            disabled={enviando}
                        >
                            Confirmar envio
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    const atualizarStatusLocal = (id, novoStatus) => {
        setStatusLocal((prev) => ({ ...prev, [id]: novoStatus }));
    };

    // ---------- RENDER ----------
    return (
        <Layout>
            <div className="p-6">
                <Toaster richColors position="top-right" />
                <h1 className="text-3xl font-bold mb-6 text-[#00554f]">Solicitações Pendentes</h1>

                {loading && (
                    <div className="flex items-center gap-2 text-gray-600">
                        <Loader2 className="animate-spin" />
                        Carregando solicitações...
                    </div>
                )}

                {!loading && solicitacoes.length === 0 && (
                    <p className="text-gray-500 text-lg">Nenhuma solicitação pendente</p>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {!loading &&
                        solicitacoes.map((s) => (
                            <Card key={s.id} className="shadow-lg border border-gray-300 rounded-2xl hover:shadow-2xl transition-all">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-[#073d39]">
                                        {s.nome_produto || "Produto desconhecido"}
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-600">Filial</p>
                                        <p className="font-medium">{s.unidade_id}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">Quantidade Solicitada</p>
                                        <p className="font-medium">{s.quantidade}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">Data da Solicitação</p>
                                        <p className="font-medium">
                                            {new Date(s.data_movimentacao).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="mt-3">
                                        <span
                                            className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${
                                                statusLocal[s.id] === "pendente"
                                                    ? "bg-[#567c73]"
                                                    : statusLocal[s.id] === "aprovado"
                                                        ? "bg-[#00554f]"
                                                        : "bg-red-600"
                                            }`}
                                        >
                                            {statusLocal[s.id]}
                                        </span>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            onClick={() => abrirModalEnvio(s)}
                                            className="w-24 bg-[#00554f] hover:bg-[#073d39] text-white"
                                            disabled={statusLocal[s.id] !== "pendente"}
                                        >
                                            Aprovar
                                        </Button>

                                        <Button
                                            onClick={() => atualizarStatusLocal(s.id, "rejeitado")}
                                            className="w-24 bg-[#567c73] hover:bg-[#073d39] text-white"
                                            disabled={statusLocal[s.id] !== "pendente"}
                                        >
                                            Rejeitar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                </div>

                <ModalEnvio />
            </div>
        </Layout>
    );
}
