'use client';
import { useEffect, useState } from "react";
import Layout from "@/components/layout/layout";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"


const API_CATEGORIAS = "http://localhost:8080/categorias";

export default function estoque() {
    const [categorias, setCategorias] = useState([]);
    const [categoriaSelecionada, setCategoriaSelecionada] = useState("0");


    async function fetchCategorias() {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(API_CATEGORIAS, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            if (!res.ok) throw new Error("Erro ao buscar categorias.");
            const data = await res.json();
            if (!Array.isArray(data)) throw new Error("Retorno inesperado da API.");

            setCategorias([{ id: "0", categoria: "Todos" }, ...data]);
        } catch (error) {
            console.log("Erro ao carregar categorias:", error);
        }
    };

    const getCategoriaNome = (categoriaId) => {
        if (categoriaId == null || categoriaId === "") return "—";
        const id = Number(categoriaId);
        const c = categorias.find(cat => Number(cat.id) === id);
        return c ? (c.nome || c.categoria) : "—";
    };

    useEffect(() => {
        fetchCategorias();
    }, []);

    return (
        <>

            <Layout>
                <div className="p-8 space-y-6">

                    {/* //abas das categorias */}
                    <div className="flex gap-6 text-[#989898] font-normal border-b-1 pb-2 mb-5">
                        {categorias.map((c) => {
                            const isSelected = categoriaSelecionada === c.id.toString();
                            return (
                                <button
                                    key={c.id}
                                    onClick={() => setCategoriaSelecionada(isSelected ? "0" : c.id.toString())}
                                    className={`transition-colors ${isSelected ? "text-[#62b7a9] font-semibold" : "hover:text-[#5e9f94]"}`}
                                >
                                    {c.categoria}
                                </button>
                            );
                        })}
                    </div>
                    <Table className="sm:rounded-lg">
                        <TableCaption>A list of your recent invoices.</TableCaption>
                        <TableHeader className="relative overflow-x-auto bg-[#a9d6cd] rounded-xl">
                            <TableRow>
                                <TableHead>Produto</TableHead>
                                <TableHead>Quantidade</TableHead>
                                <TableHead>Status de estoque</TableHead>
                                <TableHead>Lote</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody >
                            <TableRow className="border-b-1">
                                <TableCell className="font-medium ">INV001</TableCell>
                                <TableCell>Paid</TableCell>
                                <TableCell>Credit Card</TableCell>
                                <TableCell >$250.00</TableCell>
                            </TableRow>
                            <TableRow className="border-b-1">
                                <TableCell className="font-medium">INV001</TableCell>
                                <TableCell>Paid</TableCell>
                                <TableCell>Credit Card</TableCell>
                                <TableCell>$250.00</TableCell>
                            </TableRow>
                            <TableRow className="border-b-1">
                                <TableCell className="font-medium">INV001</TableCell>
                                <TableCell>Paid</TableCell>
                                <TableCell>Credit Card</TableCell>
                                <TableCell>$250.00</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </Layout>
        </>
    )
}


