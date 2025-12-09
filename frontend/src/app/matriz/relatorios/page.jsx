"use client";

import Layout from "@/components/layout/layout";
import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ShoppingCart,
  DollarSign,
  Package,
  Star,
  Download,
  PlusCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";

// -------------------------------
// URLs das APIs
// -------------------------------
const API_RELATORIOS = "http://localhost:8080/relatorios";
const API_VENDAS = "http://localhost:8080/vendas";
const API_PRODUTOS = "http://localhost:8080/produtos";
// const API_TRANSACOES = "http://localhost:8080/transacoes";
const API_UNIDADES = "http://localhost:8080/unidade";
const API_FUNCIONARIOS = "http://localhost:8080/api/funcionarios";

export default function Relatorios() {
  const [loading, setLoading] = useState(true);
  const [listaRelatorios, setListaRelatorios] = useState([]);
  const [vendasResumo, setVendasResumo] = useState({ totalVendas: 0, vendasHoje: 0, ticketMedio: 0 });
  const [financeiro, setFinanceiro] = useState({ faturamento: 0, despesas: 0, lucro: 0 });
  const [produtosMaisVendidos, setProdutosMaisVendidos] = useState([]);
  const [unidadesDestaque, setUnidadesDestaque] = useState([]);
  const [funcionarioDestaque, setFuncionarioDestaque] = useState({ nome: "", unidade: "" });
  const [graficoFaturamento, setGraficoFaturamento] = useState([]);
  const [graficoProdutos, setGraficoProdutos] = useState([]);
  const [loadingRelatorio, setLoadingRelatorio] = useState(false);

  // -------------------------------
  // Carregar dados do backend
  // -------------------------------
  async function carregarDados() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // ---------------------------
      // Relatórios
      // ---------------------------
      const relatoriosRes = await fetch(API_RELATORIOS, {
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
      });
      const relatoriosDataRaw = await relatoriosRes.json();
      const relatoriosData = Array.isArray(relatoriosDataRaw)
        ? relatoriosDataRaw
        : relatoriosDataRaw.relatorios || [];
      setListaRelatorios(relatoriosData);

      // ---------------------------
      // Vendas
      // ---------------------------
      const vendasRes = await fetch(API_VENDAS, {
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
      });
      const vendasDataRaw = await vendasRes.json();
      const vendasData = Array.isArray(vendasDataRaw)
        ? vendasDataRaw
        : vendasDataRaw.vendas || vendasDataRaw.data || [];

      const totalVendas = vendasData.length;
      const hoje = new Date().toDateString();
      const vendasHoje = vendasData.filter((v) => new Date(v.data).toDateString() === hoje).length;
      const ticketMedio = vendasData.reduce((sum, v) => sum + (v.valorTotal || 0), 0) / (totalVendas || 1);
      setVendasResumo({ totalVendas, vendasHoje, ticketMedio });

      // // ---------------------------
      // // Financeiro
      // // ---------------------------
      // const faturamento = vendasData.reduce((sum, v) => sum + (v.valorTotal || 0), 0);
      // const despesasRes = await fetch(API_TRANSACOES, {
      //   headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
      // });
      // const despesasDataRaw = await despesasRes.json();
      // const despesasData = Array.isArray(despesasDataRaw)
      //   ? despesasDataRaw
      //   : despesasDataRaw.transacoes || [];
      // const despesas = despesasData.reduce((sum, t) => sum + (t.valor || 0), 0);
      // setFinanceiro({ faturamento, despesas, lucro: faturamento - despesas });

      // ---------------------------
      // Produtos mais vendidos
      // ---------------------------
      const produtosRes = await fetch(API_PRODUTOS, {
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
      });
      const produtosDataRaw = await produtosRes.json();
      const produtosData = Array.isArray(produtosDataRaw)
        ? produtosDataRaw
        : produtosDataRaw.produtos || [];

      const produtosVendasMap = {};
      vendasData.forEach((v) => {
        (v.itens || []).forEach((item) => {
          produtosVendasMap[item.produtoId] = (produtosVendasMap[item.produtoId] || 0) + (item.quantidade || 0);
        });
      });

      const produtosMaisVendidosData = produtosData
        .map((p) => ({ produto: p.nome, qtd: produtosVendasMap[p.id] || 0 }))
        .sort((a, b) => b.qtd - a.qtd)
        .slice(0, 5);
      setProdutosMaisVendidos(produtosMaisVendidosData);
      setGraficoProdutos(produtosMaisVendidosData.map((p) => ({ nome: p.produto, vendas: p.qtd })));

      // ---------------------------
      // Gráfico de faturamento mensal
      // ---------------------------
      const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      const faturamentoMensal = Array.from({ length: 12 }, (_, i) => ({
        mes: meses[i],
        valor: vendasData
          .filter((v) => new Date(v.data).getMonth() === i)
          .reduce((sum, v) => sum + (v.valorTotal || 0), 0),
      }));
      setGraficoFaturamento(faturamentoMensal);

      // ---------------------------
      // Unidades em destaque
      // ---------------------------
      // ---------------------------
      // Unidades em destaque
      // ---------------------------
      const unidadesRes = await fetch(API_UNIDADES, {
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
      });
      const unidadesDataRaw = await unidadesRes.json();
      const unidadesData = Array.isArray(unidadesDataRaw)
        ? unidadesDataRaw
        : unidadesDataRaw.unidades || [];

      // Aqui calculamos as vendas de cada unidade
      const vendasPorUnidade = {};
      vendasData.forEach(v => {
        const unidadeId = v.unidade_id;
        vendasPorUnidade[unidadeId] = (vendasPorUnidade[unidadeId] || 0) + 1;
      });

      // Agora mapeamos para o formato do card
      const unidadesDestaqueData = unidadesData
        .map(u => ({
          unidade: u.nome,
          vendas: vendasPorUnidade[u.id] || 0
        }))
        .sort((a, b) => b.vendas - a.vendas) // ordem decrescente
        .slice(0, 3); // top 3
      setUnidadesDestaque(unidadesDestaqueData);


     // ---------------------------
// Funcionário que mais vendeu
// ---------------------------
const vendasPorFuncionario = {};
vendasData.forEach((v) => {
  const usuario_id = v.usuario_id; // pega o usuário_id da venda
  vendasPorFuncionario[usuario_id] = (vendasPorFuncionario[usuario_id] || 0) + (v.valorTotal || 0);
});

// identifica o id do usuário com maior venda
let maiorVendaId = null;
let maiorVendaValor = 0;
for (const [id, valor] of Object.entries(vendasPorFuncionario)) {
  if (valor > maiorVendaValor) {
    maiorVendaValor = valor;
    maiorVendaId = id;
  }
}

if (maiorVendaId) {
  // buscar o usuário correspondente pelo id
  const usuariosRes = await fetch("http://localhost:8080/api/usuarios", {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  const usuariosDataRaw = await usuariosRes.json();
  const usuariosData = Array.isArray(usuariosDataRaw)
    ? usuariosDataRaw
    : usuariosDataRaw.usuarios || [];

  const usuario = usuariosData.find(u => u.id === parseInt(maiorVendaId));
  if (usuario) {
    setFuncionarioDestaque({
      nome: usuario.nome,
      unidade: usuario.unidade || "Não informada",
    });
  }
}

    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  // -------------------------------
  // Gerar relatório
  // -------------------------------
  async function gerarRelatorio() {
    setLoadingRelatorio(true);
    try {
      const res = await fetch(`${API_RELATORIOS}/gerar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipoRelatorio_id: 1, usuario_id: 1 }),
      });
      if (!res.ok) throw new Error("Erro ao gerar relatório");
      await carregarDados();
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar relatório");
    } finally {
      setLoadingRelatorio(false);
    }
  }

  // -------------------------------
  // Baixar relatório
  // -------------------------------
  async function baixarRelatorio(id) {
    try {
      const res = await fetch(`${API_RELATORIOS}/download/${id}`);
      if (!res.ok) throw new Error("Erro ao baixar relatório");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio_${id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Erro ao baixar relatório");
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-[#d66678]" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Relatórios Gerais</h1>

        {/* Botão gerar relatório */}
        <div className="flex justify-end mb-6">
          <Button
            onClick={gerarRelatorio}
            disabled={loadingRelatorio}
            className="bg-[#d66678] hover:bg-[#c15568] text-white"
          >
            {loadingRelatorio ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <PlusCircle className="w-4 h-4 mr-2" />
            )}
            Gerar Relatório
          </Button>
        </div>

        {/* DASHBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-pink-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#d66678]">
                <ShoppingCart /> Total de Vendas
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{vendasResumo.totalVendas}</CardContent>
          </Card>

          <Card className="border-pink-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#d66678]">
                <ShoppingCart /> Vendas Hoje
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{vendasResumo.vendasHoje}</CardContent>
          </Card>

          <Card className="border-pink-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#d66678]">
                <Star /> Funcionário Destaque
              </CardTitle>
            </CardHeader>
            <CardContent className="text-lg font-bold">
              {funcionarioDestaque.nome ? (
                <>
                  {funcionarioDestaque.nome} <br />
                  <span className="text-sm font-normal">Unidade: {funcionarioDestaque.unidade}</span>
                </>
              ) : (
                "Nenhuma venda registrada"
              )}
            </CardContent>
          </Card>
        </div>

        {/* FINANCEIRO */}
        <Card className="border-pink-200 shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="text-[#d66678]">Financeiro</CardTitle>
            <CardDescription>Resumo geral de faturamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg bg-[#ffe6ea]">
                <p className="font-semibold">Faturamento</p>
                <p className="text-2xl font-bold text-[#d66678]">R$ {financeiro.faturamento}</p>
              </div>
              <div className="p-4 rounded-lg bg-[#ffe6ea]">
                <p className="font-semibold">Despesas</p>
                <p className="text-2xl font-bold text-[#d66678]">R$ {financeiro.despesas}</p>
              </div>
              <div className="p-4 rounded-lg bg-[#ffe6ea]">
                <p className="font-semibold">Lucro</p>
                <p className="text-2xl font-bold text-[#d66678]">R$ {financeiro.lucro}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PRODUTOS MAIS VENDIDOS */}
        <Card className="border-pink-200 shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="text-[#d66678] flex items-center gap-2">
              <Package /> Produtos Mais Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {produtosMaisVendidos.map((p, i) => (
              <div key={i} className="flex justify-between p-3 mb-2 rounded-lg bg-[#ffe6ea]">
                <span>{p.produto}</span>
                <span className="font-bold text-[#d66678]">{p.qtd} vendas</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* UNIDADES EM DESTAQUE */}
        <Card className="border-pink-200 shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="text-[#d66678] flex items-center gap-2">
              <Star /> Unidades em Destaque
            </CardTitle>
          </CardHeader>
          <CardContent>
            {unidadesDestaque.map((u, i) => (
              <div key={i} className="flex justify-between p-3 mb-2 rounded-lg bg-[#ffe6ea]">
                <span>{u.unidade}</span>
                <span className="font-bold text-[#d66678]">{u.vendas} vendas</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* GRÁFICO FATURAMENTO */}
        <Card className="border-pink-200 shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="text-[#d66678]">Faturamento Mensal</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={graficoFaturamento}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="valor" stroke="#d66678" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* GRÁFICO PRODUTOS */}
        <Card className="border-pink-200 shadow-sm mb-10">
          <CardHeader>
            <CardTitle className="text-[#d66678]">Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={graficoProdutos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="vendas" fill="#d66678" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* LISTA DE RELATÓRIOS */}
        <Card className="border-pink-200 shadow-sm mb-20">
          <CardHeader>
            <CardTitle className="text-[#d66678] flex items-center gap-2">
              <Package /> Relatórios Gerados
            </CardTitle>
            <CardDescription>Relatórios armazenados no banco de dados</CardDescription>
          </CardHeader>
          <CardContent>
            {listaRelatorios.length === 0 ? (
              <p>Nenhum relatório gerado ainda.</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-2">ID</th>
                    <th className="p-2">Nome</th>
                    <th className="p-2">Data</th>
                    <th className="p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {listaRelatorios.map((r) => (
                    <tr key={r.id} className="border-b">
                      <td className="p-2">{r.id}</td>
                      <td className="p-2">{r.nome}</td>
                      <td className="p-2">{new Date(r.criado_em).toLocaleString()}</td>
                      <td className="p-2">
                        <Button
                          onClick={() => baixarRelatorio(r.id)}
                          className="bg-[#d66678] hover:bg-[#c15568] text-white"
                        >
                          <Download className="w-4 h-4 mr-1" /> Baixar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
