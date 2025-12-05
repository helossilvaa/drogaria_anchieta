"use client";

import Layout from "@/components/layout/layout";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Minus, Plus, ShoppingCart } from "lucide-react";
import { toast, Toaster } from "sonner";
import Link from "next/link"; // IMPORTAÇÃO CORRETA
import { useRouter } from "next/navigation";

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
  const itensPorPagina = 8;

  const router = useRouter();

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
      toast.success("Categorias carregadas com sucesso!");
    } catch (error) {
      console.log("Erro ao carregar categorias:", error);
      toast.error("Erro ao carregar categorias!");
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

      lista.sort((a, b) => a.nome.localeCompare(b.nome));
      setProdutos(lista);
      toast.success("Produtos carregados com sucesso!");
    } catch (error) {
      setErro(error.message);
      toast.error("Falha ao carregar produtos.");
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

    const novoItem = {
      id: produto.id,
      nome: produto.nome,
      preco_unitario: produto.preco_unitario,
      quantidade,
      foto: produto.foto,
    };

    setCarrinho((prev) => {
      const existente = prev.find((p) => p.id === produto.id);
      let novoCarrinho;

      if (existente) {
        novoCarrinho = prev.map((p) =>
          p.id === produto.id
            ? { ...p, quantidade: p.quantidade + quantidade }
            : p
        );
      } else {
        novoCarrinho = [...prev, novoItem];
      }

      localStorage.setItem("carrinho", JSON.stringify(novoCarrinho));
      return novoCarrinho;
    });

    setQuantidades((prev) => ({ ...prev, [produto.nome]: 1 }));

    // Toast com foto do produto
    toast.success(
      <div className="flex items-center gap-3">
        {produto.foto && (
          <img
            src={`http://localhost:8080/uploads/produtos/${produto.foto}`}
            alt={produto.nome}
            className="w-12 h-12 object-cover rounded"
          />
        )}
        <div>
          <p className="font-semibold">{produto.nome}</p>
          <p className="text-sm">Adicionado ao carrinho!</p>
        </div>
      </div>
    );

    // Redireciona para novaVenda
    router.push("/pdv/novaVenda");
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
            <ShoppingCart
              className="text-pink-600 hover:text-pink-500 cursor-pointer"
              size={28}
            />
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
                onClick={() =>
                  setCategoriaSelecionada(isSelected ? "0" : c.id.toString())
                }
                className={`transition-colors ${isSelected ? "text-pink-600 font-semibold" : "hover:text-pink-600"}`}
              >
                {c.categoria}
              </button>
            );
          })}
        </div>

        {/* Erro */}
        {erro && (
          <p className="text-red-600 text-center mt-4 font-medium">{erro}</p>
        )}

        {/* Loader */}
        {loading && (
          <div className="flex justify-center mt-8">
            <Loader2 className="animate-spin text-pink-600" size={32} />
          </div>
        )}

        {/* Produtos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {!loading &&
            produtosExibidos.map((p) => (
              <Card key={p.id} className="shadow-md rounded-xl border border-pink-100">
                <CardContent className="space-y-3">
                  {p.foto ? (
                    <img
                      src={`http://localhost:8080/uploads/produtos/${p.foto}`}
                      alt={p.nome}
                      className="w-full h-40 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-100 flex items-center justify-center rounded-lg text-gray-400">
                      Sem foto
                    </div>
                  )}

                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-semibold">{p.nome}</h2>
                      <p className="text-sm text-gray-500">{p.descricao}</p>
                    </div>

                    {p.categoria_nome && (
                      <Badge className="bg-orange-100 text-orange-600 capitalize text-sm">
                        {p.categoria_nome}
                      </Badge>
                    )}

                    <span
                      className={`w-4 h-4 rounded-full ml-2 mt-1 ${p.quantidade_estoque === 0
                        ? "bg-red-500"
                        : p.quantidade_estoque <= p.estoque_minimo
                          ? "bg-yellow-400"
                          : "bg-green-500"
                        }`}
                      title={
                        p.quantidade_estoque === 0
                          ? "Esgotado"
                          : p.quantidade_estoque <= p.estoque_minimo
                            ? "Estoque baixo"
                            : "Em estoque"
                      }
                    ></span>
                  </div>

                  <p className="text-xl font-bold text-gray-800">R${Number(p.preco_unitario).toFixed(2)}</p>

                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center gap-2 border rounded-xl p-1">
                      <button onClick={() => alterarQuantidade(p.nome, "menos")} className="p-1 rounded-full hover:bg-pink-100">
                        <Minus size={16} />
                      </button>
                      <span className="w-6 text-center">{quantidades[p.nome] || 1}</span>
                      <button onClick={() => alterarQuantidade(p.nome, "mais")} className="p-1 rounded-full hover:bg-pink-100">
                        <Plus size={16} />
                      </button>
                    </div>

                    <Button
                      onClick={() => adicionarAoCarrinho(p)}
                      disabled={p.quantidade_estoque === 0}
                      className={`${p.quantidade_estoque === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-pink-600 hover:bg-pink-500 text-white"
                        } rounded-xl px-4 py-2 font-semibold`}
                    >
                      {p.quantidade_estoque === 0 ? "Indisponível" : "COMPRAR"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {!loading && produtosFiltrados.length === 0 && (
          <p className="text-center text-gray-500 mt-8 text-lg">
            Nenhum produto encontrado.
          </p>
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
