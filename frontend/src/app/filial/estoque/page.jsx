"use client";

import Layout from "@/components/layout/layout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast, Toaster } from "sonner";
import SolicitacaoModal from "@/components/solicitacaoModal/solicitacaoModal";
import { Dialog } from "@/components/ui/dialog";

export default function EstoqueFilialPage() {
    const API_ESTOQUE_FILIAL = "http://localhost:8080/estoqueFilial";
    const API_PRODUTOS = "http://localhost:8080/produtos";

    const [estoque, setEstoque] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [estoqueComProdutos, setEstoqueComProdutos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);
    const [busca, setBusca] = useState("");

    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 9;

    const [open, setOpen] = useState(false);
    const [produtoSelecionado, setProdutoSelecionado] = useState(null);

    // --- Carregar produtos ---
    const carregarProdutos = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(API_PRODUTOS, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!res.ok) throw new Error("Erro ao buscar produtos.");
            const data = await res.json();
            const lista = Array.isArray(data.produtos) ? data.produtos : Array.isArray(data) ? data : [data];
            setProdutos(lista);
        } catch (error) {
            console.error(error);
            toast.error("Falha ao carregar produtos.");
        }
    };

    // --- Carregar estoque ---
    const carregarEstoque = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(API_ESTOQUE_FILIAL, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!res.ok) throw new Error("Erro ao carregar estoque!");
            const data = await res.json();
            setEstoque(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar estoque!");
        }
    };

    // --- Combinar estoque com produtos para pegar o nome correto ---
    useEffect(() => {
        if (estoque.length && produtos.length) {
            const combinado = estoque.map((item) => {
                const produto = produtos.find((p) => p.id === item.produto_id);
                return {
                    ...item,
                    nome_produto: produto?.nome || item.nome_produto || "Produto desconhecido",
                };
            });
            setEstoqueComProdutos(combinado);
        }
    }, [estoque, produtos]);

    useEffect(() => {
        setLoading(true);
        Promise.all([carregarProdutos(), carregarEstoque()]).finally(() => setLoading(false));
    }, []);

    // --- Abrir modal ---
    const abrirModal = (produto) => {
        setProdutoSelecionado(produto);
        setOpen(true);
    };

    // --- Filtrar pelo nome ou código ---
    const estoqueFiltrado = estoqueComProdutos.filter((item) => {
        const nome = item.nome_produto || "";
        const codigo = item.codigo_barras || "";
        return (
            nome.toLowerCase().includes(busca.toLowerCase()) ||
            codigo.toLowerCase().includes(busca.toLowerCase())
        );
    });

    // --- Paginação ---
    const totalPaginas = Math.max(1, Math.ceil(estoqueFiltrado.length / itensPorPagina));
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const produtosExibidos = estoqueFiltrado.slice(inicio, fim);

    const paginaAnterior = () => paginaAtual > 1 && setPaginaAtual(paginaAtual - 1);
    const proximaPagina = () => paginaAtual < totalPaginas && setPaginaAtual(paginaAtual + 1);

    return (
        <Layout>
            <Toaster richColors position="top-right" />
            <div className="p-6 space-y-6">
                {/* Campo de busca */}
                <div className="relative mt-15">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg className="w-4 h-4 text-body" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" /></svg>
                    </div>
                    <input type="search" id="search" placeholder="Buscar produto..." className="w-64 border rounded-2xl pl-9 pr-12 py-2 text-black focus:outline-none focus:ring focus:ring-gray-200 sm:pr-5 text-sm shadow-md" value={busca} onChange={(e) => setBusca(e.target.value)} />
                </div>  

                {/* Loader */}
                {loading && <p className="text-gray-400 mt-6">Carregando produtos...</p>}

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                    {!loading &&
                        produtosExibidos.map((item) => (
                            <div
                                key={item.id}
                                className="p-5 rounded-xl bg-white shadow-md border border-gray-200 hover:shadow-lg hover:scale-[1.01] transition-all"
                            >
                                <h2 className="text-xl font-bold text-[#abb1b1] mb-2">{item.nome_produto}</h2>
                                <p className="text-gray-700">
                                    <b>Quantidade:</b> {item.quantidade || 0}
                                </p>

                                <div className="mt-2">
                                    <span
                                        className={`text-sm font-bold px-2 py-1 rounded ${item.quantidade <= item.estoque_minimo
                                            ? "text-[#a8686a] bg-[#e9d2d2]"
                                            : item.quantidade >= item.estoque_maximo
                                                ? "text-blue-700 bg-blue-100"
                                                : "text-[#528575] bg-[#d2e9dd]"
                                            }`}
                                    >
                                        {item.quantidade <= item.estoque_minimo
                                            ? "Estoque baixo"
                                            : item.quantidade >= item.estoque_maximo
                                                ? "Acima do ideal"
                                                : "Normal"}
                                    </span>
                                </div>

                                <Button
                                    className="mt-4 w-full bg-[#79b0b0] hover:bg-[#5d8080] text-white"
                                    onClick={() => abrirModal(item)}
                                >
                                    Solicitar Reposição
                                </Button>
                            </div>
                        ))}
                </div>

                {!loading && estoqueFiltrado.length === 0 && (
                    <p className="text-center text-gray-500 mt-8">Nenhum produto encontrado.</p>
                )}

                {/* Paginação */}
                {estoqueFiltrado.length > 0 && (
                    <div className="flex justify-center gap-3 mt-6">
                        <Button disabled={paginaAtual === 1} onClick={paginaAnterior} className="bg-[#79b0b0] hover:bg-[#5d8080]">
                            Anterior
                        </Button>
                        <span className="font-semibold">
                            Página {paginaAtual} de {totalPaginas}
                        </span>
                        <Button disabled={paginaAtual === totalPaginas} onClick={proximaPagina} className="bg-[#79b0b0] hover:bg-[#5d8080] ">
                            Próxima
                        </Button>
                    </div>
                )}

                {/* Modal */}
                <Dialog open={open} onOpenChange={setOpen}>
                    {open && produtoSelecionado && (
                        <SolicitacaoModal produto={produtoSelecionado} fechar={() => setOpen(false)} />
                    )}
                </Dialog>
            </div>
        </Layout>
    );
}
