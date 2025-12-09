"use client";
import Layout from "@/components/layout/layout";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Minus, Plus, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function NovaVendaPage() {
  const [produtos, setProdutos] = useState([]);
  const [codigoBarras, setCodigoBarras] = useState("");
  const [nomeProduto, setNomeProduto] = useState("");
  const [desconto, setDesconto] = useState(0);
  const [codigoDesconto, setCodigoDesconto] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [formaPagamento, setFormaPagamento] = useState("");
  const [alerta, setAlerta] = useState(null);
  const [mostrarNota, setMostrarNota] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [mensagemFeedback, setMensagemFeedback] = useState({ type: "", text: "" });
  const [listaVenda, setListaVenda] = useState([]);
  const [filiados, setFiliados] = useState([])
  const [open, setOpen] = useState(false);
  const [pagamentoFeito, setPagamentoFeito] = useState(false);
  const [cliente_id, setClienteId] = useState("");
  const [unidade_id, setUnidadeId] = useState("");
  const [tipo_pagamento_id, setTipoPagamentoId] = useState("");
  const [data, setData] = useState(
    new Date().toISOString().slice(0, 19).replace("T", " ")
  );
  const [cpfCliente, setCpfCliente] = useState("");
  const [cliente, setCliente] = useState(null);
  const [erroCliente, setErroCliente] = useState("");
  const [loadingCliente, setLoadingCliente] = useState(false);
  const [itensCarrinho, setItensCarrinho] = useState([])
  const [carrinho, setCarrinho] = useState([]);
  const [desconto_id, setDescontoId] = useState("");
  const [unidadeTipo, setUnidadeTipo] = useState("");
  const [filiais, setFiliais] = useState([]);

  
  
  
    // Buscar filiais do backend
    useEffect(() => {
      if (unidadeTipo === "filial") {
        fetch("/api/unidades?tipo=franquia") // seu endpoint para pegar filiais
          .then((res) => res.json())
          .then((data) => setFiliais(data))
          .catch((err) => console.error(err));
      } else {
        setFiliais([]); // limpa as filiais quando não for filial
      }
    }, [unidadeTipo]);


  // Buscar filiais do backend
  useEffect(() => {
    if (unidadeTipo === "filial") {
      fetch("/api/unidades?tipo=franquia")
        .then((res) => res.json())
        .then((data) => setFiliais(data))
        .catch((err) => console.error(err));
    } else {
      setFiliais([]); // limpa as filiais quando não for filial
    }
  }, [unidadeTipo]);

  useEffect(() => {
    const carrinhoSalvo = localStorage.getItem("carrinho");
    if (carrinhoSalvo) {
      setCarrinho(JSON.parse(carrinhoSalvo));
    }
  }, []);



  const removerProduto = (id) => {
    setListaVenda(prev => prev.filter(p => p.id !== id));
    toast.success("Produto removido da venda!");
  };

  const itensPorPagina = 5;
  const totalPaginas = Math.max(1, Math.ceil(listaVenda.length / itensPorPagina));
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const produtosExibidos = listaVenda.slice(inicio, fim);

  const API_PRODUTOS = "http://localhost:8080/produtos";
  const API_URL = "http://localhost:8080/api/filiados";

  const resetCampos = () => {
    setClienteId("");
    setCliente(null);
    setCpfCliente("");
    setErroCliente("");

    setItensCarrinho([]);
    setCarrinho([]);
    setListaVenda([]);
    setNomeProduto("");
    setCodigoBarras("");

    setUnidadeId("");
    setTipoPagamentoId("");
    setPagamentoFeito(false);
    setFormaPagamento("");
    setDesconto(0);
    setDescontoId("");
    setCodigoDesconto("");

    setMensagemFeedback({ type: "", text: "" });
    setAlerta(null);
    setPaginaAtual(1);
  };

  const tiposPagamento = {
    1: "PIX",
    2: "CRÉDITO",
    3: "DÉBITO",
  };

  // Função para fechar o dialog e limpar
  const fecharDialog = () => {
    resetCampos();
    setMostrarNota(false);
  };

  async function buscarCliente() {
    setErroCliente("");
    setCliente(null);
    setLoadingCliente(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:8080/api/filiados/cpf/${cpfCliente}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        setErroCliente("Usuário não encontrado.");
        toast.error("Usuário não encontrado.");
        return;
      }

      const data = await res.json();
      setCliente(data);
      setClienteId(data.id);

    } catch (error) {
      setErroCliente("Erro ao buscar cliente.");
      toast.error("Erro ao buscar cliente.");
    } finally {
      setLoadingCliente(false);
    }
  }


  // Salvar venda no banco de dados
  async function salvarVenda() {
    try {
      setOpen(true);
      setIsLoading(true);
      setPagamentoFeito(false);

      const usuarioLogado = JSON.parse(localStorage.getItem("usuario"));
      const token = localStorage.getItem("token");

      if (!usuarioLogado?.id) {
        toast.error("Usuário não encontrado!");
        setOpen(false);
        return;
      }

      if (!cliente_id || !unidade_id || !tipo_pagamento_id) {
        toast.error("Preencha todos os dados!");
        return;
      }

      const itensCarrinho = listaVenda.map(item => ({
        produto_id: item.id,
        quantidade: item.quantidade,
        valor: item.preco
      }));

      const venda = {
        cliente_id: Number(cliente_id),
        usuario_id: usuarioLogado.id,
        unidade_id: Number(unidade_id),
        tipo_pagamento_id: Number(tipo_pagamento_id),
        desconto_id: desconto_id ? Number(desconto_id) : null,
        desconto_valor: Number(desconto),
        total: subtotalGeral - desconto,
        data,
        itens: itensCarrinho
      };

      const resposta = await fetch("http://localhost:8080/vendas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(venda),
      });

      if (!resposta.ok) {
        const erro = await resposta.text();
        console.error("Erro real da API:", erro);
        throw new Error("Erro ao salvar venda: " + erro);
      }

      const resultado = await resposta.json();
      console.log("Venda criada:", resultado);

      setIsLoading(false);
      setPagamentoFeito(true);

      // Recarrega produtos após fechar a venda
      try {
        await fetchProdutos();
        console.log("Produtos recarregados após venda");
      } catch (erroProd) {
        console.warn("Falha ao recarregar produtos:", erroProd);
      }

    } catch (err) {
      console.error(err);
      toast.error("Erro ao registrar venda.");
      setOpen(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        console.log("STATUS:", res.status);
        const texto = await res.text();
        console.log("RESPOSTA BRUTA:", texto);

        try {
          return JSON.parse(texto);
        } catch {
          console.log("Não é JSON!");
          return null;
        }
      })
      .then(data => {
        console.log("FILIADOS:", data);
        setFiliados(Array.isArray(data) ? data : data?.content || []);
      })
      .catch(err => console.error("Erro ao carregar filiados:", err));
  }, []);
  const fetchProdutos = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMensagemFeedback({
        type: "error",
        text: "Você não está logado. Faça login para continuar."
      });
      setIsLoading(false);
      return;
    }
    setUserToken(token);
    setIsLoading(true);

    // Produtos
    try {
      const res = await fetch(`${API_PRODUTOS}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error("Erro ao carregar a lista de produtos");
      }
      const data = await res.json();

      const produtosComQuantidade = data.map((p, i) => ({
        id: p.id ?? i,
        foto: p.foto ?? "",
        nome: p.nome ?? p.descricao ?? "Produto sem nome",
        preco: Number(p.preco ?? p.preco_unitario ?? 0),
        codigo_barras: p.codigo_barras ?? p.cod_barras ?? p.barcode ?? "",
        quantidade: 1,
      }));
      setProdutos(produtosComQuantidade);
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      toast.error(err.message || "Erro ao carregar produtos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  // alterar quantidade
  const alterarQuantidade = (id, delta) => {
    setListaVenda(prev =>
      prev.map(p => p.id === id ? { ...p, quantidade: Math.max(1, p.quantidade + delta) } : p)
    );
  };
  // Calcular o valor
  const calcularSubtotal = (preco, quantidade) => preco * quantidade;
  const subtotalGeral = listaVenda.reduce((acc, p) => acc + calcularSubtotal(p.preco, p.quantidade), 0);
  const total = subtotalGeral - Number(desconto);
  const mostrarAlerta = (mensagem, tipo = "info") => {
    setAlerta({ mensagem, tipo });
    setTimeout(() => setAlerta(null), 3000);
  };
  const paginaAnterior = () => paginaAtual > 1 && setPaginaAtual(paginaAtual - 1);
  const proximaPagina = () => paginaAtual < totalPaginas && setPaginaAtual(paginaAtual + 1);

  // Baixar nota fiscal
  const handleProsseguir = () => {
    setMostrarNota(true);
  };

  // Desconto
  const aplicarDesconto = async () => {
    let valorDesconto = 0;

    const codigoNormalizado = codigoDesconto.trim().toUpperCase();
    const cpfLimpo = codigoDesconto.replace(/\D/g, "");

    // DESCONTO POR CPF (FILIADO)
    if (cpfLimpo.length === 11) {
      if (subtotalGeral >= 100) {
        // limpa o cpf do banco e o cpf digitado para comparar corretamente
        const existe = filiados.find(f => {
          const cpfFiliado = (f.cpf || "").toString().replace(/\D/g, "");
          return cpfFiliado === cpfLimpo;
        });

        if (!existe) {
          toast.error("CPF não encontrado no sistema de filiados.");
          setDesconto(0);
          return;
        }

        valorDesconto = subtotalGeral * 0.2;
        setDescontoId(existe.id);
        toast.success("Desconto de 20% aplicado para filiado!");
      } else {
        toast.error("Compra deve ser maior que R$100 para aplicar desconto por CPF.");
        setDesconto(0);
        return;
      }
    }

    // DESCONTO POR CUPOM
    else if (codigoNormalizado.startsWith("CUPOM")) {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `http://localhost:8080/api/descontos?nome=${codigoDesconto}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error("Cupom inválido");

        const cupomData = await res.json();

        // 🔥 Correção: garantir que encontrou o cupom digitado
        const cupomCorreto = Array.isArray(cupomData)
          ? cupomData.find(c => c.nome === codigoNormalizado)
          : cupomData;

        if (!cupomCorreto) {
          toast.error("Cupom não encontrado.");
          setDesconto(0);
          return;
        }

        const descontoCupom = Number(cupomCorreto.desconto);

        valorDesconto = subtotalGeral * descontoCupom;
        setDescontoId(cupomCorreto.id); 

        toast.success(
          `Desconto de ${(descontoCupom * 100).toFixed(0)}% aplicado pelo cupom!`
        );

      } catch (err) {
        toast.error(err.message || "Cupom inválido.");
        setDesconto(0);
        return;
      }
    }

    // DESCONTO POR CONVÊNIO
    else {
      try {
        const token = localStorage.getItem("token");
        const convenioNome = codigoDesconto.trim();

        const res = await fetch(
          `http://localhost:8080/parcerias/buscar?parceiro=${convenioNome}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) {
          const erroApi = await res.json().catch(() => ({}));
          throw new Error(erroApi.message || "Convênio não encontrado.");
        }

        const convenioData = await res.json();
        const porcentagemNumerica = Number(convenioData.porcentagem);

        if (isNaN(porcentagemNumerica) || !convenioData) {
          throw new Error("Dados do convênio inválidos.");
        }

        valorDesconto = subtotalGeral * porcentagemNumerica;
        setDescontoId(convenioData.id);
        toast.success(`Desconto de ${(porcentagemNumerica * 100).toFixed(0)}% aplicado através do convênio!`);

      } catch (err) {
        console.error("ERRO CONVÊNIO:", err);
        toast.error(err.message || "Código ou Convênio inválido.");
        setDesconto(0);
        return;
      }
    }
    setDesconto(valorDesconto);
  };

  const imprimirNota = () => {
    window.print();
  };
  const [novoFiliado, setNovoFiliado] = useState({
    nome: "",
    cpf: "",
    data_nascimento: "",
    email: "",
    telefone: "",
    cep: "",
    cidade: "",
    estado: "",
    bairro: "",
    logradouro: "",
    numero: "",
    tipodesconto: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNovoFiliado((prev) => ({ ...prev, [name]: value }));
  };
  const buscarEndereco = async () => {
    const cepLimpo = novoFiliado.cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      if (data.erro) {
        mostrarAlerta("CEP não encontrado!", "erro");
        return;
      }
      setNovoFiliado((prev) => ({
        ...prev,
        cidade: data.localidade || "",
        estado: data.uf || "",
        bairro: data.bairro || "",
        logradouro: data.logradouro || "",
      }));
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagemFeedback({ type: "", text: "" });
    const userToken = localStorage.getItem("token");
    if (!userToken) {
      toast.error("Você precisa estar logado para cadastrar filiado.");
      return;
    }
    const cpfLimpo = novoFiliado.cpf.replace(/\D/g, "");
    const telefoneLimpo = novoFiliado.telefone.replace(/\D/g, "");
    const cepLimpo = novoFiliado.cep.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      toast.error("CPF deve conter exatamente 11 dígitos.");
      return;
    }
    if (telefoneLimpo.length < 8) {
      toast.error("Telefone deve conter pelo menos 8 dígitos.");
      return;
    }
    if (cepLimpo.length !== 8) {
      toast.error("CEP deve conter exatamente 8 dígitos.");
      return;
    }
    if (novoFiliado.estado.length !== 2) {
      toast.error("Estado deve ser uma sigla de 2 caracteres.");
      return;
    }
    const filiadoEnvio = {
      ...novoFiliado,
      cpf: cpfLimpo,
      telefone: telefoneLimpo,
      cep: cepLimpo,
      tipodesconto: Number(novoFiliado.tipodesconto),
    };
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(filiadoEnvio),
      });
      if (!res.ok) {
        let erroMsg = "Erro ao salvar usuário";
        try {
          const erro = await res.json();
          erroMsg = erro.message || JSON.stringify(erro) || erroMsg;
        } catch {
          const texto = await res.text();
          erroMsg = texto || erroMsg;
        }
        throw new Error(erroMsg);
      }
      toast.success("Filiado cadastrado com sucesso!");
      setNovoFiliado({
        nome: "",
        cpf: "",
        data_nascimento: "",
        email: "",
        telefone: "",
        cep: "",
        cidade: "",
        estado: "",
        bairro: "",
        logradouro: "",
        numero: "",
        tipodesconto: "",
      });
    } catch (erro) {
      console.error("Erro ao salvar filiado:", erro);
      toast.error(erro.message || "Erro ao salvar filiado.");
    }
  };
  const parseProduto = (raw) => {
    return {
      id: raw.id,
      nome: raw.nome || raw.descricao || "Produto sem nome",
      preco: Number(raw.preco || raw.preco_unitario || 0),
    };
  };

  const fetchTentativa = async (url) => {
    try {
      const r = await fetch(url);
      if (!r.ok) return null;
      const json = await r.json();
      return parseProduto(json);
    } catch (e) {
      return null;
    }
  };
  // Buscar produto
  const buscarProdutoPorNome = (nome) => {
    const termo = String(nome ?? nomeProduto ?? "").trim().toLowerCase();

    console.log("PRODUTOS DA API:", produtos);
    console.log("BUSCANDO POR:", termo);

    if (!termo) {
      toast.error("Digite um nome válido.");
      return;
    }

    // 🔍 Buscar por nome
    const produtoEncontrado = produtos.find(p =>
      p.nome.toLowerCase().includes(termo)
    );

    if (!produtoEncontrado) {
      toast.error("Produto não encontrado!");
      return;
    }

    const existeNoCarrinho = listaVenda.find(p => p.id === produtoEncontrado.id);

    if (existeNoCarrinho) {
      setListaVenda(prev =>
        prev.map(p =>
          p.id === produtoEncontrado.id
            ? { ...p, quantidade: p.quantidade + 1 }
            : p
        )
      );
    } else {
      setListaVenda(prev => [...prev, { ...produtoEncontrado, quantidade: 1 }]);
    }

    setNomeProduto("");
    toast.success("Produto adicionado à venda!");
  };

  // Buscas produto por codigo de barras
  const buscarProdutoPorCodigo = (codigo) => {
    const termo = String(codigo ?? nomeProduto ?? "").trim();

    console.log("PRODUTOS DA API:", produtos);
    console.log("BUSCANDO CÓDIGO:", termo);

    if (!termo) {
      toast.error("Digite um código válido.");
      return;
    }

    // Normalizar apenas números para comparação
    const normalizar = (valor) => String(valor ?? "").trim().replace(/\D/g, "");

    const termoNormalizado = normalizar(termo);

    // 🔍 Buscar por código de barras
    const produtoEncontrado = produtos.find(p =>
      normalizar(p.codigo_barras).includes(termoNormalizado)
    );

    if (!produtoEncontrado) {
      toast.error("Produto não encontrado!");
      return;
    }

    const existeNoCarrinho = listaVenda.find(p => p.id === produtoEncontrado.id);

    if (existeNoCarrinho) {
      setListaVenda(prev =>
        prev.map(p =>
          p.id === produtoEncontrado.id
            ? { ...p, quantidade: p.quantidade + 1 }
            : p
        )
      );
    } else {
      setListaVenda(prev => [...prev, { ...produtoEncontrado, quantidade: 1 }]);
    }

    setNomeProduto("");
    toast.success("Produto adicionado à venda!");
  };

  const handleFinalizar = async () => {
    setOpen(true);
    setIsLoading(true);
    setPagamentoFeito(false);

    // Simula o processamento do pagamento
    setTimeout(async () => {
      setIsLoading(false);
      setPagamentoFeito(true);
      try {
        const vendaCriada = await salvarVenda();
        console.log("Venda criada no backend:", vendaCriada);
        toast.success("Venda registrada com sucesso.");
      } catch (erro) {
        console.error("Erro ao registrar venda:", erro);
        toast.error("Erro ao salvar a venda.");
      }
    }, 5000);
  };

  console.log(produtosExibidos);

  return (
    <Layout>

      <div className="min-h-screen flex items-center justify-center py-10 relative">
        {alerta && (
          <div
            className={`fixed top-6 right-6 px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 text-white transition-all duration-500 ${alerta.tipo === "sucesso"
              ? "bg-green-500"
              : alerta.tipo === "erro"
                ? "bg-pink-500"
                : "bg-gray-600"
              }`}
          >
            {alerta.tipo === "sucesso" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium">{alerta.mensagem}</span>
          </div>
        )}
        {mensagemFeedback.text && (
          <div
            className={`fixed top-20 right-6 px-5 py-3 rounded-xl shadow-lg text-white ${mensagemFeedback.type === "error" ? "bg-pink-500" : "bg-green-500"
              }`}
          >
            {mensagemFeedback.text}
          </div>
        )}
        <div className="w-full max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-6">
          <div className="md:col-span-2">
            <div className="relative w-full max-w-lg">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite o nome ou código de barras do produto"
                  value={codigoBarras || nomeProduto}
                  onChange={(e) => {
                    const valor = e.target.value;
                    if (/^\d+$/.test(valor)) {
                      setCodigoBarras(valor);
                      setNomeProduto("");
                    } else {
                      setNomeProduto(valor);
                      setCodigoBarras("");
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (codigoBarras) {
                        buscarProdutoPorCodigo(codigoBarras);
                      } else if (nomeProduto) {
                        buscarProdutoPorNome(nomeProduto);
                      } else {
                        mostrarAlerta("Digite o nome ou código de barras.", "erro");
                      }
                    }
                  }}
                  className="bg-white border-pink-300 text-gray-800 placeholder:text-gray-500 rounded-full px-5 py-6 w-full"
                />
                <Button
                  onClick={() => {
                    if (codigoBarras) {
                      buscarProdutoPorCodigo(codigoBarras);
                    } else if (nomeProduto) {
                      buscarProdutoPorNome(nomeProduto);
                    } else {
                      mostrarAlerta("Digite o nome ou código de barras.", "erro");
                    }
                  }}
                  className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-6"
                >
                  Buscar
                </Button>
              </div>
              {nomeProduto && produtos.length > 0 && (
                <ul className="absolute z-50 mt-2 w-full bg-white border border-pink-200 rounded-xl shadow-md max-h-60 overflow-y-auto">
                  {produtos
                    .filter((p) =>
                      p.nome.toLowerCase().includes(nomeProduto.toLowerCase())
                    )
                    .slice(0, 8)
                    .map((p) => (
                      <li
                        key={p.id}
                        onClick={() => {
                          buscarProdutoPorNome(p.nome);
                          setNomeProduto("");
                        }}
                        className="px-4 py-2 hover:bg-pink-100 cursor-pointer text-gray-700"
                      >
                        {p.nome}
                      </li>
                    ))}
                </ul>
              )}
            </div>
            <Card className="mt-6">
              <CardContent className="p-4">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-pink-600 font-semibold">
                      <th>Foto</th>
                      <th>Produto</th>
                      <th>Preço</th>
                      <th className="text-center">Quantidade</th>
                      <th className="text-right">Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtosExibidos.map((produto) => (
                      <tr key={produto.id} className="border-t border-pink-100">
                        <td className="w-12 h-12 object-cover rounded"                        >
                          <img src={`http://localhost:8080/uploads/produtos/${produto.foto}`} />
                        </td>
                        <td className="py-3">{produto.nome}</td>
                        <td className="py-3">R$ {produto.preco.toFixed(2)}</td>
                        <td className="py-3 flex justify-center items-center gap-2 text-pink-500">
                          <button
                            onClick={() => alterarQuantidade(produto.id, -1)}
                            className="rounded-full bg-pink-50 p-1 border border-pink-200"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="font-medium text-gray-700">{produto.quantidade}</span>
                          <button
                            onClick={() => alterarQuantidade(produto.id, 1)}
                            className="rounded-full bg-pink-50 p-1 border border-pink-200"
                          >
                            <Plus size={14} />
                          </button>
                        </td>
                        <td className="py-3 text-right font-medium text-gray-700">
                          R$ {calcularSubtotal(produto.preco, produto.quantidade).toFixed(2)}
                        </td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => removerProduto(produto.id)}
                            className="rounded-full p-1 hover:bg-pink-500"
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
                              <path
                                fillRule="evenodd"
                                d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}

                  </tbody>
                </table>
                {totalPaginas > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-6">
                    <Button
                      onClick={paginaAnterior}
                      disabled={paginaAtual === 1}
                      className="rounded-full bg-pink-100 text-pink-700 hover:bg-pink-200 disabled:opacity-50"
                    >
                      Anterior
                    </Button>
                    <span className="text-gray-600">
                      Página {paginaAtual} de {totalPaginas}
                    </span>
                    <Button
                      onClick={proximaPagina}
                      disabled={paginaAtual === totalPaginas}
                      className="rounded-full bg-pink-100 text-pink-700 hover:bg-pink-200 disabled:opacity-50"
                    >
                      Próximo
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-pink-100">
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* IDENTIFICAÇÃO DO CLIENTE */}
                <div className="bg-white p-4 rounded-xl shadow border border-pink-200 space-y-3">
                  <h2 className="text-lg font-semibold text-pink-600">Identificação do Cliente</h2>

                  <div className="flex items-center gap-3">
                    <Input
                      placeholder="Digite o CPF"
                      value={cpfCliente}
                      onChange={(e) => setCpfCliente(e.target.value)}
                      className="rounded-full border-pink-300"
                    />

                    <Button
                      onClick={buscarCliente}
                      className="bg-pink-500 hover:bg-pink-600 text-white rounded-full"
                    >
                      {loadingCliente ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        "Buscar"
                      )}
                    </Button>
                  </div>

                  {cliente && (
                    <p className="text-green-600 font-medium">
                      Cliente encontrado:{" "}
                      <span className="font-semibold">{cliente.nome}</span>
                    </p>
                  )}

                  {erroCliente && (
                    <p className="text-red-600 font-medium">{erroCliente}</p>
                  )}
                </div>


                <div>
                  <p className="text-gray-500 mb-1">Subtotal</p>
                  <p className="font-medium text-gray-700">
                    R$ {subtotalGeral.toFixed(2)}
                  </p>
                  <Separator className="my-1" />
                </div>

                {/* DESCONTO */}
                <div>
                  <p className="text-gray-500 mb-1">Desconto</p>

                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="CPF, Cupom ou Convênio"
                      value={codigoDesconto}
                      onChange={(e) => setCodigoDesconto(e.target.value)}
                      className="border-pink-200 rounded-full w-full text-center"
                    />

                    <Button
                      onClick={aplicarDesconto}
                      className="bg-pink-500 hover:bg-ppink-600 text-white rounded-full px-4"
                    >
                      Adicionar
                    </Button>
                  </div>

                  <Separator className="my-1" />
                </div>

                <div>
                  <p className="text-pink-600 font-semibold text-lg mb-1">Total</p>
                  <p className="text-gray-800 font-bold text-xl">
                    R$ {total.toFixed(2)}
                  </p>
                  <Separator className="my-1" />
                </div>

                <div className="flex flex-col md:flex-row gap-4 mt-4">

                  {/* Bloco completo: Unidade + Pagamento */}
                  <div className="flex flex-col md:flex-row gap-6 mt-4">
                    {/* Seleção de Unidade */}
                    <div className="space-y-2 w-full">
                      <label className="text-gray-600 font-medium text-sm">Unidade</label>

                      <Select
                        value={unidade_id}
                        onValueChange={(value) => setUnidadeId(value)}
                      >
                        <SelectTrigger
                          className={`w-full rounded-full border px-4 py-2 transition
        ${unidade_id
                              ? "  text-pink-700"
                              : "  text-pink-600"
                            }`}
                        >
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Unidades</SelectLabel>
                            <SelectItem value="1">Matriz</SelectItem>
                            <SelectItem value="2">Filial</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Forma de Pagamento */}
                    <div className="space-y-2 w-full">
                      <label className="text-gray-600 font-medium text-sm">Pagamento</label>

                      <Select
                        value={tipo_pagamento_id}
                        onValueChange={(value) => setTipoPagamentoId(value)}
                      >
                        <SelectTrigger
                          className={`w-full rounded-full border px-4 py-2 transition
        ${tipo_pagamento_id
                              ? " text-pink-700"
                              : " text-pink-600"
                            }`}
                        >
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Tipo de Pagamento</SelectLabel>

                            <SelectItem value="1">
                              <span className="flex items-center gap-2">
                                <span
                                  className={`h-2 w-2 rounded-full ${tipo_pagamento_id === "1" ? "bg-pink-500" : "bg-pink-300"
                                    }`} />
                                PIX
                              </span>
                            </SelectItem>

                            <SelectItem value="2">
                              <span className="flex items-center gap-2">
                                <span
                                  className={`h-2 w-2 rounded-full ${tipo_pagamento_id === "2" ? "bg-pink-500" : "bg-pink-300"
                                    }`} />
                                Crédito
                              </span>
                            </SelectItem>

                            <SelectItem value="3">
                              <span className="flex items-center gap-2">
                                <span
                                  className={`h-2 w-2 rounded-full ${tipo_pagamento_id === "3" ? "bg-pink-500" : "bg-pink-300"
                                    }`} />
                                Débito
                              </span>
                            </SelectItem>

                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                  </div>

                </div>



              </div>

              {/* Cadastrar novo filiado */}
              <div className="mt-6 text-center">
                <Sheet>
                  <SheetTrigger asChild>
                    <button className="text-pink-600 hover:text-pink-700 font-medium underline underline-offset-4 transition-all duration-200">
                      Cadastrar-se como filiado
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-[420px] sm:w-[480px] bg-gradient-to-br from-pink-50 to-white shadow-2xl border-l-4 border-pink-300"
                  >
                    <div className="px-6 py-4">
                      <SheetHeader className="space-y-1 text-center mt-2">
                        <SheetTitle className="text-pink-600 text-2xl font-bold flex justify-center items-center gap-2">
                          <CheckCircle2 size={24} className="text-pink-500" />
                          Cadastro de Filiado
                        </SheetTitle>
                        <p className="text-gray-500 text-sm">
                          Faça parte do nosso programa de fidelidade e receba descontos exclusivos
                        </p>
                      </SheetHeader>
                      <form onSubmit={handleSubmit} className="space-y-2">
                        <Input
                          name="nome"
                          placeholder="Nome completo"
                          value={novoFiliado.nome}
                          onChange={handleChange}
                        />
                        <Input
                          name="data_nascimento"
                          type="date"
                          value={novoFiliado.data_nascimento}
                          onChange={handleChange}
                        />
                        <Input
                          name="cpf"
                          placeholder="CPF"
                          value={novoFiliado.cpf}
                          onChange={handleChange}
                        />
                        <Input
                          name="email"
                          type="email"
                          placeholder="E-mail"
                          value={novoFiliado.email}
                          onChange={handleChange}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            name="telefone"
                            placeholder="Telefone (com DDD)"
                            value={novoFiliado.telefone}
                            onChange={handleChange}
                          />
                          <Select
                            onValueChange={(value) =>
                              setNovoFiliado((prev) => ({ ...prev, tipodesconto: value }))
                            }
                            defaultValue={novoFiliado.tipodesconto}
                          >
                            <SelectTrigger className="w-full rounded-full border border-pink-200 px-3 py-2">
                              <SelectValue placeholder="Tipo de desconto" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Descontos</SelectLabel>
                                <SelectItem value="1">Convênio</SelectItem>
                                <SelectItem value="2">Cupom</SelectItem>
                                <SelectItem value="3">Programa de fidelidade</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        <Separator className="my-4" />
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            name="cep"
                            placeholder="CEP"
                            value={novoFiliado.cep}
                            onChange={handleChange}
                            onBlur={buscarEndereco}
                          />
                          <Input
                            name="cidade"
                            placeholder="Cidade"
                            value={novoFiliado.cidade}
                            onChange={handleChange}
                          />
                          <Input
                            name="estado"
                            placeholder="Estado"
                            value={novoFiliado.estado}
                            onChange={handleChange}
                          />
                          <Input
                            name="bairro"
                            placeholder="Bairro"
                            value={novoFiliado.bairro}
                            onChange={handleChange}
                          />
                          <Input
                            name="logradouro"
                            placeholder="Rua"
                            value={novoFiliado.logradouro}
                            onChange={handleChange}
                          />
                          <Input
                            name="numero"
                            placeholder="Número"
                            value={novoFiliado.numero}
                            onChange={handleChange}
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-full mt-2 py-2 shadow-md transition-all"
                        >
                          Enviar cadastro
                        </Button>
                        <p className="text-xs text-gray-500 text-center ">
                          Seus dados são protegidos e utilizados apenas para benefícios do programa.
                        </p>
                      </form>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              <div className="mt-8 flex justify-between">
                <Button
                  variant="outline"
                  className="border-pink-200 text-pink-600 rounded-full hover:bg-pink-100 px-6"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={salvarVenda}
                  className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-6"
                >
                  Finalizar venda
                </Button>

              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-sm text-center">
                  <DialogHeader>
                    <DialogTitle>
                      {isLoading
                        ? "Processando pagamento..."
                        : pagamentoFeito
                          ? "Pagamento Concluído!"
                          : "Caixa pronto para uma nova venda"}
                    </DialogTitle>
                  </DialogHeader>
                  {isLoading && (
                    <div className="flex flex-col items-center gap-4 py-6 animate-fadeIn">
                      <div className="relative flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full border-4 border-pink-300 animate-ping absolute"></div>
                        <Loader2 className="w-12 h-12 text-pink-600 animate-spin" />
                      </div>

                      <p className="text-sm text-gray-700 animate-pulse text-center">
                        Processando seu pagamento...
                        <br />Isso pode levar apenas alguns segundos.
                      </p>

                      <Button
                        variant="outline"
                        className="border-pink-400 text-pink-600 hover:bg-pink-50 transition"
                        onClick={() => {
                          setIsLoading(false);
                          setOpen(false);
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}

                  {pagamentoFeito && (
                    <div className="flex flex-col items-center gap-4 py-6">

                      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100">
                        <CheckCircle2 className="w-8 h-8 text-green-700" />
                      </div>

                      <p className="text-base text-gray-700 font-medium">
                        Pagamento concluído!
                      </p>

                      <p className="text-sm text-gray-500 text-center max-w-xs">
                        Tudo certo! Agora você pode gerar a nota fiscal da sua venda.
                      </p>

                      <Button
                        onClick={handleProsseguir}
                        className="mt-2 bg-pink-600 hover:bg-pink-700 text-white rounded-full px-6 py-2 shadow-sm"
                      >
                        Nota fiscal
                      </Button>
                    </div>
                  )}

                </DialogContent>
              </Dialog>
              <Dialog open={mostrarNota} onOpenChange={setMostrarNota}>
                <DialogContent className="max-w-2xl bg-white rounded-2xl shadow-lg p-6">

                  {/* Cabeçalho */}
                  <DialogHeader className="border-b pb-4">
                    <DialogTitle className="text-pink-600 text-2xl font-bold tracking-wide">
                      Nota Fiscal
                    </DialogTitle>
                    <DialogDescription className="text-gray-500 text-sm">
                      Detalhes da compra realizada.
                    </DialogDescription>
                  </DialogHeader>

                  {/* Conteúdo principal */}
                  <div className="mt-6">

                    {/* Tabela */}
                    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                      <table className="w-full text-sm">
                        <thead className="bg-pink-50 text-pink-700">
                          <tr>
                            <th className="p-3 text-left font-semibold">Produto</th>
                            <th className="p-3 text-center font-semibold">Qtd</th>
                            <th className="p-3 text-right font-semibold">Preço</th>
                            <th className="p-3 text-right font-semibold">Subtotal</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                          {listaVenda.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50 transition">
                              <td className="p-3">{p.nome}</td>
                              <td className="p-3 text-center">{p.quantidade}</td>
                              <td className="p-3 text-right">
                                R$ {p.preco.toFixed(2)}
                              </td>
                              <td className="p-3 text-right">
                                R$ {(p.preco * p.quantidade).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Totais */}
                    <div className="mt-6 bg-gray-50 p-4 rounded-xl shadow-inner text-right space-y-1 text-gray-700">
                      {/* <p className="text-sm">Cliente: <span className="font-medium">{cliente.nome}</span></p> */}
                      <p className="text-sm">Subtotal: <span className="font-medium">R$ {subtotalGeral.toFixed(2)}</span></p>
                      <p className="text-sm">Desconto: <span className="font-medium">R$ {desconto.toFixed(2)}</span></p>
                      <p className="text-sm mt-2 text-gray-600">
                        Forma de pagamento: <span className="font-medium">{tiposPagamento[tipo_pagamento_id]}</span>
                      </p>
                      <p className="font-bold text-xl text-pink-600 mt-2">
                        Total: R$ {total.toFixed(2)}
                      </p>

                    </div>
                  </div>

                  {/* Rodapé */}
                  <Dialog open={mostrarNota} onOpenChange={fecharDialog}>
                    {/* conteúdo do dialog */}
                    <DialogFooter className="flex justify-between mt-8">
                      <Button
                        variant="outline"
                        onClick={fecharDialog}
                        className="border-pink-300 text-pink-600 rounded-full hover:bg-pink-100"
                      >
                        Fechar
                      </Button>
                      <Button
                        onClick={imprimirNota}
                        className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-6 shadow-md"
                      >
                        Imprimir nota fiscal
                      </Button>
                    </DialogFooter>
                  </Dialog>

                </DialogContent>
              </Dialog>

            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}