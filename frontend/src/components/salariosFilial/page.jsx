"use client";
import { useState, useEffect } from "react";

export default function Salarios() {
  const estadoInicialSalario = {
    id_funcionario: "",
    registro: "",
    nome: "",
    departamento_id: "",
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
  const [pesquisa, setPesquisa] = useState("");
  const [departamentos, setDepartamentos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 15;

  const API_URL = "http://localhost:8080/api/salarios";

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

  const getNomeDepartamento = (id) => {
    const depto = departamentos.find((d) => String(d.id) === String(id));
    return depto ? depto.departamento : id;
  };

  const fetchSalarios = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSalarios(data);
    } catch (err) {
      console.error("Erro ao carregar salários:", err);
    }
  };

  const carregarListas = async () => {
    try {
      const token = localStorage.getItem("token");
      const resDepartamentos = await fetch("http://localhost:8080/departamento", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resFuncionarios = await fetch("http://localhost:8080/funcionarios", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const departamentosData = await resDepartamentos.json();
      const funcionariosData = await resFuncionarios.json();

      setDepartamentos(Array.isArray(departamentosData) ? departamentosData : []);
      setFuncionarios(Array.isArray(funcionariosData) ? funcionariosData : []);
    } catch (erro) {
      console.error("Erro ao carregar listas:", erro);
      setDepartamentos([]);
      setFuncionarios([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let novoValor;

    if (type === "checkbox") {
      novoValor = checked;
    } else if (name === "valor") {
      novoValor = value.replace(/,/g, ".").replace(/[^\d.]/g, "");
      const partes = novoValor.split(".");
      if (partes.length > 2) novoValor = partes[0] + "." + partes.slice(1).join("");

      setNovoSalario((prev) => ({ ...prev, [name]: value.replace(/[^\d,]/g, "") }));
      return;
    } else {
      novoValor = value;
    }

    setNovoSalario((prev) => ({ ...prev, [name]: novoValor }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!novoSalario.id_funcionario || !novoSalario.departamento_id || !novoSalario.valor) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const valorLimpo = novoSalario.valor.replace(/,/g, ".").replace(/[^\d.]/g, "");

    const salarioParaAPI = {
      ...novoSalario,
      valor: valorLimpo ? parseFloat(valorLimpo).toFixed(2) : "0.00",
    };

    delete salarioParaAPI.nome;
    delete salarioParaAPI.registro;

    const method = editarSalarioId ? "PUT" : "POST";
    const url = editarSalarioId ? `${API_URL}/${editarSalarioId}` : API_URL;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(salarioParaAPI),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Erro ao salvar salário");
        return;
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
      id_funcionario: s.id_funcionario || s.id_funcionario_original || "",
      registro: s.registro || "",
      nome: s.funcionario || "",
      departamento_id: s.departamento_id ?? "",
      valor: getValorParaInput(s.valor ?? ""),
      status_pagamento: s.status_pagamento ?? "pendente",
    });

    setAbrirModal(true);
  };

  const handleExcluir = (id) => {
    setExcluirSalarioId(id);
    setAbrirModalExcluir(true);
  };

  const confirmarExcluir = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/${excluirSalarioId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

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

  const salariosFiltrados = salarios.filter((s) => {
    if (!pesquisa) return true;

    const termo = pesquisa.toLowerCase();
    return (
      (s.funcionario && s.funcionario.toLowerCase().includes(termo)) ||
      (s.registro && String(s.registro).includes(termo))
    );
  });

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
  }, [pesquisa]);

  useEffect(() => {
    fetchSalarios();
    carregarListas();
  }, []);

  return (
    <>
      {/* FILTROS */}
      <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
        <div className="flex flex-col w-full max-w-sm">
          <label className="text-sm font-medium text-gray-600">
            Pesquisar por Nome ou Registro
          </label>

          <input
            type="text"
            value={pesquisa}
            onChange={(e) => {
              setPesquisa(e.target.value);
              setPaginaAtual(1);
            }}
            className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#44A6A0]"
          />
        </div>

        <button
          type="button"
          onClick={handleNovaSalario}
          className="cursor-pointer border p-2 rounded-md bg-[#44A6A0] text-white hover:bg-[44A6A0]"
        >
          Novo Salário
        </button>
      </div>

      {/* MODAL ADICIONAR / EDITAR */}
      {abrirModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl mb-3 font-bold">
              {editarSalarioId ? "Editar Salário" : "Novo Salário"}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <label htmlFor="registro" className="block">Registro</label>
              <input
                id="registro"
                name="registro"
                list="listaRegistros"
                value={novoSalario.registro || ""}
                onChange={(e) => {
                  if (editarSalarioId) return;

                  const valor = e.target.value;
                  const funcionarioSelecionado = funcionarios.find(
                    (u) => String(u.registro) === String(valor)
                  );

                  setNovoSalario((prev) => ({
                    ...prev,
                    registro: valor,
                    id_funcionario: funcionarioSelecionado?.id || "",
                    nome: funcionarioSelecionado?.nome || "",
                    departamento_id: funcionarioSelecionado?.departamento_id || "",
                  }));
                }}
                disabled={!!editarSalarioId}
                className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#44A6A0]"
                placeholder="Digite ou selecione o registro"
              />

              <label htmlFor="nome" className="block">Funcionário</label>
              <input
                id="nome"
                name="nome"
                list="listaFuncionarios"
                value={novoSalario.nome || ""}
                onChange={(e) => {
                  if (editarSalarioId) return;

                  const valor = e.target.value;
                  const funcionarioSelecionado = funcionarios.find(
                    (u) => String(u.nome) === String(valor)
                  );

                  setNovoSalario((prev) => ({
                    ...prev,
                    nome: valor,
                    id_funcionario: funcionarioSelecionado?.id || "",
                    registro: funcionarioSelecionado?.registro || "",
                    departamento_id: funcionarioSelecionado?.departamento_id || "",
                  }));
                }}
                disabled={!!editarSalarioId}
                className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#44A6A0]"
                placeholder="Digite ou selecione o funcionário"
              />

              <div>
                <label htmlFor="valor" className="block">Valor</label>
                <input
                  id="valor"
                  name="valor"
                  type="text"
                  onChange={handleChange}
                  value={novoSalario.valor}
                  className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#44A6A0]"
                  required
                />
              </div>

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
                <button type="submit" className="bg-[#44A6A0] text-white rounded-md p-2 hover:bg-teal-500">
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
            >
              &times;
            </button>
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
              <button
                onClick={() => setAbrirModalExcluir(false)}
                className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarExcluir}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABELA */}
      <div className="overflow-x-auto mt-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#44A6A0] text-white">
              <th className="p-2">Registro</th>
              <th className="p-2">Nome</th>
              <th className="p-2">Departamento</th>
              <th className="p-2">Valor</th>
              <th className="p-2">Status</th>
              <th className="p-2">Data Atualizado</th>
              <th className="p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {salariosPagina.map((s) => (
              <tr key={s.id} className="border-b hover:bg-teal-50">
                <td className="p-2">{s.registro}</td>
                <td className="p-2">{s.funcionario}</td>
                <td className="p-2">{getNomeDepartamento(s.departamento_id)}</td>
                <td className="p-2">{formatarValor(s.valor)}</td>
                <td className="p-2 capitalize">{s.status_pagamento}</td>
                <td className="p-2">{formatarData(s.data_atualizado)}</td>
                <td className="p-2 flex gap-2 justify-center">
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
          </tbody>
        </table>
      </div>

      {/* PAGINAÇÃO */}
      <div className="flex justify-center items-center mt-4 gap-2 flex-wrap">
        <button
          onClick={() => mudarPagina(paginaAtual - 1)}
          className="px-3 py-1 bg-[#44A6A0] text-white rounded hover:bg-teal-500"
        >
          Anterior
        </button>

        {Array.from({ length: totalPaginas }, (_, i) => (
          <button
            key={i}
            onClick={() => mudarPagina(i + 1)}
            className={`px-3 py-1 rounded ${
              paginaAtual === i + 1
                ? "bg-teal-500 text-white"
                : "bg-teal-100 text-teal-800 hover:bg-teal-200"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => mudarPagina(paginaAtual + 1)}
          className="px-3 py-1 bg-[#44A6A0] text-white rounded hover:bg-teal-500"
        >
          Próxima
        </button>
      </div>
    </>
  );
}
