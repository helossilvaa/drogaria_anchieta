"use client";
import { useState, useEffect } from "react";

export default function Salarios() {
  const estadoInicialSalario = {
    id_funcionario: "",
    setor_id: "",
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
  const [excluirSalarioId, setExcluirSalarioId] = useState(null);
  const [abrirModalExcluir, setAbrirModalExcluir] = useState(false);

  // listas para selects
  const [setores, setSetores] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  // filtros 
  const [filtroMes, setFiltroMes] = useState(""); // formato YYYY-MM
  const [filtroDepartamento, setFiltroDepartamento] = useState("");

  // paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 15;

  const API_URL = "http://localhost:8080/api/salarios";
  const API_BASE = "http://localhost:8080/api";

  // util: data para input date
  const toInputDate = (dataString) => {
    if (!dataString) return "";
    try {
      if (dataString.match(/^\d{4}-\d{2}-\d{2}$/)) return dataString;
      const data = new Date(dataString);
      if (isNaN(data.getTime())) return "";
      const ano = data.getUTCFullYear();
      const mes = String(data.getUTCMonth() + 1).padStart(2, "0");
      const dia = String(data.getUTCDate()).padStart(2, "0");
      return `${ano}-${mes}-${dia}`;
    } catch {
      return "";
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return "";
    try {
      let data;
      if (dataString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [ano, mes, dia] = dataString.split("-").map(Number);
        data = new Date(Date.UTC(ano, mes - 1, dia));
      } else {
        data = new Date(dataString);
      }
      if (isNaN(data.getTime())) return dataString;
      const opcoes = { day: "2-digit", month: "short", year: "numeric" };
      let dataFormatada = data.toLocaleDateString("pt-BR", opcoes);
      dataFormatada = dataFormatada.replace(/\./g, "").replace(/\//g, " ");
      return dataFormatada;
    } catch {
      return dataString;
    }
  };

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

  const getValorParaInput = (valorString) => {
    if (!valorString) return "";
    const valor = parseFloat(
      valorString.toString().replace(/,/g, ".").replace(/[^\d.]/g, "")
    );
    if (isNaN(valor)) return "";
    return valor.toFixed(2).replace(".", ",");
  };

  useEffect(() => {
    fetchSalarios();
    carregarListas();
  }, []);

  const fetchSalarios = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setSalarios(data);
    } catch (err) {
      console.error("Erro ao carregar salários:", err);
    }
  };

  const carregarListas = async () => {
    try {
      const [setoresRes, departamentosRes, unidadesRes, usuariosRes] =
        await Promise.all([
          fetch(`${API_BASE}/setores`).then((r) => r.json()),
          fetch(`${API_BASE}/departamentos`).then((r) => r.json()),
          fetch(`${API_BASE}/unidades`).then((r) => r.json()),
          fetch(`${API_BASE}/usuarios`).then((r) => r.json()),
        ]);
      setSetores(setoresRes);
      setDepartamentos(departamentosRes);
      setUnidades(unidadesRes);
      setUsuarios(usuariosRes);
    } catch (err) {
      console.error("Erro ao carregar listas:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let novoValor;
    if (type === "checkbox") {
      novoValor = checked;
    } else if (name === "valor") {
      // mantém formato numérico para envio
      novoValor = value.replace(/,/g, ".").replace(/[^\d.]/g, "");
      const partes = novoValor.split(".");
      if (partes.length > 2) {
        novoValor = partes[0] + "." + partes.slice(1).join("");
      }
    } else {
      novoValor = value;
    }
    setNovoSalario((prev) => ({ ...prev, [name]: novoValor }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validação simples
    if (
      !novoSalario.id_funcionario ||
      !novoSalario.setor_id ||
      !novoSalario.departamento_id ||
      !novoSalario.unidade_id ||
      !novoSalario.valor
    ) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const salarioParaAPI = {
      ...novoSalario,
      valor: novoSalario.valor ? parseFloat(novoSalario.valor).toFixed(2) : "0.00",
      data_atualizado:
        novoSalario.data_atualizado || new Date().toISOString().slice(0, 10),
    };

    const method = editarSalarioId ? "PUT" : "POST";
    const url = editarSalarioId ? `${API_URL}/${editarSalarioId}` : API_URL;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(salarioParaAPI),
      });

      if (!res.ok) {
        const erroText = await res.text();
        console.error("Erro na resposta do servidor:", res.status, erroText);
        throw new Error("Erro ao salvar salário");
      }

      alert(`Salário ${editarSalarioId ? "editado" : "cadastrado"} com sucesso!`);
      setAbrirModal(false);
      setNovoSalario(estadoInicialSalario);
      setEditarSalarioId(null);
      fetchSalarios();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar salário.");
    }
  };

  const handleNovaSalario = () => {
    setNovoSalario(estadoInicialSalario);
    setEditarSalarioId(null);
    setAbrirModal(true);
  };

  const handleEditar = (s) => {
    setEditarSalarioId(s.id);
    setNovoSalario({
      id_funcionario: s.id_funcionario ?? "",
      setor_id: s.setor_id ?? "",
      departamento_id: s.departamento_id ?? "",
      unidade_id: s.unidade_id ?? "",
      valor: getValorParaInput(s.valor ?? ""),
      status_pagamento: s.status_pagamento ?? "pendente",
      data_atualizado: toInputDate(s.data_atualizado ?? ""),
    });
    setAbrirModal(true);
  };

  const handleExcluir = (id) => {
    setExcluirSalarioId(id);
    setAbrirModalExcluir(true);
  };

  const confirmarExcluir = async () => {
    try {
      const res = await fetch(`${API_URL}/${excluirSalarioId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir salário");
      alert("Salário excluído com sucesso!");
      setAbrirModalExcluir(false);
      setExcluirSalarioId(null);
      fetchSalarios();
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir salário.");
    }
  };

  // --- FILTRAGEM ---
  const salariosFiltrados = salarios.filter((s) => {
    // filtro mes (YYYY-MM) com data_atualizado
    const mesMatch =
      !filtroMes ||
      (s.data_atualizado &&
        s.data_atualizado.slice(0, 7) === filtroMes); // 'YYYY-MM'
    const departamentoMatch =
      !filtroDepartamento || String(s.departamento_id) === String(filtroDepartamento);
    return mesMatch && departamentoMatch;
  });

  // PAGINAÇÃO
  const indexUltimo = paginaAtual * itensPorPagina;
  const indexPrimeiro = indexUltimo - itensPorPagina;
  const salariosPagina = salariosFiltrados.slice(indexPrimeiro, indexUltimo);
  const totalPaginas = Math.max(1, Math.ceil(salariosFiltrados.length / itensPorPagina));

  const mudarPagina = (numero) => {
    if (numero < 1) numero = 1;
    if (numero > totalPaginas) numero = totalPaginas;
    setPaginaAtual(numero);
  };

  useEffect(() => {
    setPaginaAtual(1);
  }, [filtroMes, filtroDepartamento]);

  return (
    <>
      {/* FILTROS */}
      <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
        <div className="flex gap-4 flex-wrap">
          {/* Mês */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600">Mês</label>
            <input
              type="month"
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="border rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {/* Departamento (select) */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600">Departamento</label>
            <select
              value={filtroDepartamento}
              onChange={(e) => setFiltroDepartamento(e.target.value)}
              className="border rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="">Todos</option>
              {departamentos.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nome} {d.setor ? `— ${d.setor}` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={handleNovaSalario}
          className="cursor-pointer border p-2 rounded-md bg-blue-500 text-white"
        >
          Nova Conta
        </button>
      </div>

      {/* Modal Cadastro/Edição */}
      {abrirModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl mb-3 font-bold">
              {editarSalarioId ? "Editar Salário" : "Nova Conta"}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Campos (igual estilo) */}
              <div>
                <label htmlFor="id_funcionario" className="block">
                  Funcionário
                </label>
                <select
                  id="id_funcionario"
                  name="id_funcionario"
                  value={novoSalario.id_funcionario}
                  onChange={handleChange}
                  className="border rounded-md p-2 w-full"
                  required
                >
                  <option value="">Selecione o funcionário</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.registro} - {u.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="setor_id" className="block">
                  Setor
                </label>
                <select
                  id="setor_id"
                  name="setor_id"
                  value={novoSalario.setor_id}
                  onChange={(e) => {
                    // ao mudar setor limpa departamento selecionado
                    setNovoSalario((prev) => ({
                      ...prev,
                      setor_id: e.target.value,
                      departamento_id: "",
                    }));
                  }}
                  className="border rounded-md p-2 w-full"
                  required
                >
                  <option value="">Selecione o setor</option>
                  {setores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="departamento_id" className="block">
                  Departamento
                </label>
                <select
                  id="departamento_id"
                  name="departamento_id"
                  value={novoSalario.departamento_id}
                  onChange={handleChange}
                  className="border rounded-md p-2 w-full"
                  required
                >
                  <option value="">Selecione o departamento</option>
                  {departamentos
                    .filter((d) => !novoSalario.setor_id || String(d.setor_id) === String(novoSalario.setor_id))
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nome}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label htmlFor="unidade_id" className="block">
                  Unidade
                </label>
                <select
                  id="unidade_id"
                  name="unidade_id"
                  value={novoSalario.unidade_id}
                  onChange={handleChange}
                  className="border rounded-md p-2 w-full"
                  required
                >
                  <option value="">Selecione a unidade</option>
                  {unidades.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="valor" className="block">
                  Valor
                </label>
                <input
                  id="valor"
                  name="valor"
                  type="text"
                  onChange={handleChange}
                  value={novoSalario.valor}
                  className="border rounded-md p-2 w-full"
                  required
                />
              </div>

              <div>
                <label htmlFor="data_atualizado" className="block">
                  Data Atualizado
                </label>
                <input
                  id="data_atualizado"
                  name="data_atualizado"
                  type="date"
                  onChange={handleChange}
                  value={novoSalario.data_atualizado}
                  className="border rounded-md p-2 w-full"
                />
              </div>

              {/* Status */}
              <div className="flex flex-col gap-2 mt-2">
                <label className="block font-medium text-gray-700">Status</label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status_pagamento"
                      value="pendente"
                      checked={novoSalario.status_pagamento === "pendente"}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>Pendente</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status_pagamento"
                      value="pago"
                      checked={novoSalario.status_pagamento === "pago"}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>Pago</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <button type="submit" className="bg-green-600 text-white rounded-md p-2">
                  Salvar
                </button>
              </div>
            </form>

            <button
              onClick={() => {
                setAbrirModal(false);
                setEditarSalarioId(null);
                setNovoSalario(estadoInicialSalario);
              }}
              className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
              aria-label="Fechar modal"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Modal Exclusão */}
      {abrirModalExcluir && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl mb-4 font-bold">Confirmar Exclusão</h2>
            <p>Tem certeza que deseja excluir este salário?</p>
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => setAbrirModalExcluir(false)} className="bg-gray-300 px-4 py-2 rounded-md">
                Cancelar
              </button>
              <button onClick={confirmarExcluir} className="bg-red-600 text-white px-4 py-2 rounded-md">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-[#245757] text-left text-white rounded-t-lg">
              <th className="p-2">ID</th>
              <th className="p-2">Registro</th>
              <th className="p-2">Funcionário</th>
              <th className="p-2">Setor</th>
              <th className="p-2">Departamento</th>
              <th className="p-2">Unidade</th>
              <th className="p-2">Valor</th>
              <th className="p-2">Status</th>
              <th className="p-2">Atualizado</th>
              <th className="p-2 rounded-tr-lg">Ações</th>
            </tr>
          </thead>

          <tbody>
            {salariosPagina.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{u.id}</td>
                <td className="p-2">{u.registro}</td>
                <td className="p-2">{u.funcionario}</td>
                <td className="p-2">{u.setor}</td>
                <td className="p-2">{u.departamento}</td>
                <td className="p-2">{u.unidade}</td>
                <td className="p-2">{formatarValor(u.valor)}</td>

                <td className="p-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      u.status_pagamento === "pendente"
                        ? "bg-[#245757]/20 text-[#245757]"
                        : "bg-gray-300 text-gray-700"
                    }`}
                  >
                    {u.status_pagamento === "pendente" ? "Pendente" : "Pago"}
                  </span>
                </td>

                <td className="p-2">{formatarData(u.data_atualizado)}</td>

                <td className="p-2 text-center flex gap-2 justify-center">
                  <button
                    onClick={() => handleEditar(u)}
                    className="text-gray-700 hover:text-[#245757]"
                    title="Editar"
                  >
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
            <button onClick={() => mudarPagina(paginaAtual - 1)} disabled={paginaAtual === 1} className="px-3 py-1 border rounded disabled:opacity-50">
              &lt; Anterior
            </button>
            {[...Array(totalPaginas)].map((_, i) => {
              const numeroPagina = i + 1;
              return (
                <button key={numeroPagina} onClick={() => mudarPagina(numeroPagina)} className={`px-3 py-1 border rounded ${paginaAtual === numeroPagina ? "bg-blue-300" : ""}`}>
                  {numeroPagina}
                </button>
              );
            })}
            <button onClick={() => mudarPagina(paginaAtual + 1)} disabled={paginaAtual === totalPaginas} className="px-3 py-1 border rounded disabled:opacity-50">
              Próxima &gt;
            </button>
          </div>
        )}
      </div>
    </>
  );
}
