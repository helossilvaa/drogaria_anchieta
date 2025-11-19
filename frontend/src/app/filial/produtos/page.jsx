'use client';
import { useEffect, useState } from "react";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const API_URL = 'http://localhost:8080/produtos';
const API_CATEGORIAS = "http://localhost:8080/categorias";

const ABAS = {
  TODOS: 'todos',
  ESTOQUE: 'estoque',
  VENCIDOS: 'vencidos',
};

export default function Produtos() {
  // dados
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('0'); // '0' = todas
  const [abaAtiva, setAbaAtiva] = useState(ABAS.TODOS);
  const [isLoading, setIsLoading] = useState(true);
  const [mensagemFeedback, setMensagemFeedback] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 8;
  const [isDialogOpen, setIsDialogOpen] = useState(false); // novo produto
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // editar produto
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false); // visualizar produto (novo modal)
  const [produtoVisualizado, setProdutoVisualizado] = useState(null); // produto aberto no modal de visualização
  const [produtoEditando, setProdutoEditando] = useState(null);
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsAuthenticated(true);
  }, []);

  const formatDate = (iso) => {
    if (!iso) return "N/A";
    try {
      return new Date(iso).toLocaleDateString("pt-BR");
    } catch {
      return iso;
    }
  };

  const isProdutoVencido = (produto) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const validade = produto?.validade ? new Date(produto.validade) : null;
    if (!validade) return false;
    validade.setHours(0, 0, 0, 0);
    return validade < hoje;
  };

  const getCategoriaNome = (categoria_id) => {
    const cat = categorias.find(c => Number(c.id) === Number(categoria_id));
    return cat ? cat.categoria : "-";
  };

  const getEstoqueStatus = (produto) => {
    // q para quantidade
    const q = produto?.quantidade;
    if (q == null) return "Desconhecido";
    if (isProdutoVencido(produto)) return "Vencido";
    if (q <= 0) return "Fora de estoque";
    if (q <= 5) return "Baixo estoque";
    return "Em estoque";
  };


  const fetchProdutos = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Erro ao carregar produtos");
      const data = await res.json();
      setProdutos(Array.isArray(data) ? data : []);
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
      const res = await fetch(API_CATEGORIAS, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Erro ao carregar categorias");
      const data = await res.json();
      const unique = Array.from(
        new Map(
          (Array.isArray(data) ? data : []).map(c => [String(c.categoria).toLowerCase().trim(), c])
        ).values()
      );

      setCategorias(unique);
    } catch (err) {
      console.error("Erro ao buscar categorias:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategorias();
      fetchProdutos();
    }
  }, [isAuthenticated]);

  const produtosFiltrados = produtos.filter((produto) => {
    if (categoriaSelecionada !== "0" && categoriaSelecionada !== "" &&
      Number(produto.categoria_id) !== Number(categoriaSelecionada)
    ) {
      return false;
    }

    switch (abaAtiva) {
      case ABAS.VENCIDOS:
        return isProdutoVencido(produto);
      case ABAS.ESTOQUE:
        return (produto.quantidade ?? 0) > 0 && !isProdutoVencido(produto);
      default:
        return true;
    }
  });

  const totalPaginas = Math.max(1, Math.ceil(produtosFiltrados.length / itensPorPagina));
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const produtosPaginados = produtosFiltrados.slice(inicio, inicio + itensPorPagina);

  const handlePaginaChange = (novaPagina) => {
    if (novaPagina > 0 && novaPagina <= totalPaginas) setPaginaAtual(novaPagina);
  };


  const handleCriarProduto = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
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

  const handleAtualizarProduto = async () => {
    if (!produtoEditando) return;
    const token = localStorage.getItem("token");

    const produtoCorrigido = {
      ...produtoEditando,
      registro_anvisa: produtoEditando.registro_anvisa ?? "",
      nome: produtoEditando.nome ?? "",
      foto: produtoEditando.foto ?? "",
      medida_id: produtoEditando.medida_id ?? null,
      tarja_id: produtoEditando.tarja_id ?? null,
      categoria_id: produtoEditando.categoria_id ?? null,
      marca_id: produtoEditando.marca_id ?? null,
      codigo_barras: produtoEditando.codigo_barras ?? "",
      descricao: produtoEditando.descricao ?? "",
      preco_unitario: produtoEditando.preco_unitario ?? 0,
      validade: produtoEditando.validade ?? null,
      fornecedor_id: produtoEditando.fornecedor_id ?? null,
      lote_id: produtoEditando.lote_id ?? null,
      armazenamento: produtoEditando.armazenamento ?? "",
    };

    try {
      const res = await fetch(`${API_URL}/${produtoEditando.id}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(produtoCorrigido),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensagem || "Erro ao atualizar produto");
      setMensagemFeedback({ type: "success", text: "Produto atualizado com sucesso!" });
      setIsEditDialogOpen(false);
      setProdutoEditando(null);
      await fetchProdutos();
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      setMensagemFeedback({ type: "error", text: error.message });
    }
  };

  const handleExcluirProduto = async (id) => {
    const token = localStorage.getItem("token");
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.mensagem || "Erro ao excluir produto");
      }
      setMensagemFeedback({ type: "success", text: "Produto excluído com sucesso!" });
      // fechar view modal caso esteja aberto para o mesmo produto
      if (produtoVisualizado?.id === id) {
        setIsViewDialogOpen(false);
        setProdutoVisualizado(null);
      }
      await fetchProdutos();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      setMensagemFeedback({ type: "error", text: error.message });
    }
  };

  const handleEditar = (produto) => {
    setProdutoEditando(produto);
    setIsEditDialogOpen(true);
  };

  const handleVisualizar = (produto) => {
    setProdutoVisualizado(produto);
    setIsViewDialogOpen(true);
  };

  const getAbaClasses = (aba) =>
    abaAtiva === aba
      ? "inline-block p-3 text-[#1b5143] border-b-2 border-[#4b9c86] font-semibold cursor-pointer"
      : "inline-block p-3 border-b-2 border-transparent hover:text-gray-800 hover:border-gray-300 cursor-pointer";

  return (
    <Layout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Gerenciar Produtos</h2>

        {/* FEEDBACK SIMPLES */}
        {mensagemFeedback && (
          <div className={`mb-4 p-2 rounded ${mensagemFeedback.type === "success" ? "bg-green-100 text-[#3e8473]" : "bg-red-100 text-red-800"}`}>
            {mensagemFeedback.text}
          </div>
        )}

        {/* Botão Criar Produto */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#b8677a] text-white hover:bg-[#3e8473] mb-4">
              Criar Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Novo Produto</DialogTitle></DialogHeader>
            <div className="grid gap-2 mt-2">
              <Input placeholder="Nome" value={novoProduto.nome} onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })} />
              <Input placeholder="Registro ANVISA" value={novoProduto.registro_anvisa} onChange={(e) => setNovoProduto({ ...novoProduto, registro_anvisa: e.target.value })} />
              <Input placeholder="Código de Barras" value={novoProduto.codigo_barras} onChange={(e) => setNovoProduto({ ...novoProduto, codigo_barras: e.target.value })} />
              <Input placeholder="Descrição" value={novoProduto.descricao} onChange={(e) => setNovoProduto({ ...novoProduto, descricao: e.target.value })} />
              <Input type="number" placeholder="Preço Unitário" value={novoProduto.preco_unitario} onChange={(e) => setNovoProduto({ ...novoProduto, preco_unitario: e.target.value })} />
              <Input type="date" placeholder="Validade" value={novoProduto.validade} onChange={(e) => setNovoProduto({ ...novoProduto, validade: e.target.value })} />
              {/* Tarja */}
              <Select value={novoProduto.tarja} onValueChange={(v) => setNovoProduto({ ...novoProduto, tarja: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tarja" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sem tarja">Sem Tarja</SelectItem>
                  <SelectItem value="vermelha">Vermelha</SelectItem>
                  <SelectItem value="amarela">Amarela</SelectItem>
                  <SelectItem value="preta">Preta</SelectItem>
                </SelectContent>
              </Select>
              <Select value={String(novoProduto.categoria_id || "")} onValueChange={(v) => setNovoProduto({ ...novoProduto, categoria_id: v })}>
                <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={categoriaSelecionada}>Selecione</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.categoria}</SelectItem>
                  ))}
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

        {/* DIALOG EDITAR */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Editar Produto</DialogTitle></DialogHeader>
            {produtoEditando && (
              <div className="grid gap-3 mt-2">
                <Input placeholder="Nome" value={produtoEditando.nome} onChange={(e) => setProdutoEditando({ ...produtoEditando, nome: e.target.value })} />
                <Input placeholder="Registro ANVISA" value={produtoEditando.registro_anvisa || ""} onChange={(e) => setProdutoEditando({ ...produtoEditando, registro_anvisa: e.target.value })} />
                <Input placeholder="Código de Barras" value={produtoEditando.codigo_barras || ""} onChange={(e) => setProdutoEditando({ ...produtoEditando, codigo_barras: e.target.value })} />
                <Input type="number" placeholder="Preço Unitário" value={produtoEditando.preco_unitario ?? ""} onChange={(e) => setProdutoEditando({ ...produtoEditando, preco_unitario: parseFloat(e.target.value) })} />
                <Input type="date" value={produtoEditando.validade ? produtoEditando.validade.split("T")[0] : ""} onChange={(e) => setProdutoEditando({ ...produtoEditando, validade: e.target.value })} />
                <Input placeholder="Descrição" value={produtoEditando.descricao || ""} onChange={(e) => setProdutoEditando({ ...produtoEditando, descricao: e.target.value })} />
                <Select value={String(produtoEditando.categoria_id || "")} onValueChange={(v) => setProdutoEditando({ ...produtoEditando, categoria_id: Number(v) })}>
                  <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={categoriaSelecionada}>Selecione</SelectItem>
                    {categorias.map((cat) =>
                      <SelectItem key={cat.id} value={String(cat.id)}>{cat.categoria}</SelectItem>
                    )}
                  </SelectContent>
                </Select>

                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Medida ID" value={produtoEditando.medida_id || ""} onChange={(e) => setProdutoEditando({ ...produtoEditando, medida_id: Number(e.target.value) })} />
                  <Input placeholder="Marca ID" value={produtoEditando.marca_id || ""} onChange={(e) => setProdutoEditando({ ...produtoEditando, marca_id: Number(e.target.value) })} />
                </div>

                <Input placeholder="Fornecedor ID" value={produtoEditando.fornecedor_id || ""} onChange={(e) => setProdutoEditando({ ...produtoEditando, fornecedor_id: Number(e.target.value) })} />
                <Input placeholder="Lote ID" value={produtoEditando.lote_id || ""} onChange={(e) => setProdutoEditando({ ...produtoEditando, lote_id: Number(e.target.value) })} />
                <Input placeholder="Armazenamento" value={produtoEditando.armazenamento || ""} onChange={(e) => setProdutoEditando({ ...produtoEditando, armazenamento: e.target.value })} />
              </div>
            )}
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
              <Button className="bg-[#4b9c86] text-white hover:bg-[#3e8473]" onClick={handleAtualizarProduto}>Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DIALOG VISUALIZAR (NOVO) */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Visualizar Produto</DialogTitle></DialogHeader>

            {produtoVisualizado ? (
              <div className="grid gap-3 mt-2">
                <div className="flex items-start gap-4">
                  {/* imagem se existir */}
                  {produtoVisualizado.foto ? (
                    <img src={produtoVisualizado.foto} alt={produtoVisualizado.nome} className="w-28 h-28 object-cover rounded" />
                  ) : (
                    <div className="w-28 h-28 bg-gray-100 flex items-center justify-center rounded text-sm">Sem foto</div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">{produtoVisualizado.nome}</h3>
                    <p className="text-sm text-gray-600">{produtoVisualizado.descricao || "-"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>Categoria:</strong><div>{getCategoriaNome(produtoVisualizado.categoria_id)}</div></div>
                  <div><strong>Marca:</strong><div>{produtoVisualizado.marca_id ?? "N/A"}</div></div>
                  <div><strong>Código de Barras:</strong><div>{produtoVisualizado.codigo_barras || "-"}</div></div>
                  <div><strong>Registro ANVISA:</strong><div>{produtoVisualizado.registro_anvisa || "-"}</div></div>
                  <div><strong>Validade:</strong><div>{formatDate(produtoVisualizado.validade)}</div></div>
                  <div><strong>Quantidade:</strong><div>{produtoVisualizado.quantidade ?? "N/A"}</div></div>
                  <div><strong>Estoque:</strong><div>{getEstoqueStatus(produtoVisualizado)}</div></div>
                  <div><strong>Armazenamento:</strong><div>{produtoVisualizado.armazenamento || "-"}</div></div>
                </div>

                <div className="mt-2">
                  <strong>Preço unitário: </strong>
                  <span>{produtoVisualizado.preco_unitario != null ? `R$ ${Number(produtoVisualizado.preco_unitario).toFixed(2)}` : "-"}</span>
                </div>

                <div className="mt-3 flex gap-2">
                  <Button variant="outline" onClick={() => { setIsViewDialogOpen(false); setProdutoVisualizado(null); }}>
                    Fechar
                  </Button>

                  <Button onClick={() => { setIsViewDialogOpen(false); handleEditar(produtoVisualizado); }}>
                    Editar
                  </Button>

                  <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleExcluirProduto(produtoVisualizado.id)}>
                    Excluir
                  </Button>
                </div>
              </div>
            ) : (
              <div>Nenhum produto selecionado.</div>
            )}
          </DialogContent>
        </Dialog>

        {/* ABAS */}
        <div className="border-b mb-4">
          <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500">
            <li><a onClick={() => setAbaAtiva(ABAS.TODOS)} className={getAbaClasses(ABAS.TODOS)}>Todos</a></li>
            <li><a onClick={() => setAbaAtiva(ABAS.ESTOQUE)} className={getAbaClasses(ABAS.ESTOQUE)}>Em Estoque</a></li>
            <li><a onClick={() => setAbaAtiva(ABAS.VENCIDOS)} className={getAbaClasses(ABAS.VENCIDOS)}>Vencidos</a></li>
          </ul>
        </div>

        {/* FILTRO CATEGORIA */}
        <div className="mb-4 w-64">
          <Select value={categoriaSelecionada} onValueChange={(v) => { setCategoriaSelecionada(v); setPaginaAtual(1); }}>
            <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Todas</SelectItem>
              {categorias.map((cat) => <SelectItem key={cat.id} value={String(cat.id)}>{cat.categoria}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* TABELA */}
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-gray-500">
            <thead className="uppercase bg-gray-200 text-gray-540">
              <tr>
                <th className="py-3">Nome</th>
                <th className="py-3 px-6">Categoria</th>
                <th className="py-3 px-6">Marca</th>
                <th className="py-3">Código</th>
                <th className="py-3">Validade</th>
                <th className="py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" className="py-4">Carregando produtos...</td></tr>
              ) : produtosPaginados.length === 0 ? (
                <tr><td colSpan="6" className="py-4 text-gray-900">Nenhum produto encontrado.</td></tr>
              ) : (
                produtosPaginados.map((produto) => (
                  <tr key={produto.id} className="odd:bg-white even:bg-gray-50 border-b text-center">
                    <td className="px-4 py-6 font-normal text-gray-900">{produto.nome}</td>
                    <td className="px-10 py-6">{getCategoriaNome(produto.categoria)}</td>
                    <td className="px-10 py-6">{produto.marca_id || "N/A"}</td>
                    <td className="px-10 py-6">{produto.codigo_barras || "-"}</td>
                    <td className="px-10 py-6">{produto.validade ? formatDate(produto.validade) : "N/A"}</td>
                    <td className="flex py-4 px-6 justify-center gap-2">

                      <button onClick={() => handleEditar(produto)} className="rounded-full p-2 hover:bg-[#4b9c861f]" > <svg className="w-6 h-6 text-[#659b8d] dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"> <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.779 17.779 4.36 19.918 6.5 13.5m4.279 4.279 8.364-8.643a3.027 3.027 0 0 0-2.14-5.165 3.03 3.03 0 0 0-2.14.886L6.5 13.5m4.279 4.279L6.499 13.5m2.14 2.14 6.213-6.504M12.75 7.04 17 11.28" /> </svg> </button>
                      <button onClick={() => handleVisualizar(produto)} className="rounded-full p-2 hover:bg-[#4b9c861f]" >
                        <svg className="w-[20px] h-[20px] text-[#8dc9b9] dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                          <path stroke="currentColor" strokeWidth="2" d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z" />
                          <path stroke="currentColor" strokeWidth="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>

                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINAÇÃO */}
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button variant="outline" disabled={paginaAtual === 1} onClick={() => handlePaginaChange(paginaAtual - 1)}>Anterior</Button>
          <span>Página {paginaAtual} de {totalPaginas}</span>
          <Button variant="outline" disabled={paginaAtual === totalPaginas} onClick={() => handlePaginaChange(paginaAtual + 1)}>Próximo</Button>
        </div>
      </div>
    </Layout>
  );
}
