"use client";

import Layout from "@/components/layout/layout";
import { useEffect, useState, useRef } from "react";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, ResponsiveContainer } from "recharts";

const API_RELATORIOS = "http://localhost:8080/relatorios";
const API_VENDAS = "http://localhost:8080/vendas";
const API_PRODUTOS = "http://localhost:8080/produtos";
const API_UNIDADES = "http://localhost:8080/unidade";
const API_TRANSACOES = "http://localhost:8080/api/transacoes-matriz"; 

export default function Relatorios() {
  const relatorioRef = useRef(); 
  const [loading, setLoading] = useState(true);
  const [listaRelatorios, setListaRelatorios] = useState([]);
  const [vendasResumo, setVendasResumo] = useState({ totalVendas: 0, vendasHoje: 0 });
  const [produtosMaisVendidos, setProdutosMaisVendidos] = useState([]);
  const [unidadesDestaque, setUnidadesDestaque] = useState([]);
  const [graficoProdutos, setGraficoProdutos] = useState([]);
  const [graficoEvolucao, setGraficoEvolucao] = useState([]);

// financeiro
  const [totalEntradas, setTotalEntradas] = useState(0);
  const [totalSaidas, setTotalSaidas] = useState(0);
  const [totalLucroLiquido, setTotalLucroLiquido] = useState(0);
  const [percentualLucro, setPercentualLucro] = useState("0");

  async function carregarDados() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

// RELATÓRIOS
      const relatoriosRes = await fetch(API_RELATORIOS, {
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
      });
      const relatoriosDataRaw = await relatoriosRes.json();
      const relatoriosData = Array.isArray(relatoriosDataRaw)
        ? relatoriosDataRaw
        : relatoriosDataRaw.relatorios || [];
      setListaRelatorios(relatoriosData);

      // VENDAS
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
      setVendasResumo({ totalVendas, vendasHoje });

// PRODUTOS MAIS VENDIDOS
      const produtosRes = await fetch(API_PRODUTOS, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const produtosDataRaw = await produtosRes.json();
      const produtosData = Array.isArray(produtosDataRaw)
        ? produtosDataRaw
        : produtosDataRaw.produtos || [];

      const itensRes = await fetch("http://localhost:8080/itens", {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const itensRaw = await itensRes.json();
      const itensData = Array.isArray(itensRaw) ? itensRaw : itensRaw.itens || [];

      const produtosVendasMap = {};
      itensData.forEach(item => {
        const id = item.produto_id;
        const qtd = item.quantidade || 0;
        produtosVendasMap[id] = (produtosVendasMap[id] || 0) + qtd;
      });

      const produtosMaisVendidosData = produtosData
        .map(p => ({ produto: p.nome, qtd: produtosVendasMap[p.id] || 0 }))
        .sort((a, b) => b.qtd - a.qtd)
        .slice(0, 5);

      setProdutosMaisVendidos(produtosMaisVendidosData);
      setGraficoProdutos(produtosMaisVendidosData.map(p => ({ nome: p.produto, vendas: p.qtd })));

// GRÁFICO MENSAL
      const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
      const evolucaoMensal = Array.from({length:12}, (_,i)=>( {
        mes: meses[i],
        vendas: vendasData.filter(v => new Date(v.data).getMonth() === i).length
      }));
      setGraficoEvolucao(evolucaoMensal);

// UNIDADES EM DESTAQUE
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
        .map(u => ({ unidade: u.nome, vendas: vendasPorUnidade[u.id] || 0 }))
        .sort((a,b)=>b.vendas - a.vendas)
        .slice(0,3);
      setUnidadesDestaque(unidadesDestaqueData);

// FINANCEIRO
      const transRes = await fetch(API_TRANSACOES, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const data = await transRes.json();
      const transacoes = Array.isArray(data.transacoes) ? data.transacoes : [];

      const entradas = transacoes.reduce((acc, t) => acc + Number(t.entradas || 0), 0);
      const saidas = transacoes.reduce((acc, t) => acc + Number(t.saidas || 0), 0);
      const lucro = transacoes.reduce((acc, t) => acc + Number(t.lucro_liquido || 0), 0);
      const percentual = entradas ? ((lucro / entradas) * 100).toFixed(1) : "0";

      setTotalEntradas(entradas);
      setTotalSaidas(saidas);
      setTotalLucroLiquido(lucro);
      setPercentualLucro(percentual);

    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregarDados(); }, []);

  if (loading) return (
    <Layout>
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-[#245757]" />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="p-6 space-y-6" ref={relatorioRef}>
        <h1 className="text-2xl font-bold text-[#245757]">Relatórios Gerais</h1>

{/* RESUMO VENDAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="shadow-sm p-4">
            <CardTitle className="text-[#245757] text-lg font-semibold">Total de Vendas</CardTitle>
            <CardContent className="text-2xl font-bold">{vendasResumo.totalVendas}</CardContent>
          </Card>

          <Card className="shadow-sm p-4">
            <CardTitle className="text-[#245757] text-lg font-semibold">Vendas Hoje</CardTitle>
            <CardContent className="text-2xl font-bold">{vendasResumo.vendasHoje}</CardContent>
          </Card>
        </div>

{/* FINANCEIRO */}
        <Card className="shadow-sm p-4">
          <CardTitle className="text-[#245757] text-lg font-semibold mb-2">Financeiro</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-500">Entradas</p>
              <p className="text-xl font-bold text-[#245757]">R$ {totalEntradas.toLocaleString("pt-BR",{minimumFractionDigits:2})}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-500">Saídas</p>
              <p className="text-xl font-bold text-[#245757]">R$ {totalSaidas.toLocaleString("pt-BR",{minimumFractionDigits:2})}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-500">Lucro Líquido</p>
              <p className="text-xl font-bold text-[#245757]">R$ {totalLucroLiquido.toLocaleString("pt-BR",{minimumFractionDigits:2})} ({percentualLucro}%)</p>
            </div>
          </div>
        </Card>

{/* PRODUTOS MAIS VENDIDOS */}
        <Card className="shadow-sm p-4">
          <CardTitle className="text-[#245757] text-lg font-semibold mb-2">Produtos mais vendidos</CardTitle>
          <div className="space-y-2">
            {produtosMaisVendidos.map((p,i)=>(<div key={i} className="flex justify-between text-[#245757] font-bold p-2 rounded bg-[#a0c0c0]"><span>{p.produto}</span><span>{p.qtd} vendas</span></div>))}
          </div>
        </Card>

{/* UNIDADES EM DESTAQUE */}
        <Card className="shadow-sm p-4">
          <CardTitle className="text-[#245757] text-lg font-semibold mb-2">Unidades em Destaque</CardTitle>
          <div className="space-y-2">
            {unidadesDestaque.map((u,i)=>(<div key={i} className="flex justify-between text-[#245757] font-bold p-2 rounded bg-[#a0c0c0]"><span>{u.unidade}</span><span>{u.vendas} vendas</span></div>))}
          </div>
        </Card>

{/* GRÁFICOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="shadow-sm p-4">
            <CardTitle className="text-[#245757] text-lg font-semibold mb-2">Evolução Vendas</CardTitle>
            <CardContent style={{height:250}}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graficoEvolucao}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="vendas" stroke="#245757" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm p-4">
            <CardTitle className="text-[#245757] text-lg font-semibold mb-2">Produtos Mais Vendidos</CardTitle>
            <CardContent style={{height:250}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={graficoProdutos}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="vendas" fill="#245757" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
