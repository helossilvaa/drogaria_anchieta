'use client';
import { useEffect, useState } from "react";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const API_URL = 'http://localhost:8080/produtos';
const API_CATEGORIAS = "http://localhost:8080/categorias";
const API_LOTESMATRIZ = "http://localhost:8080/lotesmatriz";
const API_ESTOQUEMATRIZ = "http://localhost:8080/estoquematriz";
const API_ESTOQUEFRANQUIA = "http://localhost:8080/estoquefranquia";

const ABAS = {
  TODOS: 'todos',
  ESTOQUE: 'estoque',
  VENCIDOS: 'vencidos',
};

export default function Produtos() {
  // dados
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [medidas, setMedidas] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [tarjas, setTarjas] = useState([]);
  const [estoqueMatriz, setEstoqueMatriz] = useState([]); // === NOVO ===
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('0');
  const [abaAtiva, setAbaAtiva] = useState(ABAS.TODOS);
  const [isLoading, setIsLoading] = useState(true);
  const [mensagemFeedback, setMensagemFeedback] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 8;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [produtoVisualizado, setProdutoVisualizado] = useState(null);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [novoProduto, setNovoProduto] = useState({
    registro_anvisa: "",
    nome: "",
    medida_id: "",
    tarja_id: "",
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

  // date: backend returns ISO-ish "YYYY-MM-DD" (you said A)
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


  // helpers para nomes (usam as listas carregadas)
  const getCategoriaNome = (categoriaId) => {
    if (categoriaId == null || categoriaId === "") return "—";
    const id = Number(categoriaId);
    const c = categorias.find(cat => Number(cat.id) === id);
    return c ? (c.nome || c.categoria) : "—";
  };

  const getEstoqueStatus = (produto) => {
    const q = produto?.quantidade;
    if (q == null) return "Desconhecido";
    if (isProdutoVencido(produto)) return "Vencido";
    if (q <= 0) return "Fora de estoque";
    if (q <= 5) return "Baixo estoque";
    return "Em estoque";
  };

  // fetch listas auxiliares

  const fetchLotes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_LOTESMATRIZ, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Erro ao carregar lotes");

      const data = await response.json();
      setLotes(data);
    } catch (err) {
      console.error("Erro ao carregar lotes:", err);
    }
  };

  const fetchEstoqueMatriz = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_ESTOQUEMATRIZ, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao carregar estoque matriz");
      const data = await res.json();
      setEstoqueMatriz(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao buscar estoque matriz:", err);
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
          (Array.isArray(data) ? data : []).map(c => [String(c.id), { ...c, nome: c.nome || c.categoria }])
        ).values()
      );
      setCategorias(unique);
    } catch (err) {
      console.error("Erro ao buscar categorias:", err);
    }
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

  // carregar tudo quando autenticado
  useEffect(() => {
    if (isAuthenticated) {
      fetchCategorias();
      fetchLotes();
      fetchEstoqueMatriz();
      fetchProdutos();
    }
  }, [isAuthenticated]);

  const produtosFiltrados = produtos.filter((produto) => {
    const produtoCategoriaId = Number(produto?.categoria_id ?? produto?.categoria ?? 0);

    // FILTRO POR CATEGORIA
    if (
      categoriaSelecionada !== "0" &&
      categoriaSelecionada !== "" &&
      produtoCategoriaId !== Number(categoriaSelecionada)
    ) {
      return false;
    }

    // FILTRO POR ABA
    switch (abaAtiva) {
      case ABAS.VENCIDOS:
        if (!isProdutoVencido(produto)) return false;
        break;
      case ABAS.ESTOQUE:
        if ((produto.quantidade ?? 0) <= 0 || isProdutoVencido(produto)) return false;
        break;
      default:
        break;
    }

    // FILTRO POR BUSCA
    if (searchTerm.trim() !== "") {
      const termo = searchTerm.toLowerCase();
      const nome = String(produto.nome || "").toLowerCase();
      const descricao = String(produto.descricao || "").toLowerCase();
      const anvisa = String(produto.registro_anvisa || "").toLowerCase();
      const barras = String(produto.codigo_barras || "").toLowerCase();


      if (
        !nome.includes(termo) &&
        !descricao.includes(termo) &&
        !anvisa.includes(termo) &&
        !barras.includes(termo)
      ) {
        return false;
      }
    }

    return true;
  });


  const totalPaginas = Math.max(1, Math.ceil(produtosFiltrados.length / itensPorPagina));
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const produtosPaginados = produtosFiltrados.slice(inicio, inicio + itensPorPagina);

  const handlePaginaChange = (novaPagina) => {
    if (novaPagina > 0 && novaPagina <= totalPaginas) setPaginaAtual(novaPagina);
  };

  // normaliza objeto recebendo strings/objects -> form compatível para enviar ao backend (apenas *_id)
  const normalizarProduto = (p) => ({
    id: p.id ?? null,
    nome: p.nome || "",
    registro_anvisa: p.registro_anvisa || "",
    foto: p.foto || null,
    medida_id: p.medida_id ? Number(p.medida_id) : (p.medida?.id ? Number(p.medida.id) : null),
    tarja_id: p.tarja_id ? Number(p.tarja_id) : (p.tarja?.id ? Number(p.tarja.id) : null),
    categoria_id: p.categoria_id ? Number(p.categoria_id) : (p.categoria?.id ? Number(p.categoria.id) : null),
    marca_id: p.marca_id ? Number(p.marca_id) : (p.marca?.id ? Number(p.marca.id) : null),
    codigo_barras: p.codigo_barras || "",
    descricao: p.descricao || "",
    preco_unitario: (p.preco_unitario !== "" && p.preco_unitario != null) ? Number(p.preco_unitario) : null,
    validade: p.validade || null,
    fornecedor_id: p.fornecedor_id ? Number(p.fornecedor_id) : (p.fornecedor?.id ? Number(p.fornecedor.id) : null),
    lote_id: p.lote_id ? Number(p.lote_id) : (p.lote?.id ? Number(p.lote.id) : null),
    armazenamento: p.armazenamento || "",
  });

  // criar produto (envia apenas *_id)
  const handleCriarProduto = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMensagemFeedback({ type: 'error', text: 'Usuário não autenticado.' });
      setTimeout(() => setMensagemFeedback(null), 2500);
      return;
    }

    if (!novoProduto.nome || String(novoProduto.nome).trim() === "") {
      setMensagemFeedback({ type: 'error', text: "O campo 'Nome' é obrigatório." });
      setTimeout(() => setMensagemFeedback(null), 2500);
      return;
    }

    if (!novoProduto.categoria_id) {
      setMensagemFeedback({ type: 'error', text: "Selecione uma categoria." });
      setTimeout(() => setMensagemFeedback(null), 2500);
      return;
    }

    const payloadObj = normalizarProduto(novoProduto);

    const finalPayload = {
      registro_anvisa: payloadObj.registro_anvisa || null,
      nome: payloadObj.nome,
      foto: payloadObj.foto,
      medida_id: payloadObj.medida_id ?? null,
      tarja_id: payloadObj.tarja_id ?? null,
      categoria_id: payloadObj.categoria_id ?? null,
      marca_id: payloadObj.marca_id ?? null,
      codigo_barras: payloadObj.codigo_barras || null,
      descricao: payloadObj.descricao || null,
      preco_unitario: payloadObj.preco_unitario ?? null,
      validade: payloadObj.validade || null,
      fornecedor_id: payloadObj.fornecedor_id ?? null,
      lote_id: payloadObj.lote_id ?? null,
      armazenamento: payloadObj.armazenamento || null,
    };

    try {
      console.log("Criar payload:", finalPayload);
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(finalPayload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.mensagem || data.message || 'Erro ao criar produto');

      setMensagemFeedback({ type: 'success', text: 'Produto criado com sucesso!' });
      setTimeout(() => setMensagemFeedback(null), 4000);

      setIsDialogOpen(false);

      setNovoProduto({
        registro_anvisa: "",
        nome: "",
        medida_id: "",
        tarja_id: "",
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
      console.error('Erro ao criar produto:', err, 'payload:', finalPayload);
      setMensagemFeedback({ type: 'error', text: err.message || 'Erro ao criar produto' });
      setTimeout(() => setMensagemFeedback(null), 4000);
    }
  };

  // === ALTERAÇÃO: separar seleção de lote para NOVO e EDIT ===
  const handleSelectLoteNovo = (id) => {
    if (!id || Number(id) === 0) {
      setNovoProduto({ ...novoProduto, lote_id: "", validade: "", quantidade: "" });
      return;
    }
    const lote = lotes.find((l) => Number(l.id) === Number(id));
    if (!lote) return;
    setNovoProduto({
      ...novoProduto,
      lote_id: lote.id,
      validade: lote.data_validade,
      quantidade: lote.quantidade ?? novoProduto.quantidade
    });
  };

  const handleSelectLoteEdit = (id) => {
    if (!produtoEditando) return;
    if (!id || Number(id) === 0) {
      setProdutoEditando({ ...produtoEditando, lote_id: "", validade: "" });
      return;
    }
    const lote = lotes.find((l) => Number(l.id) === Number(id));
    if (!lote) return;
    setProdutoEditando({
      ...produtoEditando,
      lote_id: lote.id,
      validade: lote.data_validade
    });
  };
  // === FIM ALTERAÇÃO ===

  const handleAtualizarProduto = async () => {
    if (!produtoEditando) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setMensagemFeedback({ type: 'error', text: 'Usuário não autenticado.' });
      setTimeout(() => setMensagemFeedback(null), 4000);
      return;
    }

    const produtoCorrigido = normalizarProduto(produtoEditando);

    const finalPayload = {
      registro_anvisa: produtoCorrigido.registro_anvisa || null,
      nome: produtoCorrigido.nome,
      foto: produtoCorrigido.foto,
      medida_id: produtoCorrigido.medida_id ?? null,
      tarja_id: produtoCorrigido.tarja_id ?? null,
      categoria_id: produtoCorrigido.categoria_id ?? null,
      marca_id: produtoCorrigido.marca_id ?? null,
      codigo_barras: produtoCorrigido.codigo_barras || null,
      descricao: produtoCorrigido.descricao || null,
      preco_unitario: produtoCorrigido.preco_unitario ?? null,
      validade: produtoCorrigido.validade || null,
      fornecedor_id: produtoCorrigido.fornecedor_id ?? null,
      lote_id: produtoCorrigido.lote_id ?? null,
      armazenamento: produtoCorrigido.armazenamento || null,
    };

    try {
      console.log("Atualizar payload:", finalPayload);

      const res = await fetch(`${API_URL}/${produtoEditando.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(finalPayload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.mensagem || data.message || "Erro ao atualizar produto");
      setMensagemFeedback({ type: "success", text: "Produto atualizado com sucesso!" });
      setTimeout(() => setMensagemFeedback(null), 4000);

      setIsEditDialogOpen(false);
      setProdutoEditando(null);
      await fetchProdutos();
      await fetchEstoqueMatriz(); // atualiza lista de lotes/estoque
    } catch (error) {
      console.error("Erro ao atualizar:", error);

      setMensagemFeedback({ type: 'error', text: error.message || 'Erro ao atualizar produto' });
      setTimeout(() => setMensagemFeedback(null), 2500);
    }
  };

  const handleExcluirProduto = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMensagemFeedback({ type: 'error', text: 'Usuário não autenticado.' });
      setTimeout(() => setMensagemFeedback(null), 2500);
      return;
    }

    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.mensagem || data.message || 'Erro ao excluir produto');
      }

      setMensagemFeedback({ type: 'success', text: 'Produto excluído com sucesso!' });
      setTimeout(() => setMensagemFeedback(null), 4000);

      await fetchProdutos();

    } catch (err) {
      console.error('Erro ao excluir:', err);

      setMensagemFeedback({ type: 'error', text: err.message || 'Erro ao excluir produto' });
      setTimeout(() => setMensagemFeedback(null), 2500);
    }
  };

  const handleEditar = (produto) => {
    setProdutoEditando({
      ...produto,
      categoria_id: produto?.categoria_id ?? produto?.categoria ?? '',
      marca_id: produto?.marca_id ?? produto?.marca ?? '',
      medida_id: produto?.medida_id ?? produto?.medida ?? '',
      fornecedor_id: produto?.fornecedor_id ?? produto?.fornecedor ?? '',
      lote_id: produto?.lote_id ?? produto?.lote ?? '',
      tarja_id: produto?.tarja_id ?? produto?.tarja ?? '',
    });
    // buscar estoque por produto para popular aba Lotes
    fetchEstoqueMatriz(); // === NOVO ===
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
      <div className="p-2">
        <h2 className=" text-[#d1d0d0] text-4xl font-bold mb-4">Gerenciar Produtos</h2>

        {/* FEEDBACK POP-UP CENTRAL */}
        {mensagemFeedback && (
          <div
            className={`fixed -z-50 px-6 py-4 rounded-xl shadow-xl text-lg font-medium animate-pop
      ${mensagemFeedback.type === "success" ? "bg-green-100 text-[#5ba794] border border-[#4f9382]" : "bg-[#d7aeb7] text-[#9c5d6d] border border-[#c89ba5]"}`}>
            {mensagemFeedback.text}
          </div>
        )}


        {/* Botão Criar Produto */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#89ccb5] text-white hover:bg-[#3e8473] hover:border-[#91c9bb] mb-4 mt-7 ">
              Criar Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto p-7 text-justify">
            <DialogHeader>
              <DialogTitle className="font-bold text-2xl  text-[#b8e5d7]">Novo Produto</DialogTitle></DialogHeader>
            <div className="grid gap-2 mt-2">
              <Input placeholder="Nome" value={novoProduto.nome} onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })} />
              <Input placeholder="Registro ANVISA" value={novoProduto.registro_anvisa} onChange={(e) => setNovoProduto({ ...novoProduto, registro_anvisa: e.target.value })} />
              <Input placeholder="Código de Barras" value={novoProduto.codigo_barras} onChange={(e) => setNovoProduto({ ...novoProduto, codigo_barras: e.target.value })} />
              <Input placeholder="Descrição" value={novoProduto.descricao} onChange={(e) => setNovoProduto({ ...novoProduto, descricao: e.target.value })} />
              <Input type="number" placeholder="Preço Unitário" value={novoProduto.preco_unitario} onChange={(e) => setNovoProduto({ ...novoProduto, preco_unitario: e.target.value })} />
              <Input type="date" placeholder="Validade" value={novoProduto.validade} onChange={(e) => setNovoProduto({ ...novoProduto, validade: e.target.value })} />

              <Select value={String(novoProduto.tarja_id || "")} onValueChange={(v) => setNovoProduto({ ...novoProduto, tarja_id: v ? Number(v) : "" })}>
                <SelectTrigger><SelectValue placeholder="Tarja" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Selecione</SelectItem>
                  {tarjas.length > 0 ? tarjas.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.nome || t.descricao || t.id}</SelectItem>)
                    : (
                      <>
                        <SelectItem value="1">Sem Tarja</SelectItem>
                        <SelectItem value="2">Vermelha</SelectItem>
                        <SelectItem value="3">Amarela</SelectItem>
                        <SelectItem value="4">Preta</SelectItem>
                      </>
                    )}
                </SelectContent>
              </Select>

              <Select value={String(novoProduto.categoria_id || "")} onValueChange={(v) => setNovoProduto({ ...novoProduto, categoria_id: v ? Number(v) : "" })}>
                <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Selecione</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.nome || cat.categoria}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input placeholder="Medida ID" value={novoProduto.medida_id} onChange={(e) => setNovoProduto({ ...novoProduto, medida_id: e.target.value })} />
              <Input placeholder="Marca ID" value={novoProduto.marca_id} onChange={(e) => setNovoProduto({ ...novoProduto, marca_id: e.target.value })} />
              <Input placeholder="Fornecedor ID" value={novoProduto.fornecedor_id} onChange={(e) => setNovoProduto({ ...novoProduto, fornecedor_id: e.target.value })} />
              <Select value={String(novoProduto.lote_id || "")} onValueChange={handleSelectLoteNovo} >
                <SelectTrigger><SelectValue placeholder="Selecione o lote" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sem lote</SelectItem>
                  {lotes.map((lote) => (
                    <SelectItem key={lote.id} value={String(lote.id)}>
                      Lote {lote.numero_lote} — Validade {lote.data_validade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          <DialogContent className="max-h-[85vh] overflow-y-auto p-7 text-justify">
            <DialogHeader><DialogTitle className="font-bold text-2xl  text-[#b8e5d7]">Editar Produto</DialogTitle></DialogHeader>
            {produtoEditando && (
              <div className="grid gap-3 mt-2">
                <Input placeholder="Nome" value={produtoEditando.nome} onChange={(e) => setProdutoEditando({ ...produtoEditando, nome: e.target.value })} />
                <Input placeholder="Registro ANVISA" value={produtoEditando.registro_anvisa || ""} onChange={(e) => setProdutoEditando({ ...produtoEditando, registro_anvisa: e.target.value })} />
                <Input placeholder="Código de Barras" value={produtoEditando.codigo_barras || ""} onChange={(e) => setProdutoEditando({ ...produtoEditando, codigo_barras: e.target.value })} />
                <Input type="number" placeholder="Preço Unitário" value={produtoEditando.preco_unitario ?? ""} onChange={(e) => setProdutoEditando({ ...produtoEditando, preco_unitario: parseFloat(e.target.value) })} />
                <Input type="date" value={produtoEditando.validade ? produtoEditando.validade.split("T")[0] : ""} onChange={(e) => setProdutoEditando({ ...produtoEditando, validade: e.target.value })} />
                <Input placeholder="Descrição" value={produtoEditando.descricao || ""} onChange={(e) => setProdutoEditando({ ...produtoEditando, descricao: e.target.value })} />

                <Select value={String(produtoEditando.tarja_id || "")} onValueChange={(v) => setProdutoEditando({ ...produtoEditando, tarja_id: v ? Number(v) : "" })}>
                  <SelectTrigger><SelectValue placeholder="Tarja" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Selecione</SelectItem>
                    {tarjas.length > 0 ? tarjas.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.nome || t.descricao || t.id}</SelectItem>)
                      : (
                        <>
                          <SelectItem value="1">Sem Tarja</SelectItem>
                          <SelectItem value="2">Vermelha</SelectItem>
                          <SelectItem value="3">Amarela</SelectItem>
                          <SelectItem value="4">Preta</SelectItem>
                        </>
                      )}
                  </SelectContent>
                </Select>

                <Select value={String(produtoEditando.categoria_id || "")} onValueChange={(v) => setProdutoEditando({ ...produtoEditando, categoria_id: v ? Number(v) : "" })}>
                  <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Selecione</SelectItem>
                    {categorias.map((cat) =>
                      <SelectItem key={cat.id} value={String(cat.id)}>{cat.nome || cat.categoria}</SelectItem>
                    )}
                  </SelectContent>
                </Select>

                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Medida ID" value={produtoEditando.medida_id || ""} onChange={(e) => setProdutoEditando({ ...produtoEditando, medida_id: Number(e.target.value) })} />
                  <Input placeholder="Marca ID" value={produtoEditando.marca_id || ""} onChange={(e) => setProdutoEditando({ ...produtoEditando, marca_id: Number(e.target.value) })} />
                </div>

                <Input placeholder="Fornecedor ID" value={produtoEditando.fornecedor_id || ""} onChange={(e) => setProdutoEditando({ ...produtoEditando, fornecedor_id: Number(e.target.value) })} />
                <Select value={String(produtoEditando.lote_id || "")} onValueChange={handleSelectLoteEdit}>
                  <SelectTrigger><SelectValue placeholder="Selecione o lote" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sem lote</SelectItem>
                    {lotes.map((lote) => (
                      <SelectItem key={lote.id} value={String(lote.id)}>
                        Lote {lote.numero_lote} — Validade {formatDate(lote.data_validade)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input placeholder="Armazenamento" value={produtoEditando.armazenamento || ""} onChange={(e) => setProdutoEditando({ ...produtoEditando, armazenamento: e.target.value })} />
              </div>
            )}
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
              <Button className="bg-[#4b9c86] text-white hover:bg-[#3e8473]" onClick={handleAtualizarProduto}>Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DIALOG VISUALIZARR */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Visualizar Produto</DialogTitle></DialogHeader>

            {produtoVisualizado ? (
              <div className="grid gap-3 mt-2">
                <div className="flex items-start gap-4">
                  {/* imagem se existir */}
                  {produtoVisualizado.foto ? (
                    <img src={`http://localhost:8080/uploads/produtos/${produtoVisualizado.foto}`} alt={produtoVisualizado.nome} className="w-28 h-28 object-cover rounded" />
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
                  <div><strong>Marca:</strong><div>{produtoVisualizado.marca_id}</div></div>
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

        <div className="border-b mb-4 flex items-center justify-between">
          {/* ABAS */}
          <div className="flex space-x-4">
            <span className={getAbaClasses(ABAS.TODOS)} onClick={() => setAbaAtiva(ABAS.TODOS)}>Todos</span>
            <span className={getAbaClasses(ABAS.VENCIDOS)} onClick={() => setAbaAtiva(ABAS.VENCIDOS)}>Vencidos</span>
          </div>

          {/* INPUT DE BUSCA */}
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg className="w-4 h-4 text-body" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" /></svg>
            </div>
            <input type="search" id="search" placeholder="Buscar produto..." className="w-64 border rounded-2xl pl-9 pr-15 py-2 text-black focus:outline-none focus:ring focus:ring-gray-200 sm:pr-5 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />          </div>
        </div>


        {/* FILTRO CATEGORIA */}
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
          <Table className="w-full text-sm text-gray-500">
            <TableHeader className="relative overflow-x-auto bg-[#a9d6cd] rounded-xl">
              <TableRow>
                <TableHead className="py-3 px-8">Nome</TableHead>
                <TableHead className="py-3 px-8">Categoria</TableHead>
                <TableHead className="py-3 px-8">Marca</TableHead>
                <TableHead className="py-3 px-8">Código</TableHead>
                <TableHead className="py-3 px-8">Validade</TableHead>
                <TableHead className="py-3 px-8">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow className="border-b-1"><TableCell colSpan="6" className="py-4">Carregando produtos...</TableCell></TableRow>
              ) : produtosPaginados.length === 0 ? (
                <TableRow><TableCell colSpan="6" className="py-4 text-gray-900">Nenhum produto encontrado.</TableCell></TableRow>
              ) : (
                produtosPaginados.map((produto) => (
                  <TableRow key={produto.id} className="border-b-1 text-center">
                    <TableCell className="px-4 py-6 font-normal text-gray-900">{produto.nome}</TableCell>
                    <TableCell className="px-10 py-6">{getCategoriaNome(produto.categoria_id)}</TableCell>
                    <TableCell className="px-10 py-6">{produto.marca_id}</TableCell>
                    <TableCell className="px-10 py-6">{produto.codigo_barras || "-"}</TableCell>
                    <TableCell className="px-10 py-6">{produto.validade ? (produto.validade) : "N/A"}</TableCell>
                    <TableCell className="flex py-4 px-6 justify-center gap-2">

                      <button onClick={() => handleEditar(produto)} className="rounded-full p-2 hover:bg-[#4b9c861f]" > <svg className="w-6 h-6 text-[#659b8d] dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"> <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.779 17.779 4.36 19.918 6.5 13.5m4.279 4.279 8.364-8.643a3.027 3.027 0 0 0-2.14-5.165 3.03 3.03 0 0 0-2.14.886L6.5 13.5m4.279 4.279L6.499 13.5m2.14 2.14 6.213-6.504M12.75 7.04 17 11.28" /> </svg> </button>
                      <button onClick={() => handleVisualizar(produto)} className="rounded-full p-2 hover:bg-[#4b9c861f]" >
                        <svg className="w-[20px] h-[20px] text-[#8dc9b9] dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                          <path stroke="currentColor" strokeWidth="2" d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z" />
                          <path stroke="currentColor" strokeWidth="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>

                      </button>
                    </TableCell>
                  </TableRow>
                ))
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
    </Layout >
  );
}
