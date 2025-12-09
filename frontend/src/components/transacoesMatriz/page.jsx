"use client";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";

export default function TransacoesMatriz() {
  const estadoInicial = {
    unidade_id: "",
    ano: new Date().getFullYear(),
    mes: new Date().getMonth() + 1,
    entradas: 0,
    saidas: 0,
    lucro_liquido: 0,
    data_transferencia: "",
    tipo_movimento: "",
    categoria_transacao_id: "",
  };

  const [transacoes, setTransacoes] = useState([]);
  const [novaTransacao, setNovaTransacao] = useState(estadoInicial);
  const [categorias, setCategorias] = useState([]);
  const [abrirModal, setAbrirModal] = useState(false);
  const [editarId, setEditarId] = useState(null);
  const [abrirModalExcluir, setAbrirModalExcluir] = useState(false);
  const [excluirId, setExcluirId] = useState(null);

  // Totais
  const [totalEntradas, setTotalEntradas] = useState(0);
  const [totalSaidas, setTotalSaidas] = useState(0);
  const [totalLucroLiquido, setTotalLucroLiquido] = useState(0);

  // Filtros
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroMovimento, setFiltroMovimento] = useState("");

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 15;

  const API = "http://localhost:8080/api/transacoes-matriz";
  const API_CATEGORIA = "http://localhost:8080/api/categoria-transacoes";

  useEffect(() => {
    fetchTransacoes();
    fetchCategorias();
  }, []);

  const fetchTransacoes = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTransacoes(Array.isArray(data.transacoes) ? data.transacoes : []);
      
      setTotalEntradas(
        (data.transacoes || []).reduce((acc, t) => acc + Number(t.entradas || 0), 0)
      );
      setTotalSaidas(
        (data.transacoes || []).reduce((acc, t) => acc + Number(t.saidas || 0), 0)
      );
      setTotalLucroLiquido(
        (data.transacoes || []).reduce((acc, t) => acc + Number(t.lucro_liquido || 0), 0)
      );
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCategorias = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_CATEGORIA, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCategorias(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["entradas", "saidas", "lucro_liquido"].includes(name)) {
      const novoValor = value.replace(/[^\d.]/g, "");
      setNovaTransacao({ ...novaTransacao, [name]: novoValor });
      return;
    }

    setNovaTransacao({ ...novaTransacao, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editarId ? "PUT" : "POST";
    const url = editarId ? `${API}/${editarId}` : API;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(novaTransacao),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      alert("Transação salva com sucesso!");
      fetchTransacoes();
      setAbrirModal(false);
      setNovaTransacao(estadoInicial);
      setEditarId(null);
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar transação");
    }
  };

  const handleExcluir = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API}/${excluirId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Excluído com sucesso!");
      setAbrirModalExcluir(false);
      fetchTransacoes();
    } catch (e) {
      console.error(e);
    }
  };

  // Filtrar
  const filtradas = transacoes.filter((t) => {
    return (
      (!filtroCategoria || t.categoria_transacao_id == filtroCategoria) &&
      (!filtroMovimento || t.tipo_movimento === filtroMovimento)
    );
  });

  const indexUltimo = paginaAtual * itensPorPagina;
  const indexPrimeiro = indexUltimo - itensPorPagina;
  const paginadas = filtradas.slice(indexPrimeiro, indexUltimo);
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / itensPorPagina));

  const abrirNovaTransacao = () => {
    setNovaTransacao(estadoInicial);
    setEditarId(null);
    setAbrirModal(true);
  };

  const saldo = totalLucroLiquido;

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="p-4 flex flex-col">
          <span className="text-gray-900 font-semibold">Saldo</span>
          <span className={`font-bold text-3xl ${saldo >= 0 ? "text-green-700" : "text-red-700"}`}>
            R$ {saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <button onClick={abrirNovaTransacao} className="px-4 py-2 bg-blue-600 text-white rounded ml-auto">
            + Nova Transação
          </button>
        </div>

        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="bg-muted/50 aspect-video rounded-xl">
            <span className="text-gray-700 font-semibold">Entradas</span>
            <span className="text-green-700 font-bold text-2xl">
              R$ {totalEntradas.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="bg-muted/50 aspect-video rounded-xl">
            <span className="text-gray-700 font-semibold">Saídas</span>
            <span className="text-red-700 font-bold text-2xl">
              R$ {totalSaidas.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="bg-muted/50 aspect-video rounded-xl">
            <span className="text-gray-700 font-semibold">Lucro Líquido Total</span>
            <span className="text-blue-700 font-bold text-2xl">
              R$ {totalLucroLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-4 flex-wrap items-center mb-5">
          <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="border p-2 rounded w-60">
            <option value="">Categoria</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.categoria_transacao}
              </option>
            ))}
          </select>

          <select value={filtroMovimento} onChange={(e) => setFiltroMovimento(e.target.value)} className="border p-2 rounded w-60">
            <option value="">Tipo Movimento</option>
            <option value="ENTRADA">Entrada</option>
            <option value="SAIDA">Saída</option>
          </select>
        </div>

        {/* Tabela */}
        <table className="w-full border-collapse table-auto">
          <thead>
            <tr className="bg-[#245757] text-white">
              <th className="p-2">ID</th>
              <th className="p-2">Unidade</th>
              <th className="p-2">Ano</th>
              <th className="p-2">Mês</th>
              <th className="p-2">Entradas</th>
              <th className="p-2">Saídas</th>
              <th className="p-2">Lucro Líquido</th>
              <th className="p-2">Data Transferência</th>
              <th className="p-2">Movimento</th>
              <th className="p-2">Categoria</th>
              <th className="p-2">Ações</th>
            </tr>
          </thead>

          <tbody>
            {paginadas.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="p-2">{t.id}</td>
                <td className="p-2">{t.unidade_id}</td>
                <td className="p-2">{t.ano}</td>
                <td className="p-2">{t.mes}</td>
                <td className="p-2">{Number(t.entradas).toFixed(2)}</td>
                <td className="p-2">{Number(t.saidas).toFixed(2)}</td>
                <td className="p-2">{Number(t.lucro_liquido).toFixed(2)}</td>
                <td className="p-2">{new Date(t.data_transferencia).toLocaleDateString("pt-BR")}</td>
                <td className="p-2">{t.tipo_movimento}</td>
                <td className="p-2">{t.categoria_nome}</td>
                <td className="flex gap-2 p-2">
                  <button
                    className="text-blue-600"
                    onClick={() => {
                      setEditarId(t.id);
                      setNovaTransacao({ ...t });
                      setAbrirModal(true);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="text-red-600"
                    onClick={() => {
                      setExcluirId(t.id);
                      setAbrirModalExcluir(true);
                    }}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Paginação */}
        <div className="flex gap-2 justify-center mt-4">
          <button onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))} className="border px-3 py-1 rounded" disabled={paginaAtual === 1}>
            Anterior
          </button>

          {[...Array(totalPaginas)].map((_, i) => (
            <button key={i} onClick={() => setPaginaAtual(i + 1)} className={`px-3 py-1 rounded ${paginaAtual === i + 1 ? "bg-gray-300" : "border"}`}>
              {i + 1}
            </button>
          ))}

          <button onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))} className="border px-3 py-1 rounded" disabled={paginaAtual === totalPaginas}>
            Próxima
          </button>
        </div>

        {/* Modal Criar/Editar */}
        {abrirModal && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg relative">
              <h2 className="text-xl font-bold mb-4">{editarId ? "Editar Transação" : "Nova Transação"}</h2>
              <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                <input type="number" name="unidade_id" value={novaTransacao.unidade_id} onChange={handleChange} placeholder="Unidade ID" className="border p-2 rounded" required />
                <input type="number" name="ano" value={novaTransacao.ano} onChange={handleChange} placeholder="Ano" className="border p-2 rounded" required />
                <input type="number" name="mes" value={novaTransacao.mes} onChange={handleChange} placeholder="Mês" className="border p-2 rounded" required />
                <input type="number" step="0.01" name="entradas" value={novaTransacao.entradas} onChange={handleChange} placeholder="Entradas" className="border p-2 rounded" />
                <input type="number" step="0.01" name="saidas" value={novaTransacao.saidas} onChange={handleChange} placeholder="Saídas" className="border p-2 rounded" />
                <input type="number" step="0.01" name="lucro_liquido" value={novaTransacao.lucro_liquido} onChange={handleChange} placeholder="Lucro Líquido" className="border p-2 rounded" />
                <input type="datetime-local" name="data_transferencia" value={novaTransacao.data_transferencia} onChange={handleChange} className="border p-2 rounded" />
                <select name="tipo_movimento" value={novaTransacao.tipo_movimento} onChange={handleChange} className="border p-2 rounded" required>
                  <option value="">Tipo Movimento</option>
                  <option value="ENTRADA">Entrada</option>
                  <option value="SAIDA">Saída</option>
                </select>
                <select name="categoria_transacao_id" value={novaTransacao.categoria_transacao_id} onChange={handleChange} className="border p-2 rounded" required>
                  <option value="">Categoria</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.categoria_transacao}
                    </option>
                  ))}
                </select>
                <button className="bg-green-600 text-white p-2 rounded">Salvar</button>
              </form>
              <button onClick={() => setAbrirModal(false)} className="absolute top-3 right-5 text-red-600 text-2xl">×</button>
            </div>
          </div>
        )}

        {/* Modal Excluir */}
        {abrirModalExcluir && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Confirmar Exclusão</h2>
              <div className="flex justify-end gap-4 mt-4">
                <button className="p-2 bg-gray-300 rounded" onClick={() => setAbrirModalExcluir(false)}>Cancelar</button>
                <button className="p-2 bg-red-600 text-white rounded" onClick={handleExcluir}>Excluir</button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
      </div>
    </>
  );
}
