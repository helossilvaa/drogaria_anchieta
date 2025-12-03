"use client";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";

export default function Transacoes() {
  const estadoInicial = {
    data_lancamento: "",
    tipo_movimento: "",
    valor: "",
    descricao: "",
    unidade_id: "",
    categoria_transacao_id: "",
    origem: "",
  };

  const [transacoes, setTransacoes] = useState([]);
  const [novaTransacao, setNovaTransacao] = useState(estadoInicial);
  const [categorias, setCategorias] = useState([]);

  const [abrirModal, setAbrirModal] = useState(false);
  const [editarId, setEditarId] = useState(null);
  const [abrirModalExcluir, setAbrirModalExcluir] = useState(false);
  const [excluirId, setExcluirId] = useState(null);

  // 🔍 Filtros (padrão contas)
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroOrigem, setFiltroOrigem] = useState("");
  const [filtroMovimento, setFiltroMovimento] = useState("");

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 15;


  const API = "http://localhost:8080/api/transacoes";
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
      setTransacoes(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCategorias = async () => {
    try {
      const res = await fetch(API_CATEGORIA);
      const data = await res.json();
      setCategorias(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "valor") {
      const novoValor = value.replace(/[^\d.]/g, "");
      setNovaTransacao({
        ...novaTransacao,
        [name]: novoValor,
      });
      return;
    }

    setNovaTransacao({
      ...novaTransacao,
      [name]: value,
    });
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

  // ✅ FILTRO IGUAL AO DE CONTAS
  const filtradas = transacoes.filter((t) => {
    return (
      (!filtroCategoria || t.categoria_transacao_id == filtroCategoria) &&
      (!filtroOrigem ||
        t.origem?.toLowerCase().includes(filtroOrigem.toLowerCase())) &&
      (!filtroMovimento || t.tipo_movimento === filtroMovimento)
    );
  });

  const indexUltimo = paginaAtual * itensPorPagina;
  const indexPrimeiro = indexUltimo - itensPorPagina;
  const paginadas = filtradas.slice(indexPrimeiro, indexUltimo);
  const totalPaginas = Math.ceil(filtradas.length / itensPorPagina);

  const abrirNovaTransacao = () => {
    setNovaTransacao(estadoInicial);
    setEditarId(null);
    setAbrirModal(true);
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
          </div>

        {/* ✅ FILTROS (PADRÃO CONTAS) */}
        <div className="flex gap-4 flex-wrap items-center mb-5">

          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="border p-2 rounded w-60"
          >
            <option value="">Categoria</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.categoria_transacao}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Origem"
            value={filtroOrigem}
            onChange={(e) => setFiltroOrigem(e.target.value)}
            className="border p-2 rounded w-60"
          />

          <select
            value={filtroMovimento}
            onChange={(e) => setFiltroMovimento(e.target.value)}
            className="border p-2 rounded w-60"
          >
            <option value="">Tipo Movimento</option>
            <option value="ENTRADA">Entrada</option>
            <option value="SAIDA">Saída</option>
          </select>

          <button
            onClick={abrirNovaTransacao}
            className="px-4 py-2 bg-blue-600 text-white rounded ml-auto"
          >
            + Nova Transação
          </button>
        </div>

        {/* ✅ TABELA */}
        <table className="w-full border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-[#245757] text-white">
              <th className="p-2">ID</th>
              <th className="p-2">Categoria</th>
              <th className="p-2">Data</th>
              <th className="p-2">Movimento</th>
              <th className="p-2">Valor</th>
              <th className="p-2">Descrição</th>
              <th className="p-2">Origem</th>
              <th className="p-2">Ações</th>
            </tr>
          </thead>

          <tbody>
            {paginadas.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="p-2">{t.id}</td>
                <td className="p-2">{t.categoria_nome}</td>
                <td className="p-2">{t.data_lancamento}</td>
                <td className="p-2">{t.tipo_movimento}</td>
                <td className="p-2">
                  R$ {Number(t.valor).toFixed(2)}
                </td>
                <td className="p-2">{t.descricao}</td>
                <td className="p-2">{t.origem}</td>

                <td className="flex gap-2 p-2">
                  <button
                    className="text-blue-600"
                    onClick={() => {
                      setEditarId(t.id);
                      setNovaTransacao(t);
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

        {/* ✅ PAGINAÇÃO */}
        <div className="flex gap-2 justify-center mt-4">
          <button
            onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
            className="border px-3 py-1 rounded"
          >
            Anterior
          </button>

          {[...Array(totalPaginas)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPaginaAtual(i + 1)}
              className={`px-3 py-1 rounded ${
                paginaAtual === i + 1 ? "bg-gray-300" : "border"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() =>
              setPaginaAtual((p) => Math.min(totalPaginas, p + 1))
            }
            className="border px-3 py-1 rounded"
          >
            Próxima
          </button>
        </div>

        {/* ✅ MODAL PADRÃO CONTAS */}
        {abrirModal && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg relative">

              <h2 className="text-xl font-bold mb-4">
                {editarId ? "Editar Transação" : "Nova Transação"}
              </h2>

              <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                <input
                  type="datetime-local"
                  name="data_lancamento"
                  value={novaTransacao.data_lancamento}
                  onChange={handleChange}
                  className="border rounded p-2"
                  required
                />

                <select
                  name="tipo_movimento"
                  value={novaTransacao.tipo_movimento}
                  onChange={handleChange}
                  className="border p-2 rounded"
                  required
                >
                  <option value="">Tipo Movimento</option>
                  <option value="ENTRADA">Entrada</option>
                  <option value="SAIDA">Saída</option>
                </select>

                <input
                  type="number"
                  step="0.01"
                  name="valor"
                  value={novaTransacao.valor}
                  onChange={handleChange}
                  className="border p-2 rounded"
                  placeholder="Valor"
                  required
                />

                <textarea
                  name="descricao"
                  value={novaTransacao.descricao}
                  onChange={handleChange}
                  className="border p-2 rounded"
                  placeholder="Descrição"
                />

                <input
                  name="origem"
                  value={novaTransacao.origem}
                  onChange={handleChange}
                  className="border p-2 rounded"
                  placeholder="Origem"
                />

                <button className="bg-green-600 text-white p-2 rounded">
                  Salvar
                </button>
              </form>

              <button
                onClick={() => setAbrirModal(false)}
                className="absolute top-3 right-5 text-red-600 text-2xl"
              >
                ×
              </button>

            </div>
          </div>
        )}

        {/* ✅ MODAL EXCLUIR PADRÃO */}
        {abrirModalExcluir && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">

              <h2 className="text-xl font-bold mb-4">
                Confirmar Exclusão
              </h2>

              <div className="flex justify-end gap-4 mt-4">
                <button
                  className="p-2 bg-gray-300 rounded"
                  onClick={() => setAbrirModalExcluir(false)}
                >
                  Cancelar
                </button>

                <button
                  className="p-2 bg-red-600 text-white rounded"
                  onClick={handleExcluir}
                >
                  Excluir
                </button>
              </div>

            </div>
          </div>
        )}
      <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
      </div>
    </>
  );
}
