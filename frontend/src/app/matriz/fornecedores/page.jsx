"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/layout/layout";

export default function CadastroFornecedores() {
  const estadoInicialFornecedor = {
    fornecedor: "",
    email: "",
    telefone: "",
    cnpj: "",
    cep: "",
    cidade: "",
    estado: "",
    bairro: "",
    logradouro: "",
    numero: "",
    status: true,
  };

  const [abrirModal, setAbrirModal] = useState(false);
  const [fornecedores, setFornecedores] = useState([]);
  const [buscaFornecedor, setBuscaFornecedor] = useState("");
  const [novoFornecedor, setNovoFornecedor] = useState(estadoInicialFornecedor);
  const [editarFornecedorId, setEditarFornecedorId] = useState(null);
  const [excluirFornecedorId, setExcluirFornecedorId] = useState(null);
  const [abrirModalExcluir, setAbrirModalExcluir] = useState(false);

  const fornecedoresFiltrados = fornecedores.filter((f) =>
    f.fornecedor.toLowerCase().includes(buscaFornecedor.toLowerCase())
  );
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 15;

  const indexUltimo = paginaAtual * itensPorPagina;
  const indexPrimeiro = indexUltimo - itensPorPagina;
  const fornecedoresPagina = fornecedoresFiltrados.slice(
    indexPrimeiro,
    indexUltimo
  );
  const totalPaginas = Math.ceil(fornecedoresFiltrados.length / itensPorPagina);

  const mudarPagina = (numero) => {
    if (numero < 1) numero = 1;
    if (numero > totalPaginas) numero = totalPaginas;
    setPaginaAtual(numero);
  };

  const API_URL = "http://localhost:8080/api/fornecedores";

  useEffect(() => {
    fetchFornecedores();
  }, []);

  const fetchFornecedores = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      // Normaliza status para booleano
      const dataNormalizada = data.map((f) => ({
        ...f,
        status: f.status === "ATIVO" || f.status === true,
      }));
      setFornecedores(dataNormalizada);
    } catch (error) {
      console.error("Erro ao carregar fornecedores:", error);
    }
  };

  const aplicarMascara = (name, value) => {
    if (name === "telefone") {
      return value
        .replace(/\D/g, "")
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4,5})(\d)/, "$1-$2")
        .slice(0, 15);
    }

    if (name === "cnpj") {
      return value
        .replace(/\D/g, "")
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2}\.\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{2}\.\d{3}\.\d{3})(\d)/, "$1/$2")
        .replace(/^(\d{2}\.\d{3}\.\d{3}\/\d{4})(\d)/, "$1-$2")
        .slice(0, 18);
    }

    if (name === "cep") {
      return value.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2").slice(0, 9);
    }

    return value;
  };

  const buscarEndereco = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setNovoFornecedor((prev) => ({
            ...prev,
            logradouro: data.logradouro || "",
            bairro: data.bairro || "",
            cidade: data.localidade || "",
            estado: data.uf || "",
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let novoValor;

    if (type === "checkbox") {
      novoValor = checked;
    } else if (name === "status") {
      novoValor = value === "true";
    } else {
      novoValor = aplicarMascara(name, value);
    }

    setNovoFornecedor((prev) => ({ ...prev, [name]: novoValor }));

    if (name === "cep") buscarEndereco(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fornecedorParaAPI = {
      ...novoFornecedor,
    };

    try {
      const method = editarFornecedorId ? "PUT" : "POST";
      const url = editarFornecedorId ? `${API_URL}/${editarFornecedorId}` : API_URL;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fornecedorParaAPI),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Erro na resposta do servidor:", res.status, errorText);
        throw new Error("Erro ao salvar fornecedor");
      }

      alert(`Fornecedor ${editarFornecedorId ? "editado" : "cadastrado"} com sucesso!`);
      setAbrirModal(false);
      setNovoFornecedor(estadoInicialFornecedor);
      setEditarFornecedorId(null);
      fetchFornecedores();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar fornecedor.");
    }
  };

  const handleEditar = (fornecedor) => {
    setEditarFornecedorId(fornecedor.id);
    setNovoFornecedor({
      fornecedor: fornecedor.fornecedor || "",
      email: fornecedor.email || "",
      telefone: fornecedor.telefone || "",
      cnpj: fornecedor.cnpj || "",
      cep: fornecedor.cep || "",
      cidade: fornecedor.cidade || "",
      estado: fornecedor.estado || "",
      bairro: fornecedor.bairro || "",
      logradouro: fornecedor.logradouro || "",
      numero: fornecedor.numero || "",
      status: fornecedor.status === true || fornecedor.status === "ATIVO",
    });
    setAbrirModal(true);
  };

  const handleExcluir = (id) => {
    setExcluirFornecedorId(id);
    setAbrirModalExcluir(true);
  };

  const confirmarExcluir = async () => {
    try {
      const res = await fetch(`${API_URL}/${excluirFornecedorId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Erro ao excluir fornecedor:", res.status, errorText);
        throw new Error("Erro ao excluir fornecedor");
      }

      alert("Fornecedor excluído com sucesso!");
      setAbrirModalExcluir(false);
      setExcluirFornecedorId(null);
      fetchFornecedores();
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir fornecedor.");
    }
  };

  return (
    <Layout>
      <div>
        <h1 className="text-2xl font-semibold text-[#2d4b47]">Fornecedores</h1>
      </div>

      <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
        <input
          type="text"
          placeholder="Buscar fornecedor por nome..."
          value={buscaFornecedor}
          onChange={(e) => {
            setBuscaFornecedor(e.target.value);
            setPaginaAtual(1);
          }}
          className="border border-gray-300 rounded-md p-2 w-64 focus:outline-none focus:ring-2 focus:ring-[#2d4b47]"
        />

        <button
          type="button"
          onClick={() => {
            setNovoFornecedor(estadoInicialFornecedor);
            setEditarFornecedorId(null);
            setAbrirModal(true);
          }}
          className="inline-flex items-center gap-2 bg-[#2d4b47] text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-[#24403d] transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Novo Fornecedor
        </button>
      </div>

      {/* Modal de Cadastro/Edição */}
      {abrirModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto relative">
            <h2 className="text-xl mb-4 font-bold text-[#2d4b47]">
              {editarFornecedorId ? "Editar Fornecedor" : "Novo Fornecedor"}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {[
                ["fornecedor", "Fornecedor", "text"],
                ["email", "Email", "email"],
                ["telefone", "Telefone", "tel"],
                ["cnpj", "CNPJ", "text"],
                ["cep", "CEP", "text"],
                ["cidade", "Cidade", "text"],
                ["estado", "Estado", "text"],
                ["bairro", "Bairro", "text"],
                ["logradouro", "Rua", "text"],
                ["numero", "Número", "number"],
              ].map(([name, label, type]) => (
                <div key={name}>
                  <label
                    htmlFor={name}
                    className="block mb-1 text-sm font-semibold text-[#2d4b47]"
                  >
                    {label}
                  </label>
                  <input
                    id={name}
                    type={type}
                    name={name}
                    value={novoFornecedor[name]}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#2d4b47]"
                    required
                  />
                </div>
              ))}

              {/* Campo de Status com Radio Buttons */}
              <div className="flex flex-col gap-2 mt-2">
                <label className="block font-semibold text-[#2d4b47]">Status</label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="true"
                      checked={novoFornecedor.status === true}
                      onChange={handleChange}
                      className="w-4 h-4 border-2 border-[#2d4b47] rounded-full
             appearance-none checked:bg-[#2d4b47]"
                    />
                    <span>Ativo</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="false"
                      checked={novoFornecedor.status === false}
                      onChange={handleChange}
                      className="w-4 h-4 border-2 border-[#2d4b47] rounded-full
             appearance-none checked:bg-[#2d4b47]"
                    />
                    <span>Inativo</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end mt-6 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAbrirModal(false);
                    setEditarFornecedorId(null);
                    setNovoFornecedor(estadoInicialFornecedor);
                  }}
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
              onClick={() => {
                setAbrirModal(false);
                setEditarFornecedorId(null);
                setNovoFornecedor(estadoInicialFornecedor);
              }}
              className="absolute top-3 right-3 text-[#2d4b47] hover:text-[#24403d] text-2xl font-bold"
              aria-label="Fechar modal"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Modal de Exclusão */}
      {abrirModalExcluir && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl mb-4 font-bold text-[#2d4b47]">Confirmar Exclusão</h2>
            <p>Tem certeza que deseja excluir este fornecedor?</p>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setAbrirModalExcluir(false)}
                className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarExcluir}
                className="bg-[#2d4b47] text-white px-4 py-2 rounded-md hover:bg-[#24403d] transition"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabela de Fornecedores */}
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-[#2d4b47] text-white text-left text-sm font-semibold rounded-t-lg">
              <th className="py-3 px-4 rounded-tl-lg">Fornecedor</th>
              <th className="py-3 px-4">CNPJ</th>
              <th className="py-3 px-4">Telefone</th>
              <th className="py-3 px-4">E-mail</th>
              <th className="py-3 px-4">Cidade</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4">Bairro</th>
              <th className="py-3 px-4">Endereço</th>
              <th className="py-3 px-4">Número</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 rounded-tr-lg text-center">Ações</th>
            </tr>
          </thead>

          <tbody className="text-sm text-gray-900">
            {fornecedoresPagina.map((u) => (
              <tr key={u.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4 whitespace-pre-wrap max-w-[150px]">{u.fornecedor}</td>
                <td className="py-3 px-4">{u.cnpj}</td>
                <td className="py-3 px-4 whitespace-pre-wrap max-w-[110px]">{u.telefone}</td>
                <td className="py-3 px-4 max-w-[160px] break-words">{u.email}</td>
                <td className="py-3 px-4">{u.cidade}</td>
                <td className="py-3 px-4">{u.estado}</td>
                <td className="py-3 px-4">{u.bairro}</td>
                <td className="py-3 px-4">{u.logradouro}</td>
                <td className="py-3 px-4">{u.numero}</td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      u.status
                        ? "bg-[#d7e6e4] text-[#2d4b47]"
                        : "bg-gray-300 text-gray-700"
                    }`}
                  >
                    {u.status ? "Ativo" : "Inativo"}
                  </span>
                </td>
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

            {fornecedoresPagina.length === 0 && (
              <tr>
                <td colSpan="11" className="text-center py-4 text-gray-600">
                  Nenhum fornecedor encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
        <button
          onClick={() => mudarPagina(paginaAtual - 1)}
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
            onClick={() => mudarPagina(i + 1)}
            className={`px-3 py-1 rounded-md border border-[#2d4b47] hover:bg-[#2d4b47] hover:text-white transition ${
              paginaAtual === i + 1
                ? "bg-[#2d4b47] text-white cursor-default"
                : "text-[#2d4b47]"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => mudarPagina(paginaAtual + 1)}
          disabled={paginaAtual === totalPaginas}
          className={`px-3 py-1 rounded-md border border-[#2d4b47] text-[#2d4b47] hover:bg-[#2d4b47] hover:text-white transition ${
            paginaAtual === totalPaginas ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Próximo
        </button>
      </div>
    </Layout>
  );
}
