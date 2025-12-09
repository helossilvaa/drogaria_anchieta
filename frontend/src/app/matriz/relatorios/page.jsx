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

const API_RELATORIOS = "http://localhost:8080/relatorios";
const API_VENDAS = "http://localhost:8080/vendas";
const API_PRODUTOS = "http://localhost:8080/produtos";
const API_UNIDADES = "http://localhost:8080/unidade";
const API_MOVIMENTACOES = "http://localhost:8080/movimentacoesestoque"

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


  async function carregarDados() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");


      const relatoriosRes = await fetch(API_RELATORIOS, {
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
      });
      const relatoriosDataRaw = await relatoriosRes.json();
      const relatoriosData = Array.isArray(relatoriosDataRaw)
        ? relatoriosDataRaw
        : relatoriosDataRaw.relatorios || [];
      setListaRelatorios(relatoriosData);


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


      // -------- FINANCEIRO USANDO ITENS_VENDA --------
      const faturamentoRes = await fetch("http://localhost:8080/itens", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const itensVendaRaw = await faturamentoRes.json();
      const itensVenda = Array.isArray(itensVendaRaw)
        ? itensVendaRaw
        : itensVendaRaw.itens || [];

      // Somatório de todos os subtotais dos itens vendidos
      const faturamentoTotal = itensVenda.reduce((sum, item) => {
        const valor = Number(item.subtotal);
        return sum + (isNaN(valor) ? 0 : valor);
      }, 0);



      // -------- DESPESAS (MOVIMENTAÇÕES DE ENTRADA) --------
      const movRes = await fetch(API_MOVIMENTACOES, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const movDataRaw = await movRes.json();
      const movimentacoes = Array.isArray(movDataRaw)
        ? movDataRaw
        : movDataRaw.movimentacoes || [];

      const entradas = movimentacoes.filter(m => m.tipo === "ENTRADA");

      // Soma das entradas como despesas
      const despesasTotal = entradas.reduce((sum, e) => {
        const valor = Number(e.valor_total);
        return sum + (isNaN(valor) ? 0 : valor);
      }, 0);



      // -------- LUCRO --------
      const lucroTotal = faturamentoTotal - despesasTotal;


      // Atualiza estado no React
      setFinanceiro({
        faturamento: Number(faturamentoTotal),
        despesas: Number(despesasTotal),
        lucro: Number(lucroTotal)
      });




      // Buscar produtos
      const produtosRes = await fetch(API_PRODUTOS, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const produtosDataRaw = await produtosRes.json();
      const produtosData = Array.isArray(produtosDataRaw)
        ? produtosDataRaw
        : produtosDataRaw.produtos || [];

      // Buscar itens de venda (AGORA PEGA DA API CERTA!)
      const itensRes = await fetch("http://localhost:8080/itens", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const itensRaw = await itensRes.json();
      const itensData = Array.isArray(itensRaw)
        ? itensRaw
        : itensRaw.itens || [];

      // Somatório de vendas por produto
      const produtosVendasMap = {};
      itensData.forEach(item => {
        const id = item.produto_id;
        const qtd = item.quantidade || 0;

        produtosVendasMap[id] = (produtosVendasMap[id] || 0) + qtd;
      });

      // Montando "top produtos"
      const produtosMaisVendidosData = produtosData
        .map((p) => ({
          produto: p.nome,
          qtd: produtosVendasMap[p.id] || 0
        }))
        .sort((a, b) => b.qtd - a.qtd)
        .slice(0, 5);

      setProdutosMaisVendidos(produtosMaisVendidosData);
      setGraficoProdutos(produtosMaisVendidosData.map((p) => ({
        nome: p.produto,
        vendas: p.qtd
      })));


      const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      const faturamentoMensal = Array.from({ length: 12 }, (_, i) => ({
        mes: meses[i],
        valor: vendasData
          .filter((v) => new Date(v.data).getMonth() === i)
          .reduce((sum, v) => sum + (v.valorTotal || 0), 0),
      }));
      setGraficoFaturamento(faturamentoMensal);


      const unidadesRes = await fetch(API_UNIDADES, {
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
      });
      const unidadesDataRaw = await unidadesRes.json();
      const unidadesData = Array.isArray(unidadesDataRaw)
        ? unidadesDataRaw
        : unidadesDataRaw.unidades || [];


      const vendasPorUnidade = {};
      vendasData.forEach(v => {
        const unidadeId = v.unidade_id;
        vendasPorUnidade[unidadeId] = (vendasPorUnidade[unidadeId] || 0) + 1;
      });

      const unidadesDestaqueData = unidadesData
        .map(u => ({
          unidade: u.nome,
          vendas: vendasPorUnidade[u.id] || 0
        }))
        .sort((a, b) => b.vendas - a.vendas) // ordem decrescente
        .slice(0, 3); // top 3
      setUnidadesDestaque(unidadesDestaqueData);

    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function gerarRelatorio() {
    setLoadingRelatorio(true);
    try {

      const payload = {
        vendasResumo,
        financeiro,
        produtosMaisVendidos,
        unidadesDestaque,
        graficoFaturamento
      };

      const res = await fetch(`${API_RELATORIOS}/gerar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
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
          <Loader2 className="w-10 h-10 animate-spin text-[#245757]" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">

        <h1 className="text-2xl font-bold text-[#245757]">Relatórios Gerais</h1>

        {/* Botão gerar relatório */}
        <div className="flex justify-end">
          <Button
            onClick={gerarRelatorio}
            disabled={loadingRelatorio}
            className="bg-[#245757] text-white px-4 py-2 rounded hover:bg-[#1f4b4b]"
          >
            {loadingRelatorio ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4 mr-2" />}
            Gerar Relatório
          </Button>
        </div>

        {/* DASHBOARD VENDAS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-sm p-4">
            <CardTitle className="text-[#245757] text-lg font-semibold">Total de Vendas</CardTitle>
            <CardContent className="text-2xl font-bold">{vendasResumo.totalVendas}</CardContent>
          </Card>

          <Card className="shadow-sm p-4">
            <CardTitle className="text-[#245757] text-lg font-semibold">Vendas Hoje</CardTitle>
            <CardContent className="text-2xl font-bold">{vendasResumo.vendasHoje}</CardContent>
          </Card>

          <Card className="shadow-sm p-4">
            <CardTitle className="text-[#245757] text-lg font-semibold">Ticket Médio</CardTitle>
            <CardContent className="text-2xl font-bold">
              R$ {vendasResumo.ticketMedio.toFixed(2)}
            </CardContent>
          </Card>
        </div>

        {/* FINANCEIRO */}
        <Card className="shadow-sm p-4">
          <CardTitle className="text-[#245757] text-lg font-semibold mb-2">Financeiro</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["Faturamento", "Despesas", "Lucro"].map((title, i) => {
              const value = title === "Faturamento" ? financeiro.faturamento :
                title === "Despesas" ? financeiro.despesas : financeiro.lucro;
              return (
                <div key={i} className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500">{title}</p>
                  <p className="text-xl font-bold text-[#245757]">R$ {value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* PRODUTOS MAIS VENDIDOS */}
        <Card className="shadow-sm p-4">
          <CardTitle className="text-[#245757] text-lg font-semibold mb-2">Produtos Mais Vendidos</CardTitle>
          <div className="space-y-2">
            {produtosMaisVendidos.map((p, i) => (
              <div key={i} className="flex justify-between text-[#245757] font-bold p-2 rounded bg-[#a0c0c0]">
                <span>{p.produto}</span>
                <span>{p.qtd} vendas</span>
              </div>
            ))}
          </div>
        </Card>

        {/* UNIDADES EM DESTAQUE */}
        <Card className="shadow-sm p-4">
          <CardTitle className="text-[#245757] text-lg font-semibold mb-2">Unidades em Destaque</CardTitle>
          <div className="space-y-2">
            {unidadesDestaque.map((u, i) => (
              <div key={i} className="flex justify-between text-[#245757] font-bold p-2 rounded bg-[#a0c0c0]">
                <span>{u.unidade}</span>
                <span>{u.vendas} vendas</span>
              </div>
            ))}
          </div>
        </Card>


        {/* GRÁFICO FATURAMENTO */}
        <Card className="shadow-sm p-4">
          <CardTitle className="text-[#245757] text-lg font-semibold mb-2">Faturamento Mensal</CardTitle>
          <CardContent style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={graficoFaturamento}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="valor" stroke="#245757" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* GRÁFICO PRODUTOS */}
        <Card className="shadow-sm p-4">
          <CardTitle className="text-[#245757] text-lg font-semibold mb-2">Produtos Mais Vendidos</CardTitle>
          <CardContent style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={graficoProdutos}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="vendas" fill="#245757" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* LISTA DE RELATÓRIOS */}
        <Card className="shadow-sm p-4">
          <CardTitle className="text-[#245757] text-lg font-semibold mb-2">Relatórios Gerados</CardTitle>
          {listaRelatorios.length === 0 ? (
            <p className="text-gray-500">Nenhum relatório gerado ainda.</p>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2">ID</th>
                  <th className="py-2">Nome</th>
                  <th className="py-2">Data</th>
                  <th className="py-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {listaRelatorios.map(r => (
                  <tr key={r.id} className="border-b border-gray-100">
                    <td className="py-2">{r.id}</td>
                    <td className="py-2">{r.nome}</td>
                    <td className="py-2">{new Date(r.criado_em).toLocaleString()}</td>
                    <td className="py-2">
                      <Button
                        onClick={() => baixarRelatorio(r.id)}
                        className="bg-[#245757] text-white px-2 py-1 rounded text-sm hover:bg-[#1f4b4b]"
                      >
                        <Download className="w-3 h-3 inline mr-1" /> Baixar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

      </div>
    </Layout>

  );
}
