'use client';
import { useEffect, useState } from "react";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const API_URL = 'http://localhost:8080/produtos';
const API_CATEGORIAS = "http://localhost:8080/categorias";
const API_LOTESMATRIZ = "http://localhost:8080/lotesmatriz";
const API_ESTOQUEFILIAL = "http://localhost:8080/estoqueFilial";

const ABAS = {
  TODOS: 'todos',
  VENCIDOS: 'vencidos',
};

export default function Produtos() {
  // estados principais
  const [produtos, setProdutos] = useState([]);
  const [estoqueFilial, setEstoqueFilial] = useState([]);
  const [produtosCompletos, setProdutosCompletos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [tarjas, setTarjas] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mensagemFeedback, setMensagemFeedback] = useState(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('0');
  const [abaAtiva, setAbaAtiva] = useState(ABAS.TODOS);
  const [searchTerm, setSearchTerm] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 8;
  const [filtro, setFiltro] = useState("vencidos");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [produtoVisualizado, setProdutoVisualizado] = useState(null);
  const [produtoEditando, setProdutoEditando] = useState(null);

  // defaults
  const DEFAULT_ESTOQUE_MINIMO = 30;

  // auth detect
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsAuthenticated(true);
  }, []);

  // util
  const formatDate = (iso) => {
    if (!iso) return "N/A";
    try {
      return new Date(iso).toLocaleDateString("pt-BR");
    } catch {
      return iso;
    }
  };


  function diasParaVencer(data_validade) {
    if (!data_validade) return null;
    const hoje = new Date();
    const validade = new Date(data_validade);
    return Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
  }


  function isProdutoProximo(produto) {
    const dias = diasParaVencer(produto.data_validade);
    return dias !== null && dias >= 0 && dias <= 30;
  }


  const getCategoriaNome = (id) => {
    if (!categorias || categorias.length === 0) return "-";
    const c = categorias.find(cat => Number(cat.id) === Number(id));
    return c ? (c.nome || c.categoria) : "-";
  };

  const isProdutoVencido = (produto) => {
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const validade = produto?.validade ? new Date(produto.validade) : null;
    if (!validade) return false;
    validade.setHours(0, 0, 0, 0);
    return validade < hoje;
  };

  // fetchers
  const fetchCategorias = async (token) => {
    try {
      const res = await fetch(API_CATEGORIAS, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Erro ao carregar categorias");
      const data = await res.json();
      const unique = Array.from(new Map((Array.isArray(data) ? data : []).map(c => [String(c.id), { ...c, nome: c.nome || c.categoria }])).values());
      setCategorias(unique);
    } catch (err) {
      console.error("fetchCategorias:", err);
    }
  };

  const fetchLotes = async (token) => {
    try {
      const res = await fetch(API_LOTESMATRIZ, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Erro ao carregar lotes");
      const data = await res.json();
      setLotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchLotes:", err);
    }
  };

  const fetchEstoqueFilial = async (token) => {
    try {
      const res = await fetch(API_ESTOQUEFILIAL, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Erro ao carregar estoque da filial");
      const data = await res.json();
      setEstoqueFilial(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchEstoqueFilial:", err);
      setEstoqueFilial([]);
    }
  };

  const fetchProdutos = async (token) => {
    try {
      const res = await fetch(API_URL, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      if (!res.ok) throw new Error("Erro ao carregar produtos");
      const data = await res.json();
      setProdutos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchProdutos:", err);
      setProdutos([]);
    }
  };

  // quando autenticado, carregar tudo
  useEffect(() => {
    if (!isAuthenticated) return;
    let mounted = true;
    const token = localStorage.getItem("token");
    (async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchCategorias(token),
          fetchLotes(token),
          fetchEstoqueFilial(token),
          fetchProdutos(token),
        ]);
      } catch (err) {
        console.error("Erro ao carregar dados iniciais:", err);
        setMensagemFeedback({ type: "error", text: "Erro ao carregar dados" });
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [isAuthenticated]);

  // merge produtos + estoqueFilial => produtosCompletos
  const mergeProductsWithStock = (produtosRaw, estoqueRaw) => {
    const estoqueMap = new Map();
    (Array.isArray(estoqueRaw) ? estoqueRaw : []).forEach(row => {
      const pid = Number(row.produto_id);
      const qtd = Number(row.quantidade ?? 0);
      
      const existing = estoqueMap.get(pid) || { 
        totalQuantidade: 0, 
        estoque_minimo: row.estoque_minimo ?? null, 
        estoque_maximo: row.estoque_maximo ?? null 
      };
      
      existing.totalQuantidade += qtd;
      
      // Atualiza min/max se for o primeiro valor encontrado
      if (existing.estoque_minimo === null) {
        existing.estoque_minimo = Number(row.estoque_minimo ?? DEFAULT_ESTOQUE_MINIMO);
      }
      if (existing.estoque_maximo === null) {
        existing.estoque_maximo = Number(row.estoque_maximo ?? null);
      }
      
      estoqueMap.set(pid, existing);
    });

    const merged = (Array.isArray(produtosRaw) ? produtosRaw : []).map(p => {
      const pid = Number(p.id);
      const stockInfo = estoqueMap.get(pid) || { totalQuantidade: 0, estoque_minimo: DEFAULT_ESTOQUE_MINIMO, estoque_maximo: null };
      
      return {
        ...p,
        // Garante que a quantidade é o somatório do estoque da filial
        quantidade: stockInfo.totalQuantidade,
        estoque_minimo: stockInfo.estoque_minimo,
        estoque_maximo: stockInfo.estoque_maximo,
      };
    });

    return merged;
  };

  useEffect(() => {
    const merged = mergeProductsWithStock(produtos, estoqueFilial);
    setProdutosCompletos(merged);
    setPaginaAtual(1);
  }, [produtos, estoqueFilial]);

  // cálculo estoque / status
  function calcularEstoqueTotal(produto) {
    // Confia no cálculo feito em mergeProductsWithStock
    return Number(produto.quantidade || 0);
  }


  function obterStatusEstoque(quantidade, estoque_minimo) {
    const minimo = estoque_minimo ?? DEFAULT_ESTOQUE_MINIMO;
    if (quantidade === 0) return { texto: "Sem estoque", cor: "bg-red-100 text-red-700" };
    if (quantidade < minimo) return { texto: "Baixo", cor: "bg-yellow-100 text-yellow-700" };
    return { texto: "Normal", cor: "bg-green-100 text-green-700" };
  }

  const produtosFiltrados = produtosCompletos.filter(produto => {
    const produtoCategoriaId = Number(produto?.categoria_id ?? produto?.categoria ?? 0);
    if (categoriaSelecionada !== "0" && categoriaSelecionada !== "" && produtoCategoriaId !== Number(categoriaSelecionada)) return false;
    switch (abaAtiva) {
      case ABAS.VENCIDOS:
        if (!isProdutoVencido(produto)) return false;
        break;

      case ABAS.PROXIMOS:
        if (!isProdutoProximo(produto)) return false;
        break;

      default:
        break;
    }

    if (searchTerm.trim() !== "") {
      const termo = searchTerm.toLowerCase();
      const nome = String(produto.nome || "").toLowerCase();
      const descricao = String(produto.descricao || "").toLowerCase();
      const anvisa = String(produto.registro_anvisa || "").toLowerCase();
      const barras = String(produto.codigo_barras || "").toLowerCase();
      if (!nome.includes(termo) && !descricao.includes(termo) && !anvisa.includes(termo) && !barras.includes(termo)) return false;
    }

    return true;
  });

  const totalPaginas = Math.max(1, Math.ceil(produtosFiltrados.length / itensPorPagina));
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const produtosPaginados = produtosFiltrados.slice(inicio, inicio + itensPorPagina);
  const handlePaginaChange = (novaPagina) => { if (novaPagina > 0 && novaPagina <= totalPaginas) setPaginaAtual(novaPagina); };

  const getAbaClasses = (aba) =>
    abaAtiva === aba
      ? "inline-block p-3 text-[#1b5143] border-b-2 border-[#4b9c86] font-semibold cursor-pointer"
      : "inline-block p-3 border-b-2 border-transparent hover:text-gray-800 hover:border-gray-300 cursor-pointer";

  // edição / visualização / exclusão
  const handleEditar = (produto) => {
    setProdutoEditando({
      ...produto,
      categoria_id: produto.categoria_id ?? produto?.categoria ?? '',
      marca_id: produto.marca_id ?? produto.marca ?? '',
      medida_id: produto.medida_id ?? produto?.medida ?? '',
      fornecedor_id: produto.fornecedor_id ?? produto.fornecedor ?? '',
      lote_id: produto.lote_id ?? produto.lote ?? '',
      tarja_id: produto.tarja_id ?? produto.tarja ?? '',
    });
    const token = localStorage.getItem("token");
    if (token) fetchEstoqueFilial(token);
    setIsEditDialogOpen(true);
  };

  const handleVisualizar = (produto) => {
    setProdutoVisualizado(produto);
    setIsViewDialogOpen(true);
  };

  const handleExcluirProduto = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) { setMensagemFeedback({ type: 'error', text: 'Usuário não autenticado.' }); setTimeout(() => setMensagemFeedback(null), 2500); return; }
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.mensagem || data.message || 'Erro ao excluir produto');
      }
      setMensagemFeedback({ type: 'success', text: 'Produto excluído com sucesso!' }); setTimeout(() => setMensagemFeedback(null), 3000);
      await fetchProdutos(localStorage.getItem("token"));
      await fetchEstoqueFilial(localStorage.getItem("token"));
    } catch (err) {
      console.error("handleExcluirProduto:", err);
      setMensagemFeedback({ type: 'error', text: err.message || 'Erro ao excluir produto' }); setTimeout(() => setMensagemFeedback(null), 3000);
    }
  };

  // salvar edição de produto (PUT)
  const handleAtualizarProduto = async () => {
    if (!produtoEditando) return;
    const token = localStorage.getItem("token");
    if (!token) { setMensagemFeedback({ type: 'error', text: 'Usuário não autenticado.' }); setTimeout(() => setMensagemFeedback(null), 2500); return; }

    // normalizar payload
    const payload = {
      registro_anvisa: produtoEditando.registro_anvisa || null,
      nome: produtoEditando.nome || null,
      foto: produtoEditando.foto || null,
      medida_id: produtoEditando.medida_id ?? null,
      tarja_id: produtoEditando.tarja_id ?? null,
      categoria_id: produtoEditando.categoria_id ?? null,
      marca_id: produtoEditando.marca_id ?? null,
      codigo_barras: produtoEditando.codigo_barras || null,
      descricao: produtoEditando.descricao || null,
      preco_unitario: produtoEditando.preco_unitario ?? null,
      validade: produtoEditando.validade || null,
      fornecedor_id: produtoEditando.fornecedor_id ?? null,
      lote_id: produtoEditando.lote_id ?? null,
      armazenamento: produtoEditando.armazenamento || null,
    };

    try {
      const res = await fetch(`${API_URL}/${produtoEditando.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.mensagem || data.message || "Erro ao atualizar produto");
      setMensagemFeedback({ type: "success", text: "Produto atualizado com sucesso!" });
      setTimeout(() => setMensagemFeedback(null), 3000);
      setIsEditDialogOpen(false);
      setProdutoEditando(null);
      await fetchProdutos(token);
      await fetchEstoqueFilial(token);
    } catch (err) {
      console.error("handleAtualizarProduto:", err);
      setMensagemFeedback({ type: 'error', text: err.message || 'Erro ao atualizar produto' });
      setTimeout(() => setMensagemFeedback(null), 3000);
    }
  };

  return (
    <Layout>
      <div className="p-4">
        <h2 className="text-[#d1d0d0] text-3xl font-bold mb-4">Gerenciar Produtos</h2>

        {mensagemFeedback && (
          <div className={`mb-4 px-4 py-2 rounded ${mensagemFeedback.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
            {mensagemFeedback.text}
          </div>
        )}

        {/* DIALOG EDIT */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto p-6">
            <DialogHeader><DialogTitle className="text-[#d1d0d0] text-2xl font-bold mb-4">Editar Produto</DialogTitle></DialogHeader>
            {produtoEditando ? (
              <div className="grid gap-3 mt-4">
                <Input placeholder="Nome" value={produtoEditando.nome || ""} onChange={(e) => setProdutoEditando({ ...produtoEditando, nome: e.target.value })} />
                <Input placeholder="Registro ANVISA" value={produtoEditando.registro_anvisa || ""} onChange={(e) => setProdutoEditando({ ...produtoEditando, registro_anvisa: e.target.value })} />
                <Input placeholder="Código de Barras" value={produtoEditando.codigo_barras || ""} onChange={(e) => setProdutoEditando({ ...produtoEditando, codigo_barras: e.target.value })} />
                <Input type="number" placeholder="Preço Unitário" value={produtoEditando.preco_unitario ?? ""} onChange={(e) => setProdutoEditando({ ...produtoEditando, preco_unitario: parseFloat(e.target.value) || null })} />
                <Input type="date" value={produtoEditando.validade ? (produtoEditando.validade.split ? produtoEditando.validade.split("T")[0] : produtoEditando.validade) : ""} onChange={(e) => setProdutoEditando({ ...produtoEditando, validade: e.target.value })} />
                <Input placeholder="Descrição" value={produtoEditando.descricao || ""} onChange={(e) => setProdutoEditando({ ...produtoEditando, descricao: e.target.value })} />

                <Select value={String(produtoEditando.categoria_id ?? "")} onValueChange={(v) => setProdutoEditando({ ...produtoEditando, categoria_id: v ? Number(v) : "" })}>
                  <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Selecione</SelectItem>
                    {categorias.map(cat => <SelectItem key={cat.id} value={String(cat.id)}>{cat.nome || cat.categoria}</SelectItem>)}
                  </SelectContent>
                </Select>

                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Medida ID" value={produtoEditando.medida_id ?? ""} onChange={(e) => setProdutoEditando({ ...produtoEditando, medida_id: Number(e.target.value) || "" })} />
                  <Input placeholder="Marca ID" value={produtoEditando.marca_id ?? ""} onChange={(e) => setProdutoEditando({ ...produtoEditando, marca_id: Number(e.target.value) || "" })} />
                </div>

                <Input placeholder="Fornecedor ID" value={produtoEditando.fornecedor_id ?? ""} onChange={(e) => setProdutoEditando({ ...produtoEditando, fornecedor_id: Number(e.target.value) || "" })} />

                <Select value={String(produtoEditando.lote_id ?? "")} onValueChange={(v) => setProdutoEditando({ ...produtoEditando, lote_id: v ? Number(v) : "" })}>
                  <SelectTrigger><SelectValue placeholder="Selecione o lote" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sem lote</SelectItem>
                    {lotes.map(l => <SelectItem key={l.id} value={String(l.id)}>Lote {l.numero_lote} — Validade {formatDate(l.data_validade)}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Input placeholder="Armazenamento" value={produtoEditando.armazenamento || ""} onChange={(e) => setProdutoEditando({ ...produtoEditando, armazenamento: e.target.value })} />
              </div>
            ) : <div>Nenhum produto selecionado.</div>}

            <DialogFooter className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setProdutoEditando(null); }}>Cancelar</Button>
              <Button className="bg-[#4b9c86] text-white hover:bg-[#3e8473]" onClick={handleAtualizarProduto}>Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DIALOG VIEW */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-md rounded-2xl shadow-lg border border-gray-200 bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-800">
                Visualizar Produto
              </DialogTitle>
            </DialogHeader>

            {produtoVisualizado ? (
              <div className="grid gap-4 mt-3">
                <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl">
                  {produtoVisualizado.foto ? (
                    <img
                      src={`http://localhost:8080/uploads/produtos/${produtoVisualizado.foto}`}
                      alt={produtoVisualizado.nome}
                      className="w-28 h-28 object-cover rounded-lg shadow-sm"
                    />
                  ) : (
                    <div className="w-28 h-28 bg-gray-200 flex items-center justify-center rounded-lg text-xs text-gray-600">
                      Sem foto
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {produtoVisualizado.nome}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {produtoVisualizado.descricao || "-"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                  <div>
                    <strong className="text-gray-500">Categoria:</strong>
                    <div>{getCategoriaNome(produtoVisualizado.categoria_id)}</div>
                  </div>
                  <div>
                    <strong className="text-gray-500">Marca:</strong>
                    <div>{produtoVisualizado.marca_id}</div>
                  </div>
                  <div>
                    <strong className="text-gray-500">Código de Barras:</strong>
                    <div>{produtoVisualizado.codigo_barras || "-"}</div>
                  </div>
                  <div>
                    <strong className="text-gray-500">Registro ANVISA:</strong>
                    <div>{produtoVisualizado.registro_anvisa || "-"}</div>
                  </div>
                  <div>
                    <strong className="text-gray-500">Validade:</strong>
                    <div>{formatDate(produtoVisualizado.validade)}</div>
                  </div>
                  <div>
                    <strong className="text-gray-500">Quantidade:</strong>
                    <div className="font-medium">{calcularEstoqueTotal(produtoVisualizado)}</div>
                  </div>
                  <div>
                    <strong className="text-gray-500">Status:</strong>
                    <div>
                      {(() => {
                        const qnt = calcularEstoqueTotal(produtoVisualizado);
                        const status = obterStatusEstoque(qnt, produtoVisualizado.estoque_minimo);
                        return (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${status.cor} bg-opacity-10`}
                          >
                            {status.texto}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div>
                    <strong className="text-gray-500">Armazenamento:</strong>
                    <div>{produtoVisualizado.armazenamento || "-"}</div>
                  </div>
                </div>
                <div className="mt-1 text-sm">
                  <strong className="text-gray-500">Preço unitário: </strong>
                  <span className="font-medium">
                    {produtoVisualizado.preco_unitario != null
                      ? `R$ ${Number(produtoVisualizado.preco_unitario).toFixed(2)}`
                      : "-"}
                  </span>
                </div>
                <div className="mt-3 flex gap-2 justify-end">
                  <Button
                    className="bg-[#a9d6cd] hover:bg-[#8db0a9] text-white shadow-sm"
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      handleEditar(produtoVisualizado);
                    }}
                  >
                    Editar
                  </Button>
                </div>

              </div>
            ) : (
              <div className="text-gray-600 text-sm">Nenhum produto selecionado.</div>
            )}
          </DialogContent>
        </Dialog>


        {/* FILTROS E BUSCA */}
        <div className="border-b mb-4 flex items-center justify-between">
          <div className="flex space-x-4">
            <span className={getAbaClasses(ABAS.TODOS)} onClick={() => setAbaAtiva(ABAS.TODOS)}>Todos</span>
            <span className={getAbaClasses(ABAS.VENCIDOS)} onClick={() => setAbaAtiva(ABAS.VENCIDOS)}>Vencidos</span>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg className="w-4 h-4 text-body" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" /></svg>
            </div>
            <input type="search" id="search" placeholder="Buscar produto..." className="w-64 border rounded-2xl pl-9 pr-12 py-2 text-black focus:outline-none focus:ring focus:ring-gray-200 sm:pr-5 text-sm" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPaginaAtual(1); }} />
          </div>
        </div>

        <div className="mb-4 w-64">
          <Select value={categoriaSelecionada} onValueChange={(v) => { setCategoriaSelecionada(v); setPaginaAtual(1); }}>
            <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Todas</SelectItem>
              {categorias.map((cat) => <SelectItem key={cat.id} value={String(cat.id)}>{cat.nome || cat.categoria}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* TABELA */}
        <div className="relative overflow-x-auto rounded-lg">
          <Table className="w-full text-sm text-gray-700">
            <TableHeader className="bg-[#a9d6cd] rounded-xl">
              <TableRow>
                <TableHead className="py-3 px-6 text-left">Nome</TableHead>
                <TableHead className="py-3 px-6 text-left">Categoria</TableHead>
                <TableHead className="py-3 px-6 text-left">Código</TableHead>
                <TableHead className="py-3 px-6 text-left">Estoque</TableHead>
                <TableHead className="py-3 px-6 text-left">Status</TableHead>
                <TableHead className="py-3 px-6 text-left">Validade</TableHead>
                <TableHead className="py-3 px-6 text-left">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="py-6 text-center">Carregando produtos...</TableCell></TableRow>
              ) : produtosPaginados.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="py-6 text-center text-gray-900">Nenhum produto encontrado.</TableCell></TableRow>
              ) : (
                produtosPaginados.map((produto) => {
                  const qnt = calcularEstoqueTotal(produto);
                  const status = obterStatusEstoque(qnt, produto.estoque_minimo);
                  return (
                    <TableRow key={produto.id} className="border-b-1">
                      <TableCell className="px-4 py-4 font-medium">{produto.nome}</TableCell>
                      <TableCell className="px-4 py-4">{getCategoriaNome(produto.categoria_id)}</TableCell>
                      <TableCell className="px-4 py-4">{produto.codigo_barras || "-"}</TableCell>
                      <TableCell className="px-4 py-4">{qnt}</TableCell>
                      <TableCell className="px-4 py-4"><span className={`px-2 py-1 rounded-full text-sm font-semibold ${status.cor}`}>{status.texto}</span></TableCell>
                      <TableCell className="px-4 py-4">
                        {(() => {
                          const dias = diasParaVencer(produto.data_validade);
                          if (dias < 0) return <span className="text-red-600 font-semibold">Vencido</span>;
                          if (dias <= 30) return <span>{produto.validade}</span>;
                          return <span className="text-green-600">{produto.validade}</span>;
                        })()}
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => handleEditar(produto)} className="rounded-full p-2 hover:bg-[#4b9c861f]" title="Editar">
                            <svg className="w-5 h-5 text-[#659b8d]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.779 17.779 4.36 19.918 6.5 13.5m4.279 4.279 8.364-8.643a3.027 3.027 0 0 0-2.14-5.165 3.03 3.03 0 0 0-2.14.886L6.5 13.5m4.279 4.279L6.499 13.5m2.14 2.14 6.213-6.504M12.75 7.04 17 11.28" /></svg>
                          </button>
                          <button onClick={() => handleVisualizar(produto)} className="rounded-full p-2 hover:bg-[#4b9c861f]" title="Visualizar">
                            <svg className="w-5 h-5 text-[#8dc9b9]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth="2" d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z" /><path strokeWidth="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
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