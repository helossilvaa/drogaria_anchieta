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

  const [totalEntradas, setTotalEntradas] = useState(0);
  const [totalSaidas, setTotalSaidas] = useState(0);
  const [totalLucroLiquido, setTotalLucroLiquido] = useState(0);

  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroMovimento, setFiltroMovimento] = useState("");

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

  const saldo = totalLucroLiquido;

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">

        {/* SALDO */}
        <div className="p-4 flex flex-col border rounded-xl bg-muted/50">
          <span className="text-gray-900 font-semibold">Saldo</span>
          <span className={`font-bold text-3xl ${saldo >= 0 ? "text-green-700" : "text-red-700"}`}>
            R$ {saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>

          <button
            onClick={() => { setAbrirModal(true); setEditarId(null); setNovaTransacao(estadoInicial); }}
            className="mt-3 inline-flex items-center gap-2 bg-[#2d4b47] text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-[#24403d] transition ml-auto"
          >
            + Nova Transação
          </button>
        </div>

        {/* CARDS */}
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="bg-muted/50 p-4 rounded-xl flex flex-col">
            <span className="text-gray-700 font-semibold">Entradas</span>
            <span className="text-green-700 font-bold text-2xl">
              R$ {totalEntradas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-muted/50 p-4 rounded-xl flex flex-col">
            <span className="text-gray-700 font-semibold">Saídas</span>
            <span className="text-red-700 font-bold text-2xl">
              R$ {totalSaidas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-muted/50 p-4 rounded-xl flex flex-col">
            <span className="text-gray-700 font-semibold">Lucro Líquido Total</span>
            <span className="text-blue-700 font-bold text-2xl">
              R$ {totalLucroLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* FILTROS — idêntico aos de fornecedores */}
        <div className="flex gap-4 flex-wrap items-center mt-2">
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-60 focus:outline-none focus:ring-2 focus:ring-[#2d4b47]"
          >
            <option value="">Categoria</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.categoria_transacao}</option>
            ))}
          </select>

          <select
            value={filtroMovimento}
            onChange={(e) => setFiltroMovimento(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-60 focus:outline-none focus:ring-2 focus:ring-[#2d4b47]"
          >
            <option value="">Tipo Movimento</option>
            <option value="ENTRADA">Entrada</option>
            <option value="SAIDA">Saída</option>
          </select>
        </div>

        {/* TABELA — idêntica ao módulo de fornecedores */}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-[#2d4b47] text-white text-left text-sm font-semibold rounded-t-lg">
                <th className="py-3 px-4 rounded-tl-lg">ID</th>
                <th className="py-3 px-4">Unidade</th>
                <th className="py-3 px-4">Ano</th>
                <th className="py-3 px-4">Mês</th>
                <th className="py-3 px-4">Entradas</th>
                <th className="py-3 px-4">Saídas</th>
                <th className="py-3 px-4">Lucro Líquido</th>
                <th className="py-3 px-4">Data Transferência</th>
                <th className="py-3 px-4">Movimento</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4 rounded-tr-lg text-center">Ações</th>
              </tr>
            </thead>

            <tbody className="text-sm text-gray-900">
              {paginadas.map((t) => (
                <tr key={t.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">{t.id}</td>
                  <td className="py-3 px-4">{t.unidade_id}</td>
                  <td className="py-3 px-4">{t.ano}</td>
                  <td className="py-3 px-4">{t.mes}</td>
                  <td className="py-3 px-4">{Number(t.entradas).toFixed(2)}</td>
                  <td className="py-3 px-4">{Number(t.saidas).toFixed(2)}</td>
                  <td className="py-3 px-4">{Number(t.lucro_liquido).toFixed(2)}</td>
                  <td className="py-3 px-4">
                    {new Date(t.data_transferencia).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="py-3 px-4">{t.tipo_movimento}</td>
                  <td className="py-3 px-4">{t.categoria_nome}</td>

                  <td className="p-2 text-center flex gap-2 justify-center">
                    <button
                    onClick={() => handleEditar(u)}
                    className="text-gray-700 hover:text-[#245757]"
                    title="Editar"
                  >
                    <svg
                      className="w-6 h-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleExcluir(u.id)}
                    className="text-red-700 hover:text-red-900"
                    title="Excluir"
                  >
                    <svg
                      className="w-6 h-6 text-red-600 dark:text-white"
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

              {paginadas.length === 0 && (
                <tr>
                  <td colSpan="11" className="text-center py-4 text-gray-600">
                    Nenhuma transação encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINAÇÃO — igual fornecedores */}
        <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
          <button
            onClick={() => setPaginaAtual(paginaAtual - 1)}
            disabled={paginaAtual === 1}
            className={`px-3 py-1 rounded-md border border-[#2d4b47] text-[#2d4b47] hover:bg-[#2d4b47] hover:text-white transition ${
              paginaAtual === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Anterior
          </button>

          {[...Array(totalPaginas)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setPaginaAtual(i + 1)}
              className={`px-3 py-1 rounded-md border border-[#2d4b47] transition ${
                paginaAtual === i + 1
                  ? "bg-[#2d4b47] text-white cursor-default"
                  : "text-[#2d4b47] hover:bg-[#2d4b47] hover:text-white"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setPaginaAtual(paginaAtual + 1)}
            disabled={paginaAtual === totalPaginas}
            className={`px-3 py-1 rounded-md border border-[#2d4b47] text-[#2d4b47] hover:bg-[#2d4b47] hover:text-white transition ${
              paginaAtual === totalPaginas ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Próximo
          </button>
        </div>

        {/* MODAL — igual fornecedores */}
        {abrirModal && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">

              <h2 className="text-xl mb-4 font-bold text-[#2d4b47]">
                {editarId ? "Editar Transação" : "Nova Transação"}
              </h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  type="number"
                  name="unidade_id"
                  value={novaTransacao.unidade_id}
                  onChange={handleChange}
                  placeholder="Unidade ID"
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#2d4b47]"
                  required
                />

                <input
                  type="number"
                  name="ano"
                  value={novaTransacao.ano}
                  onChange={handleChange}
                  placeholder="Ano"
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#2d4b47]"
                  required
                />

                <input
                  type="number"
                  name="mes"
                  value={novaTransacao.mes}
                  onChange={handleChange}
                  placeholder="Mês"
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#2d4b47]"
                  required
                />

                <input
                  type="number"
                  name="entradas"
                  value={novaTransacao.entradas}
                  onChange={handleChange}
                  placeholder="Entradas"
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#2d4b47]"
                />

                <input
                  type="number"
                  name="saidas"
                  value={novaTransacao.saidas}
                  onChange={handleChange}
                  placeholder="Saídas"
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#2d4b47]"
                />

                <input
                  type="number"
                  name="lucro_liquido"
                  value={novaTransacao.lucro_liquido}
                  onChange={handleChange}
                  placeholder="Lucro Líquido"
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#2d4b47]"
                />

                <input
                  type="datetime-local"
                  name="data_transferencia"
                  value={novaTransacao.data_transferencia}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#2d4b47]"
                />

                <select
                  name="tipo_movimento"
                  value={novaTransacao.tipo_movimento}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#2d4b47]"
                  required
                >
                  <option value="">Tipo Movimento</option>
                  <option value="ENTRADA">Entrada</option>
                  <option value="SAIDA">Saída</option>
                </select>

                <select
                  name="categoria_transacao_id"
                  value={novaTransacao.categoria_transacao_id}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#2d4b47]"
                  required
                >
                  <option value="">Categoria</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>{c.categoria_transacao}</option>
                  ))}
                </select>

                <div className="flex justify-end mt-6 gap-3">
                  <button
                    type="button"
                    onClick={() => setAbrirModal(false)}
                    className="px-4 py-2 rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400 transition"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md bg-[#2d4b47] text-white hover:bg-[#24403d] transition"
                  >
                    Salvar
                  </button>
                </div>
              </form>

              <button
                onClick={() => setAbrirModal(false)}
                className="absolute top-3 right-3 text-[#2d4b47] hover:text-[#24403d] text-2xl font-bold"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* MODAL EXCLUSÃO */}
        {abrirModalExcluir && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl mb-4 font-bold text-[#2d4b47]">Confirmar Exclusão</h2>

              <p>Tem certeza que deseja excluir esta transação?</p>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setAbrirModalExcluir(false)}
                  className="px-4 py-2 rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400 transition"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleExcluir}
                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
