"use client";
import { useState, useEffect } from "react";

export default function Salarios() {
  const estadoInicialSalario = {
    id_funcionario: "",
    registro: "",
    nome: "",
    departamento_id: "",
    unidade_id: "",
    valor: "",
    status_pagamento: "pendente",
    data_atualizado: "",
  };

  const [abrirModal, setAbrirModal] = useState(false);
  const [salarios, setSalarios] = useState([]);
  const [novoSalario, setNovoSalario] = useState(estadoInicialSalario);
  const [editarSalarioId, setEditarSalarioId] = useState(null);
  const [abrirModalExcluir, setAbrirModalExcluir] = useState(false);
  const [pesquisa, setPesquisa] = useState("");
  const [departamentos, setDepartamentos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [filtroUnidade, setFiltroUnidade] = useState("");
  const [filtroDepartamento, setFiltroDepartamento] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 15;

  const API_URL = "http://localhost:8080/api/salarios";

  const formatarValor = (valorString) => {
    const valorLimpo =
      valorString?.toString().replace(/[^\d.,-]/g, "").replace(",", ".") || "0";
    const valorNumerico = parseFloat(valorLimpo);
    if (isNaN(valorNumerico)) return valorString;
    return valorNumerico.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getNomeDepartamento = (id) => {
    const depto = departamentos.find((d) => String(d.id) === String(id));
    return depto ? depto.nome || depto.departamento : id;
  };

  const getNomeUnidade = (id) => {
    const unidade = unidades.find((u) => String(u.id) === String(id));
    return unidade ? unidade.nome : id;
  };

  const fetchSalarios = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSalarios(Array.isArray(data) ? data : []);
    } catch {
      setSalarios([]);
    }
  };

  const carregarListas = async () => {
    try {
      const token = localStorage.getItem("token");
      const [resDepartamentos, resFuncionarios, resUnidades] = await Promise.all([
        fetch("http://localhost:8080/departamento", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:8080/funcionarios", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:8080/unidade", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setDepartamentos(await resDepartamentos.json());
      setFuncionarios(await resFuncionarios.json());
      setUnidades(await resUnidades.json());
    } catch {
      setDepartamentos([]);
      setFuncionarios([]);
      setUnidades([]);
    }
  };

  const salariosFiltrados = salarios.filter((s) => {
    const termo = pesquisa.toLowerCase();

    const passaPesquisa =
      !pesquisa ||
      (s.funcionario && s.funcionario.toLowerCase().includes(termo)) ||
      (s.registro && String(s.registro).includes(termo));

    const passaUnidade =
      !filtroUnidade || String(s.unidade_id) === String(filtroUnidade);

    const passaDepartamento =
      !filtroDepartamento || String(s.departamento_id) === String(filtroDepartamento);

    return passaPesquisa && passaUnidade && passaDepartamento;
  });

  const indexUltimo = paginaAtual * itensPorPagina;
  const indexPrimeiro = indexUltimo - itensPorPagina;
  const salariosPagina = salariosFiltrados.slice(indexPrimeiro, indexUltimo);
  const totalPaginas = Math.ceil(salariosFiltrados.length / itensPorPagina);

  useEffect(() => {
    setPaginaAtual(1);
  }, [pesquisa, filtroUnidade, filtroDepartamento]);

  useEffect(() => {
    fetchSalarios();
    carregarListas();
  }, []);

  return (
    <>
      {/* FILTROS → Busca + Unidade + Departamento */}
      <div className="flex items-end gap-4 mt-4 flex-wrap">

        {/* BUSCA */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">Pesquisar</label>
          <input
            type="text"
            className="border rounded-lg px-4 py-2 text-sm focus:ring-[#245757]"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />
        </div>

        {/* FILTRO UNIDADE */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">Unidade</label>
          <select
            className="border rounded-lg px-4 py-2 text-sm focus:ring-[#245757]"
            value={filtroUnidade}
            onChange={(e) => setFiltroUnidade(e.target.value)}
          >
            <option value="">Todas</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>{u.nome}</option>
            ))}
          </select>
        </div>

        {/* FILTRO DEPARTAMENTO */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">Departamento</label>
          <select
            className="border rounded-lg px-4 py-2 text-sm focus:ring-[#245757]"
            value={filtroDepartamento}
            onChange={(e) => setFiltroDepartamento(e.target.value)}
          >
            <option value="">Todos</option>

            {/* 🔥 NÃO mostrar o departamento 4 */}
            {departamentos
              .filter((d) => String(d.id) !== "4")
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nome || d.departamento}
                </option>
              ))}
          </select>
        </div>

        <button onClick={() => setAbrirModal(true)} className="h-[42px] bg-blue-500 text-white px-4 rounded-lg">
          Novo Salário
        </button>
      </div>

      {/* MODAL ADICIONAR / EDITAR */}
      {abrirModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl mb-3 font-bold">{editarSalarioId ? "Editar Salário" : "Novo Salário"}</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* REGISTRO */}
              <label htmlFor="registro" className="block">Registro</label>
              <input
                id="registro"
                name="registro"
                list="listaRegistros"
                value={novoSalario.registro || ""}
                onChange={(e) => {
                  if (editarSalarioId) return;
                  const valor = e.target.value;
                  const funcionarioSelecionado = funcionarios.find((u) => String(u.registro) === String(valor));
                  setNovoSalario((prev) => ({
                    ...prev,
                    registro: valor,
                    id_funcionario: funcionarioSelecionado?.id || "",
                    nome: funcionarioSelecionado?.nome || "",
                    departamento_id: funcionarioSelecionado?.departamento_id || "",
                    unidade_id: funcionarioSelecionado?.unidade_id || "",
                  }));
                }}
                disabled={!!editarSalarioId}
                className="border rounded-md p-2 w-full"
                placeholder="Digite ou selecione o registro"
              />
              <datalist id="listaRegistros">
                {funcionarios.map((f) => (
                  <option key={`r-${f.id}`} value={f.registro}>{f.registro} - {f.nome}</option>
                ))}
              </datalist>

              {/* FUNCIONÁRIO */}
              <label htmlFor="nome" className="block">Funcionário</label>
              <input
                id="nome"
                name="nome"
                list="listaFuncionarios"
                value={novoSalario.nome || ""}
                onChange={(e) => {
                  if (editarSalarioId) return;
                  const valor = e.target.value;
                  const funcionarioSelecionado = funcionarios.find((u) => String(u.nome) === String(valor));
                  setNovoSalario((prev) => ({
                    ...prev,
                    nome: valor,
                    id_funcionario: funcionarioSelecionado?.id || "",
                    registro: funcionarioSelecionado?.registro || "",
                    departamento_id: funcionarioSelecionado?.departamento_id || "",
                    unidade_id: funcionarioSelecionado?.unidade_id || "",
                  }));
                }}
                disabled={!!editarSalarioId}
                className="border rounded-md p-2 w-full"
                placeholder="Digite ou selecione o funcionário"
              />
              <datalist id="listaFuncionarios">
                {funcionarios.map((f) => (
                  <option key={`n-${f.id}`} value={f.nome}>{f.registro} - {f.nome}</option>
                ))}
              </datalist>

              {/* UNIDADE */}
              <div className="flex flex-col w-full max-w-xs">
                <label className="text-sm font-medium text-gray-600">Filtrar por Unidade</label>
                <select
                  className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#245757]"
                  value={filtroUnidade}
                  onChange={(e) => {
                    setFiltroUnidade(e.target.value);
                    setPaginaAtual(1);
                  }}
                >
                  <option value="">Todas</option>
                  {unidades.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* DEPARTAMENTO (apenas para exibir) */}
              <div>
                <label className="block">Departamento</label>
                <input readOnly value={getNomeDepartamento(novoSalario.departamento_id) || ""} className="border rounded-md p-2 w-full bg-gray-50" />
              </div>

              <div>
                <label htmlFor="valor" className="block">Valor</label>
                <input id="valor" name="valor" type="text" onChange={handleChange} value={novoSalario.valor} className="border rounded-md p-2 w-full" required />
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <label className="block font-medium text-gray-700">Status</label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="status_pagamento" value="pendente" checked={novoSalario.status_pagamento === "pendente"} onChange={handleChange} className="w-4 h-4" />
                    <span>Pendente</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="status_pagamento" value="pago" checked={novoSalario.status_pagamento === "pago"} onChange={handleChange} className="w-4 h-4" />
                    <span>Pago</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <button type="submit" className="bg-green-600 text-white rounded-md p-2">Salvar</button>
              </div>
            </form>

            <button onClick={() => { setAbrirModal(false); setEditarSalarioId(null); setNovoSalario(estadoInicialSalario); }} className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl" aria-label="Fechar modal">&times;</button>
          </div>
        </div>
      )}

      {/* MODAL EXCLUSÃO */}
      {abrirModalExcluir && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl mb-4 font-bold">Confirmar Exclusão</h2>
            <p>Tem certeza que deseja excluir este salário?</p>
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => setAbrirModalExcluir(false)} className="bg-gray-300 px-4 py-2 rounded-md">Cancelar</button>
              <button onClick={confirmarExcluir} className="bg-red-600 text-white px-4 py-2 rounded-md">Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* TABELA */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-[#245757] text-left text-white rounded-t-lg">
              <th className="p-2">Registro</th>
              <th className="p-2">Funcionário</th>
              <th className="p-2">Departamento</th>
              <th className="p-2">Unidade</th>
              <th className="p-2">Valor</th>
              <th className="p-2">Status</th>
              <th className="p-2">Dia do Pagamento</th>
              <th className="p-2 rounded-tr-lg">Ações</th>
            </tr>
          </thead>

          <tbody>
            {salariosPagina.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{u.registro}</td>
                <td className="p-2">{u.funcionario}</td>
                <td className="p-2">{getNomeDepartamento(u.departamento_id)}</td>
                <td className="p-2">{getNomeUnidade(u.unidade_id)}</td>
                <td className="p-2">{formatarValor(u.valor)}</td>

                <td className="p-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${u.status_pagamento === "pendente" ? "bg-[#245757]/20 text-[#245757]" : "bg-gray-300 text-gray-700"}`}>
                    {u.status_pagamento === "pendente" ? "Pendente" : "Pago"}
                  </span>
                </td>

                <td className="p-2">{u.data_atualizado ? new Date(u.data_atualizado).toLocaleDateString("pt-BR") : ""}</td>

                <td className="p-2 text-center flex gap-2 justify-center">
                  <button onClick={() => handleEditar(u)} className="text-gray-700 hover:text-[#245757]" title="Editar">
                    <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z" />
                    </svg>
                  </button>

                  <button onClick={() => handleExcluir(u.id)} className="text-red-700 hover:text-red-900" title="Excluir">
                    <svg className="w-6 h-6 text-red-600 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z" clipRule="evenodd" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4 select-none">
            <button onClick={() => mudarPagina(paginaAtual - 1)} disabled={paginaAtual === 1} className="px-3 py-1 border rounded disabled:opacity-50">&lt; Anterior</button>
            {[...Array(totalPaginas)].map((_, i) => {
              const numeroPagina = i + 1;
              return (
                <button key={numeroPagina} onClick={() => mudarPagina(numeroPagina)} className={`px-3 py-1 border rounded ${paginaAtual === numeroPagina ? "bg-blue-300" : ""}`}>{numeroPagina}</button>
              );
            })}
            <button onClick={() => mudarPagina(paginaAtual + 1)} disabled={paginaAtual === totalPaginas} className="px-3 py-1 border rounded disabled:opacity-50">Próxima &gt;</button>
          </div>
        )}
      </div>
    </>
  );
}
