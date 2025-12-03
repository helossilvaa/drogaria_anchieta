'use client';
import { useEffect, useState } from "react";
import Layout from "@/components/layout/layout";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";

const API_CATEGORIAS = "http://localhost:8080/categorias";
const API_PRODUTOS = "http://localhost:8080/produtos";
const API_LOTES = "http://localhost:8080/lotesmatriz/produto";
const API_ESTOQUE = "http://localhost:8080/estoquematriz";
const API_MOV = "http://localhost:8080/movimentacoesestoque/produto";

export default function Estoque() {
    const [categorias, setCategorias] = useState([]);
    const [categoriaSelecionada, setCategoriaSelecionada] = useState("0");
    const [produtos, setProdutos] = useState([]);
    const [estoque, setEstoque] = useState([]);
    const [lotes, setLotes] = useState([]);
    const [movimentacoes, setMovimentacoes] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [produtoSelecionado, setProdutoSelecionado] = useState(null);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [itensPorPagina] = useState(10);
    const [loading, setLoading] = useState(false);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

    async function fetchCategorias() {
        try {
            const res = await fetch(API_CATEGORIAS, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setCategorias([{ id: "0", categoria: "Todos" }, ...(Array.isArray(data) ? data : [])]);
        } catch { }
    }

    async function fetchProdutos() {
        try {
            const res = await fetch(API_PRODUTOS, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setProdutos(Array.isArray(data) ? data : []);
        } catch { }
    }

    async function fetchEstoque() {
        try {
            const res = await fetch(API_ESTOQUE, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setEstoque(Array.isArray(data) ? data : []);
        } catch {
            setEstoque([]);
        }
    }

    async function fetchLotesById(id) {
        try {
            const res = await fetch(`${API_LOTES}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            const arr = Array.isArray(data) ? data : data?.lotes ?? data?.data ?? [];
            setLotes(Array.isArray(arr) ? arr : []);
        } catch {
            setLotes([]);
        }
    }

    async function fetchMovimentacoesById(id) {
        try {
            const res = await fetch(`${API_MOV}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            const arr = Array.isArray(data) ? data : data?.movimentacoes ?? data?.data ?? [];
            setMovimentacoes(Array.isArray(arr) ? arr : []);
        } catch {
            setMovimentacoes([]);
        }
    }

    async function abrirDetalhes(produto) {
        setProdutoSelecionado(produto);
        setModalOpen(true);
        await Promise.all([
            fetchLotesById(produto.id),
            fetchMovimentacoesById(produto.id)
        ]);
    }

    function getProdutoIdEstoque(item) {
        return item.produto_id ?? item.produtoId ?? item.id ?? null;
    }

    const estoqueArray = Array.isArray(estoque) ? estoque : [];

    const produtosComEstoque = produtos.map(p => {
        const pid = p.id ?? p.produto_id ?? null;
        const e = estoqueArray.find(es => String(getProdutoIdEstoque(es)) === String(pid));
        return {
            ...p,
            id: pid,
            quantidade: Number(e?.quantidade ?? 0),
            lote: e?.lote ?? "—",
            estoque_minimo: Number(p.estoque_minimo ?? 0),
            estoque_maximo: Number(p.estoque_maximo ?? 9999)
        };
    });

    const filtrados = categoriaSelecionada === "0"
        ? produtosComEstoque
        : produtosComEstoque.filter(p => String(p.categoria_id) === categoriaSelecionada);

    const total = filtrados.length;
    const totalPaginas = Math.ceil(total / itensPorPagina);
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const paginados = filtrados.slice(inicio, inicio + itensPorPagina);

    function statusEstoque(item) {
        if (item.quantidade <= item.estoque_minimo) return <span className="text-red-600 font-semibold">Baixo</span>;
        if (item.quantidade >= item.estoque_maximo) return <span className="text-blue-600 font-semibold">Alto</span>;
        return <span className="text-green-600 font-semibold">Normal</span>;
    }

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchCategorias(), fetchProdutos(), fetchEstoque()])
            .finally(() => setLoading(false));
    }, []);

    return (
        <Layout>
            <div className="p-8 space-y-6">

                <div className="flex gap-6 text-[#989898] border-b pb-2 mb-4">
                    {categorias.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setCategoriaSelecionada(c.id.toString())}
                            className={categoriaSelecionada === c.id.toString()
                                ? "text-[#62b7a9] font-semibold"
                                : "hover:text-[#5e9f94]"}
                        >
                            {c.categoria}
                        </button>
                    ))}
                </div>

                <Table className="bg-white rounded-lg shadow-sm">
                    <TableHeader className="bg-[#a9d6cd]">
                        <TableRow>
                            <TableHead>Produto</TableHead>
                            <TableHead>Qtde</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Lote</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-6">Carregando...</TableCell></TableRow>
                        ) : paginados.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-6">Nenhum item encontrado.</TableCell></TableRow>
                        ) : (
                            paginados.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.nome}</TableCell>
                                    <TableCell>{item.quantidade}</TableCell>
                                    <TableCell>{statusEstoque(item)}</TableCell>
                                    <TableCell>{item.lote}</TableCell>
                                    <TableCell>
                                        <button
                                            onClick={() => abrirDetalhes(item)}
                                            className="text-[#62b7a9] hover:underline text-sm"
                                        >
                                            Ver detalhes
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                <div className="flex justify-between pt-3">
                    <button
                        disabled={paginaAtual === 1}
                        onClick={() => setPaginaAtual(p => p - 1)}
                        className="px-3 py-1 bg-[#62b7a9] text-white rounded disabled:bg-gray-300"
                    >
                        Anterior
                    </button>

                    <span>Página {paginaAtual} de {totalPaginas}</span>

                    <button
                        disabled={paginaAtual === totalPaginas}
                        onClick={() => setPaginaAtual(p => p + 1)}
                        className="px-3 py-1 bg-[#62b7a9] text-white rounded disabled:bg-gray-300"
                    >
                        Próximo
                    </button>
                </div>

                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle>
                                {produtoSelecionado?.nome}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">

                            <div>
                                <h3 className="font-semibold mb-1">Lotes</h3>
                                {lotes.length === 0 ? (
                                    <p className="text-sm text-gray-500">Nenhum lote encontrado.</p>
                                ) : (
                                    <ul className="text-sm">
                                        {lotes.map((l, i) => (
                                            <li key={i} className="border-b py-1">
                                                Lote: {l.lote ?? l.id ?? "—"} —
                                                Validade: {l.validade ?? "—"} —
                                                Qtde: {l.quantidade ?? 0}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div>
                                <h3 className="font-semibold mb-1">Movimentações</h3>
                                {movimentacoes.length === 0 ? (
                                    <p className="text-sm text-gray-500">Nenhuma movimentação encontrada.</p>
                                ) : (
                                    <ul className="text-sm">
                                        {movimentacoes.map((m, i) => (
                                            <li key={i} className="border-b py-1">
                                                {m.tipo} — {m.quantidade} un — {m.data}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                        </div>

                    </DialogContent>
                </Dialog>

            </div>
        </Layout>
    );
}
