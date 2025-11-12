"use client";

import Layout from "@/components/layout/layout";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Minus, Plus, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function NovaVendaPage() {

  const [produtos, setProdutos] = useState([]);
  const [codigoBarras, setCodigoBarras] = useState("");
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

  const removerProduto = (id) => {
    setListaVenda(prev => prev.filter(p => p.id !== id));
    mostrarAlerta("Produto removido da venda!", "sucesso");
  };

  const itensPorPagina = 5;
  const totalPaginas = Math.max(1, Math.ceil(listaVenda.length / itensPorPagina));
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const produtosExibidos = listaVenda.slice(inicio, fim);

  const API_PRODUTOS = "http://localhost:8080/produtos";
  const API_URL = "http://localhost:8080/api/filiados";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    console.log(token);


    fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setFiliados(data))
      .catch(() => mostrarAlerta("Erro ao carregar filiados.", "erro"));
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
        nome: p.nome ?? p.descricao ?? "Produto sem nome",
        preco: Number(p.preco ?? p.preco_unitario ?? 0),
        codigo_barras: p.codigo_barras ?? p.cod_barras ?? p.barcode ?? "", // <- ADICIONADO
        quantidade: 1,
      }));


      setProdutos(produtosComQuantidade);
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      setMensagemFeedback({
        type: "error",
        text: err.message || "Erro ao carregar produtos.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);


  const alterarQuantidade = (id, delta) => {
    setListaVenda(prev =>
      prev.map(p => p.id === id ? { ...p, quantidade: Math.max(1, p.quantidade + delta) } : p)
    );
  };


  const calcularSubtotal = (preco, quantidade) => preco * quantidade;
  const subtotalGeral = listaVenda.reduce((acc, p) => acc + calcularSubtotal(p.preco, p.quantidade), 0);
  const total = subtotalGeral - Number(desconto);


  const mostrarAlerta = (mensagem, tipo = "info") => {
    setAlerta({ mensagem, tipo });
    setTimeout(() => setAlerta(null), 3000);
  };


  const paginaAnterior = () => paginaAtual > 1 && setPaginaAtual(paginaAtual - 1);
  const proximaPagina = () => paginaAtual < totalPaginas && setPaginaAtual(paginaAtual + 1);

  const handleProsseguir = () => {
    if (!formaPagamento) {
      mostrarAlerta("Selecione uma forma de pagamento antes de prosseguir!", "erro");
      return;
    }
    setMostrarNota(true);
  };

  const aplicarDesconto = async () => {
    let valorDesconto = 0;
    const codigoNormalizado = codigoDesconto.trim().toUpperCase(); // Para CUPOM e CONVENIO
    const cpfLimpo = codigoDesconto.replace(/\D/g, ""); // Apenas números

    // 1. Tenta Desconto por CPF
    if (cpfLimpo.length === 11) {
      // Lógica de CPF
      if (subtotalGeral >= 100) {
        const existe = filiados.find(f => f.cpf.replace(/\D/g, "") === cpfLimpo);
        if (!existe) {
          mostrarAlerta("CPF não encontrado no sistema de filiados.", "erro");
          setDesconto(0); setCodigoDesconto(""); return;
        }
        valorDesconto = subtotalGeral * 0.2;
        mostrarAlerta("Desconto de 20% aplicado para filiado!", "sucesso");
      } else {
        mostrarAlerta("Compra deve ser maior que R$100 para aplicar desconto por CPF.", "erro");
        setDesconto(0); setCodigoDesconto(""); return;
      }
    }

    // 2. Tenta Desconto por CUPOM
    else if (codigoNormalizado.startsWith("CUPOM")) {
      // Lógica de Cupom (mantida como estava)
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8080/api/descontos?nome=${codigoDesconto}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Cupom inválido");

        const cupomData = await res.json();

        const descontoCupom = Array.isArray(cupomData)
          ? Number(cupomData[0].desconto)
          : Number(cupomData.desconto);

        valorDesconto = subtotalGeral * descontoCupom;
        mostrarAlerta(`Desconto de ${descontoCupom * 100}% aplicado pelo cupom!`, "sucesso");
      } catch (err) {
        mostrarAlerta(err.message || "Cupom inválido.", "erro");
        setDesconto(0); setCodigoDesconto(""); return;
      }
    }

    // 3. Tenta Desconto por CONVÊNIO (se falhou nos dois anteriores)
    else {
      // Tenta usar o que foi digitado (códigoDesconto) como o nome do convênio.
      try {
        const token = localStorage.getItem("token");
        const convenioNome = codigoDesconto.trim(); // Usa o código digitado diretamente

        console.log("--- TENTANDO BUSCAR CONVÊNIO POR NOME ---");
        console.log("Busca por nome:", convenioNome);

        const res = await fetch(`http://localhost:8080/parcerias/buscar?parceiro=${convenioNome}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          // Se não for encontrado ou der erro, assume que não é um código válido e lança o erro.
          const erroApi = await res.json().catch(() => ({}));
          throw new Error(erroApi.message || "Convênio não encontrado.");
        }

        const convenioData = await res.json();
        console.log("RETORNO API CONVÊNIO:", convenioData);

        // 🚨 CORREÇÃO DE TIPO DE DADO
        const porcentagemNumerica = Number(convenioData.porcentagem);

        if (isNaN(porcentagemNumerica) || !convenioData) {
          throw new Error("Dados do convênio inválidos.");
        }

        // Usa o valor direto (ex: 0.70)
        valorDesconto = subtotalGeral * porcentagemNumerica;

        const porcentagemFormatada = (porcentagemNumerica * 100).toFixed(0);
        mostrarAlerta(`Desconto de ${porcentagemFormatada}% aplicado através do convênio!`, "sucesso");

      } catch (err) {
        console.error("ERRO CONVÊNIO:", err);
        // Se chegou aqui, não é um CPF, nem um CUPOM, nem um CONVÊNIO.
        mostrarAlerta(err.message || "Código ou Convênio inválido.", "erro");
        setDesconto(0); setCodigoDesconto(""); return;
      }
    }

    // Aplica o desconto calculado se um dos blocos foi bem-sucedido
    setDesconto(valorDesconto);
    setCodigoDesconto("");
  };

  const imprimirNota = () => {
    window.print();
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
        mostrarAlerta("Você precisa estar logado para cadastrar filiado.", "erro");
        return;
      }

      const cpfLimpo = novoFiliado.cpf.replace(/\D/g, "");
      const telefoneLimpo = novoFiliado.telefone.replace(/\D/g, "");
      const cepLimpo = novoFiliado.cep.replace(/\D/g, "");

      if (cpfLimpo.length !== 11) {
        mostrarAlerta("CPF deve conter exatamente 11 dígitos.", "erro");
        return;
      }
      if (telefoneLimpo.length < 8) {
        mostrarAlerta("Telefone deve conter pelo menos 8 dígitos.", "erro");
        return;
      }
      if (cepLimpo.length !== 8) {
        mostrarAlerta("CEP deve conter exatamente 8 dígitos.", "erro");
        return;
      }
      if (novoFiliado.estado.length !== 2) {
        mostrarAlerta("Estado deve ser uma sigla de 2 caracteres.", "erro");
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

        mostrarAlerta("Filiado cadastrado com sucesso!", "sucesso");
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
        mostrarAlerta(erro.message || "Erro ao salvar filiado.", "erro");
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

    const buscarProdutoPorCodigo = (codigo) => {
      const code = String(codigo ?? codigoBarras ?? "").trim();
      if (!code) {
        mostrarAlerta("Digite um código de barras válido.", "erro");
        return;
      }

      // procura no catálogo (produtos)
      const produtoEncontrado = produtos.find(p => String(p.codigo_barras) === code);

      if (!produtoEncontrado) {
        mostrarAlerta("Produto não encontrado!", "erro");
        return;
      }

      // verifica se já existe no carrinho (listaVenda)
      const existeNoCarrinho = listaVenda.find(p => p.id === produtoEncontrado.id);

      if (existeNoCarrinho) {
        // só aumenta quantidade
        setListaVenda(prev =>
          prev.map(p =>
            p.id === produtoEncontrado.id
              ? { ...p, quantidade: p.quantidade + 1 }
              : p
          )
        );
      } else {
        // adiciona um novo item ao carrinho
        setListaVenda(prev => [...prev, { ...produtoEncontrado, quantidade: 1 }]);
      }

      setCodigoBarras("");
      mostrarAlerta("Produto adicionado à venda!", "sucesso");
    };


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

              <div className="flex gap-2">
                <Input
                  placeholder="Insira o código do produto (ou escaneie) e pressione Enter"
                  value={codigoBarras}
                  onChange={(e) => setCodigoBarras(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      buscarProdutoPorCodigo(e.target.value || codigoBarras);
                    }
                  }}
                  className="bg-white border-pink-300 text-gray-800 placeholder:text-gray-500 rounded-full px-5 py-6"
                />
                <Button
                  onClick={() => buscarProdutoPorCodigo(codigoBarras)}
                  className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-6"
                >
                  Buscar
                </Button>
              </div>

              <Card className="mt-6">
                <CardContent className="p-4">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-pink-600 font-semibold">
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
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-500 mb-1">Subtotal</p>
                    <p className="font-medium text-gray-700">R$ {subtotalGeral.toFixed(2)}</p>
                    <Separator className="my-1" />
                  </div>

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
                        className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-4"
                      >
                        Adicionar
                      </Button>
                    </div>
                    <Separator className="my-1" />
                  </div>


                  <div>
                    <p className="text-pink-600 font-semibold text-lg mb-1">Total</p>
                    <p className="text-gray-800 font-bold text-xl">R$ {total.toFixed(2)}</p>
                    <Separator className="my-1" />
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-gray-500 mb-3">Forma de pagamento</p>
                  <div className="flex flex-wrap gap-2">
                    {["PIX", "Crédito", "Débito"].map((forma) => (
                      <Button
                        key={forma}
                        variant="secondary"
                        onClick={() => setFormaPagamento(forma)}
                        className={`rounded-full ${formaPagamento === forma
                          ? "bg-pink-500 text-white"
                          : "bg-pink-100 text-pink-700 hover:bg-pink-200"
                          }`}
                      >
                        {forma}
                      </Button>
                    ))}
                  </div>
                </div>

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
                    onClick={handleProsseguir}
                    className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-6"
                  >
                    Finalizar venda
                  </Button>
                </div>

                {/* --- MODAL DA NOTA FISCAL --- */}
                <Dialog open={mostrarNota} onOpenChange={setMostrarNota}>
                  <DialogContent className="max-w-2xl bg-white">
                    <DialogHeader>
                      <DialogTitle className="text-pink-600 text-xl font-bold">
                        Nota Fiscal da Compra
                      </DialogTitle>
                      <DialogDescription className="text-gray-600">
                        Confira os detalhes da sua compra antes de imprimir.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4">
                      <table className="w-full text-sm border border-gray-200">
                        <thead className="bg-pink-50">
                          <tr>
                            <th className="p-2 text-left">Produto</th>
                            <th className="p-2">Qtd</th>
                            <th className="p-2 text-right">Preço</th>
                            <th className="p-2 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {listaVenda.map((p) => (
                            <tr key={p.id} className="border-t">
                              <td className="p-2">{p.nome}</td>
                              <td className="p-2 text-center">{p.quantidade}</td>
                              <td className="p-2 text-right">R$ {p.preco.toFixed(2)}</td>
                              <td className="p-2 text-right">
                                R$ {(p.preco * p.quantidade).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="mt-4 text-right text-gray-700 space-y-1">
                        <p>Subtotal: R$ {subtotalGeral.toFixed(2)}</p>
                        <p>Desconto: R$ {desconto.toFixed(2)}</p>
                        <p className="font-bold text-lg text-pink-600">Total: R$ {total.toFixed(2)}</p>
                        <p>Forma de pagamento: {formaPagamento}</p>
                      </div>
                    </div>

                    <DialogFooter className="flex justify-between mt-6">
                      <Button
                        variant="outline"
                        onClick={() => setMostrarNota(false)}
                        className="border-pink-300 text-pink-600 rounded-full hover:bg-pink-100"
                      >
                        Fechar
                      </Button>
                      <Button onClick={imprimirNota} className="bg-pink-500 hover:bg-pink-600 text-white rounded-full">
                        Imprimir nota fiscal
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }
