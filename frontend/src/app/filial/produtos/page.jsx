'use client';
import { useEffect, useState } from "react";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem, SelectLabel, } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = 'http://localhost:8080/produtos';
const API_CATEGORIAS = "http://localhost:8080/categorias";

const ABAS = {
  TODOS: 'todos',
  ESTOQUE: 'estoque',
  VENCIDOS: 'vencidos',
};

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [abaAtiva, setAbaAtiva] = useState(ABAS.TODOS);
  const [isLoading, setIsLoading] = useState(true);
  const [mensagemFeedback, setMensagemFeedback] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 8;
  //configurações de estado do Dialog 
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [novoProduto, setNovoProduto] = useState({
    registro_anvisa: "",
    nome: "",
    medida_id: "",
    tarja: "",
    categoria_id: "",
    marca_id: "",
    codigo_barras: "",
    descricao: "",
    preco_unitario: "",
    validade: "",
    fornecedor_id: "",
    lote_id: "",
    armazenamento: "",
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsAuthenticated(true);
  }, []);

  const fetchProdutos = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Erro ao carregar produtos");
      const data = await res.json();
      setProdutos(data);
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      setMensagemFeedback({ type: "error", text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_CATEGORIAS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao carregar categorias");
      const data = await res.json();
      setCategorias(data);
    } catch (err) {
      console.error("Erro ao buscar categorias:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProdutos();
      fetchCategorias();
    }
  }, [isAuthenticated]);

  // Verificação se o produto está vencido
  const isProdutoVencido = (produto) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const validade = produto.validade ? new Date(produto.validade) : null;
    if (!validade) return false;
    validade.setHours(0, 0, 0, 0);
    return validade < hoje;
  };

  // Filtro pelas abas
  const produtosFiltrados = produtos.filter((produto) => {
    if (
      categoriaSelecionada &&
      produto.categoria?.id !== parseInt(categoriaSelecionada)
    ) {
      return false;
    }

    switch (abaAtiva) {
      case ABAS.VENCIDOS:
        return isProdutoVencido(produto);
      case ABAS.ESTOQUE:
        return produto.quantidade > 0 && !isProdutoVencido(produto);
      default:
        return true;
    }
  });

  const handleAtualizarProduto = async () => {
    if (!produtoEditando) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/${produtoEditando.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(produtoEditando),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.mensagem || "Erro ao atualizar produto");
      }

      setMensagemFeedback({ type: "success", text: "Produto atualizado com sucesso!" });
      setIsEditDialogOpen(false);
      await fetchProdutos();
    } catch (err) {
      console.error(err);
      setMensagemFeedback({ type: "error", text: err.message });
    }
  };

  //editar o produto
  const handleEditarClick = (produto) => {
    setProdutoEditando(produto);
    setIsEditDialogOpen(true);
  };

  //handel de deletar o produto
  const handleExcluirProduto = async (id) => {
    const token = localStorage.getItem("token");
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erro ao excluir produto");

      setMensagemFeedback({ type: "success", text: "Produto excluído com sucesso!" });
      await fetchProdutos();
    } catch (err) {
      console.error(err);
      setMensagemFeedback({ type: "error", text: err.message });
    }
  };

  // Paginação
  const totalPaginas = Math.ceil(produtosFiltrados.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const produtosPaginados = produtosFiltrados.slice(inicio, inicio + itensPorPagina);

  const handlePaginaChange = (novaPagina) => {
    if (novaPagina > 0 && novaPagina <= totalPaginas) setPaginaAtual(novaPagina);
  };

  const getAbaClasses = (aba) =>
    abaAtiva === aba
      ? "inline-block p-3 text-[#1b5143] border-b-2 border-[#4b9c86] font-semibold cursor-pointer"
      : "inline-block p-3 border-b-2 border-transparent hover:text-gray-800 hover:border-gray-300 cursor-pointer";

  //criar novo produto pelo Dialog
  const handleCriarProduto = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(novoProduto),
      });

      if (!res.ok) throw new Error("Erro ao criar produto");

      setMensagemFeedback({ type: "success", text: "Produto criado com sucesso!" });
      setIsDialogOpen(false);
      setNovoProduto({
        registro_anvisa: "",
        nome: "",
        medida_id: "",
        tarja: "",
        categoria_id: "",
        marca_id: "",
        codigo_barras: "",
        descricao: "",
        preco_unitario: "",
        validade: "",
        fornecedor_id: "",
        lote_id: "",
        armazenamento: "",
      });
      await fetchProdutos();
    } catch (err) {
      console.error(err);
      setMensagemFeedback({ type: "error", text: err.message });
    }
  };




  return (
    <Layout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Gerenciar Produtos</h2>

        {/* Botão Criar Produto */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#b8677a] text-white hover:bg-[#3e8473]">
              Criar Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Novo Produto</DialogTitle>
            </DialogHeader>

            <div className="grid gap-2 mt-2">
              <Input placeholder="Nome" value={novoProduto.nome} onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })} />
              <Input placeholder="Registro ANVISA" value={novoProduto.registro_anvisa} onChange={(e) => setNovoProduto({ ...novoProduto, registro_anvisa: e.target.value })} />
              <Input placeholder="Código de Barras" value={novoProduto.codigo_barras} onChange={(e) => setNovoProduto({ ...novoProduto, codigo_barras: e.target.value })} />
              <Input placeholder="Descrição" value={novoProduto.descricao} onChange={(e) => setNovoProduto({ ...novoProduto, descricao: e.target.value })} />
              <Input type="number" placeholder="Preço Unitário" value={novoProduto.preco_unitario} onChange={(e) => setNovoProduto({ ...novoProduto, preco_unitario: e.target.value })} />
              <Input type="date" placeholder="Validade" value={novoProduto.validade} onChange={(e) => setNovoProduto({ ...novoProduto, validade: e.target.value })} />

              {/* Select Tarja */}
              <Select value={novoProduto.tarja} onValueChange={(v) => setNovoProduto({ ...novoProduto, tarja: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione a Tarja" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sem tarja">Sem Tarja</SelectItem>
                  <SelectItem value="vermelha">Vermelha</SelectItem>
                  <SelectItem value="amarela">Amarela</SelectItem>
                  <SelectItem value="preta">Preta</SelectItem>
                </SelectContent>
              </Select>

              {/* Select Categoria */}
              <Select value={novoProduto.categoria_id} onValueChange={(v) => setNovoProduto({ ...novoProduto, categoria: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione a Categoria" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="medicamento">Medicamento</SelectItem>
                  <SelectItem value="cosmetico">Cosmético</SelectItem>
                  <SelectItem value="alimento">Alimento</SelectItem>
                  <SelectItem value="conveniencia">Conveniência</SelectItem>
                  <SelectItem value="higiene">Higiene</SelectItem>
                </SelectContent>
              </Select>

              <Input placeholder="Medida ID" value={novoProduto.medida_id} onChange={(e) => setNovoProduto({ ...novoProduto, medida_id: e.target.value })} />
              <Input placeholder="Marca ID" value={novoProduto.marca_id} onChange={(e) => setNovoProduto({ ...novoProduto, marca_id: e.target.value })} />
              <Input placeholder="Fornecedor ID" value={novoProduto.fornecedor_id} onChange={(e) => setNovoProduto({ ...novoProduto, fornecedor_id: e.target.value })} />
              <Input placeholder="Lote ID" value={novoProduto.lote_id} onChange={(e) => setNovoProduto({ ...novoProduto, lote_id: e.target.value })} />
              <Input placeholder="Armazenamento" value={novoProduto.armazenamento} onChange={(e) => setNovoProduto({ ...novoProduto, armazenamento: e.target.value })} />
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button className="bg-[#4b9c86] text-white hover:bg-[#3e8473]" onClick={handleCriarProduto}>Salvar Produto</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de editar o produto */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar Produto</DialogTitle>
            </DialogHeader>

            {produtoEditando && (
              <div className="grid gap-2 mt-2">
                <Input
                  placeholder="Nome"
                  value={produtoEditando.nome}
                  onChange={(e) =>
                    setProdutoEditando({ ...produtoEditando, nome: e.target.value })
                  }
                />
                <Input
                  placeholder="Registro ANVISA"
                  value={produtoEditando.registro_anvisa || ""}
                  onChange={(e) =>
                    setProdutoEditando({ ...produtoEditando, registro_anvisa: e.target.value })
                  }
                />
                <Input
                  placeholder="Código de Barras"
                  value={produtoEditando.codigo_barras || ""}
                  onChange={(e) =>
                    setProdutoEditando({ ...produtoEditando, codigo_barras: e.target.value })
                  }
                />
                <Input
                  type="number"
                  placeholder="Preço Unitário"
                  value={produtoEditando.preco_unitario || ""}
                  onChange={(e) =>
                    setProdutoEditando({ ...produtoEditando, preco_unitario: e.target.value })
                  }
                />
                <Input
                  type="date"
                  value={produtoEditando.validade ? produtoEditando.validade.split("T")[0] : ""}
                  onChange={(e) =>
                    setProdutoEditando({ ...produtoEditando, validade: e.target.value })
                  }
                />
                <Input
                  placeholder="Descrição"
                  value={produtoEditando.descricao || ""}
                  onChange={(e) =>
                    setProdutoEditando({ ...produtoEditando, descricao: e.target.value })
                  }
                />
              </div>
            )}

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                className="bg-[#4b9c86] text-white hover:bg-[#3e8473]"
                onClick={handleAtualizarProduto}
              >
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <AnimatePresence>
          {mensagemFeedback?.text && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg border ${mensagemFeedback.type === "success"
                  ? "bg-green-100 text-green-800 border-green-300"
                  : "bg-red-100 text-red-800 border-red-300"
                }`}
            >
              {mensagemFeedback.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Abas */}
        <div className="border-b mb-4">
          <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500">
            <li>
              <a onClick={() => setAbaAtiva(ABAS.TODOS)} className={getAbaClasses(ABAS.TODOS)}>
                Todos
              </a>
            </li>
            <li>
              <a onClick={() => setAbaAtiva(ABAS.ESTOQUE)} className={getAbaClasses(ABAS.ESTOQUE)}>
                Em Estoque
              </a>
            </li>
            <li>
              <a onClick={() => setAbaAtiva(ABAS.VENCIDOS)} className={getAbaClasses(ABAS.VENCIDOS)}>
                Vencidos
              </a>
            </li>
          </ul>
        </div>

        {/* Filtro de Categoria */}
        <div className="mb-4 w-64">
          <Select value={categoriaSelecionada} onValueChange={setCategoriaSelecionada}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Categorias</SelectLabel>
                <SelectItem>Todas</SelectItem>
                {categorias.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.categoria_id}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Tabela */}
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-center text-gray-500">
            <thead className="text-xs uppercase bg-gray-200 text-gray-700">
              <tr>
                <th className="py-3 px-6">Nome</th>
                <th className="py-3 px-6">Categoria</th>
                <th className="py-3 px-6">Marca</th>
                <th className="py-3 px-6">Registro ANVISA</th>
                <th className="py-3 px-6">Validade</th>
                <th className="py-3 px-6">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-4">
                    Carregando produtos...
                  </td>
                </tr>
              ) : produtosPaginados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-4 text-gray-900">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              ) : (
                produtosPaginados.map((produto) => (
                  <tr key={produto.id} className="odd:bg-white even:bg-gray-50 border-b">
                    <td className="px-6 py-4 font-medium text-gray-900">{produto.nome}</td>
                    <td className="px-6 py-4">{produto.categoria}</td>
                    <td className="px-6 py-4">{produto.marca_id || "N/A"}</td>
                    <td className="px-6 py-4">{produto.registro_anvisa || "-"}</td>
                    <td className="px-6 py-4">
                      {produto.validade
                        ? new Date(produto.validade).toLocaleDateString("pt-BR")
                        : "N/A"}
                    </td>
                    <td className=" flex px-6 py-4">
                      <button
                        onClick={() => handleExcluirProduto(produto.id)}
                        className="rounded-full p-1 hover:bg-red-900"
                      >
                        <svg
                          className="w-6 h-6 text-gray-800 dark:text-white"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path fillRule="evenodd" d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            variant="outline"
            disabled={paginaAtual === 1}
            onClick={() => handlePaginaChange(paginaAtual - 1)}
          >
            Anterior
          </Button>
          <span>
            Página {paginaAtual} de {totalPaginas}
          </span>
          <Button
            variant="outline"
            disabled={paginaAtual === totalPaginas}
            onClick={() => handlePaginaChange(paginaAtual + 1)}
          >
            Próximo
          </Button>
        </div>
      </div>
    </Layout>
  );
}