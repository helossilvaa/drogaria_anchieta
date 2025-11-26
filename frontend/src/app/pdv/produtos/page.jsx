"use client";

import Layout from "@/components/layout/layout";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Minus, Plus, ShoppingCart } from "lucide-react";
import { toast, Toaster } from "sonner";
import Link from "next/link";

export default function ProdutosPage() {
  const API_CATEGORIAS = "http://localhost:8080/categorias";
  const API_PRODUTOS = "http://localhost:8080/produtos";

  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [quantidades, setQuantidades] = useState({});
  const [carrinho, setCarrinho] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("0");

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 6;

  async function carregarCategorias() {
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
  }

  useEffect(() => {
    const carrinhoSalvo = localStorage.getItem("carrinho");
    if (carrinhoSalvo) setCarrinho(JSON.parse(carrinhoSalvo));
  }, []);
  
  async function carregarProdutos() {
    setLoading(true);
    setErro(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_PRODUTOS, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
  
      if (!res.ok) throw new Error("Erro ao buscar produtos.");
      const data = await res.json();
      let lista = [];
      if (Array.isArray(data.produtos)) lista = data.produtos;
      else if (Array.isArray(data)) lista = data;
      else lista = [data];
  
      // Ordenar alfabeticamente pelo nome
      lista.sort((a, b) => a.nome.localeCompare(b.nome));
  
      setProdutos(lista);
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    carregarCategorias();
    carregarProdutos();
  }, []);

  function alterarQuantidade(nome, tipo) {
    setQuantidades((prev) => ({
      ...prev,
      [nome]: Math.max(1, (prev[nome] || 1) + (tipo === "mais" ? 1 : -1)),
    }));
  }

  function adicionarAoCarrinho(produto) {
    const quantidade = quantidades[produto.nome] || 1;
    const precoTotal = Number(produto.preco_unitario) * quantidade; // CALCULA O VALOR TOTAL
  
    setCarrinho((prev) => {
      const index = prev.findIndex((p) => p.id === produto.id);
      if (index >= 0) {
        const newCarrinho = [...prev];
        newCarrinho[index].quantidade += quantidade;
        return newCarrinho;
      } else {
        return [...prev, { ...produto, quantidade }];
      }
    });
  
    toast.success(`Produto adicionado ao carrinho!`, {
      description: (
        <div className="flex items-center gap-3 mt-2">
          <img
            src={`http://localhost:8080/uploads/produtos/${produto.foto}`}
            className="w-12 h-12 rounded-full object-cover border"
          />
          <div>
            <p className="font-semibold">{produto.nome}</p>
            <p className="text-sm text-gray-500">
              R$ {precoTotal.toFixed(2)} ({quantidade} x R$ {Number(produto.preco_unitario).toFixed(2)})
            </p>
          </div>
        </div>
      ),
      duration: 2500,
    });
  }
  

  const produtosFiltrados = produtos.filter((p) => {
    if (categoriaSelecionada !== "0" && String(p.categoria_id) !== categoriaSelecionada) {
      return false;
    }
    if (busca.trim() !== "" && !p.nome.toLowerCase().includes(busca.toLowerCase())) {
      return false;
    }
    return true;
  });

  const totalPaginas = Math.max(1, Math.ceil(produtosFiltrados.length / itensPorPagina));
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const produtosExibidos = produtosFiltrados.slice(inicio, fim);

  const paginaAnterior = () => paginaAtual > 1 && setPaginaAtual(paginaAtual - 1);
  const proximaPagina = () => paginaAtual < totalPaginas && setPaginaAtual(paginaAtual + 1);

  return (
    <Layout>
      <Toaster richColors position="top-right" />

      <div className="p-8 space-y-6">
        {/* Topo: Busca + Carrinho */}
        <div className="flex justify-between items-center">
          <Input
            placeholder="Busque por um produto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-80 border-pink-400 focus:ring-pink-300"
          />

          <Link href="/pdv/novaVenda" className="relative">
            <ShoppingCart className="text-pink-600 hover:text-pink-500 cursor-pointer" size={28} />
            {carrinho.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                {carrinho.reduce((total, p) => total + p.quantidade, 0)}
              </span>
            )}
          </Link>
        </div>

        {/* Categorias */}
        <div className="flex gap-6 text-gray-600 font-medium border-b pb-2">
          {categorias.map((c) => {
            const isSelected = categoriaSelecionada === c.id.toString();
            return (
              <button
                key={c.id}
                onClick={() => setCategoriaSelecionada(isSelected ? "0" : c.id.toString())}
                className={`transition-colors ${isSelected ? "text-pink-600 font-semibold" : "hover:text-pink-600"}`}
              >
                {c.categoria}
              </button>
            );
          })}
        </div>

        {/* Erro */}
        {erro && <p className="text-red-600 text-center mt-4 font-medium">{erro}</p>}

        {/* Loader */}
        {loading && (
          <div className="flex justify-center mt-8">
            <Loader2 className="animate-spin text-pink-600" size={32} />
          </div>
        )}

        {/* Produtos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {!loading &&
            produtosExibidos.map((p) => (
              <Card key={p.id} className="shadow-md rounded-2xl border border-pink-200">
                <CardContent className="p-4 space-y-3">
                  {p.foto ? (
                    <img
                      src={`http://localhost:8080/uploads/produtos/${p.foto}`}
                      className="w-full object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-300 text-gray-700 flex items-center justify-center rounded-md">
                      Sem foto
                    </div>
                  )}

                  <h2 className="text-lg font-semibold">{p.nome}</h2>
                  <p className="text-sm text-gray-500 leading-tight">{p.descricao}</p>
                  <Badge className="bg-pink-100 text-pink-600 capitalize">{p.tag}</Badge>
                  <p className="text-xl font-bold text-gray-800">
                    R${Number(p.preco_unitario).toFixed(2)}
                  </p>

                  {/* Controle de quantidade + Comprar */}
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center gap-2 border rounded-xl p-1">
                      <button
                        onClick={() => alterarQuantidade(p.nome, "menos")}
                        className="p-1 rounded-full hover:bg-pink-100"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-6 text-center">{quantidades[p.nome] || 1}</span>
                      <button
                        onClick={() => alterarQuantidade(p.nome, "mais")}
                        className="p-1 rounded-full hover:bg-pink-100"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <Button
                      onClick={() => adicionarAoCarrinho(p)}
                      className="bg-pink-600 hover:bg-pink-500 text-white rounded-xl px-4 py-2 font-semibold"
                    >
                      COMPRAR
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {!loading && produtosFiltrados.length === 0 && (
          <p className="text-center text-gray-500 mt-8 text-lg">Nenhum produto encontrado.</p>
        )}

        {/* Paginação */}
        {produtosFiltrados.length > 0 && (
          <div className="flex justify-center gap-4 mt-8">
            <Button
              disabled={paginaAtual === 1}
              onClick={paginaAnterior}
              className="bg-pink-500 hover:bg-pink-400"
            >
              Anterior
            </Button>
            <span className="font-semibold">
              Página {paginaAtual} de {totalPaginas}
            </span>
            <Button
              disabled={paginaAtual === totalPaginas}
              onClick={proximaPagina}
              className="bg-pink-500 hover:bg-pink-400"
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
