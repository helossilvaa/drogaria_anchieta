"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/layout/layout";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Filiados() {
  const [abrirModal, setAbrirModal] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [buscaCPF, setBuscaCPF] = useState("");
  const [tiposDescontos, setTiposDescontos] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 15;
  const [novoUsuario, setNovoUsuario] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    data_nascimento: "",
    cep: "",
    cidade: "",
    estado: "",
    bairro: "",
    logradouro: "",
    numero: "",
    tipodesconto: "",
    unidade_id: "",
  });

  const API_URL = "http://localhost:8080/api/filiados";

  // Buscar usuários e tipos de desconto 
  useEffect(() => {
    fetchUsuarios();
    fetchTiposDescontos();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
  };

  const fetchTiposDescontos = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/tiposdescontos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTiposDescontos(data);
    } catch (error) {
      console.error("Erro ao carregar tipos de descontos:", error);
    }
  };

  // Paginação 
  const indexUltimo = paginaAtual * itensPorPagina;
  const indexPrimeiro = indexUltimo - itensPorPagina;
  const usuariosFiltrados = usuarios.filter((u) =>
    u.cpf?.toLowerCase().includes(buscaCPF.toLowerCase())
  );
  const usuariosPagina = usuariosFiltrados.slice(indexPrimeiro, indexUltimo);
  const totalPaginas = Math.ceil(usuariosFiltrados.length / itensPorPagina);
  const mudarPagina = (numero) => {
    if (numero < 1) numero = 1;
    if (numero > totalPaginas) numero = totalPaginas;
    setPaginaAtual(numero);
  };

  // Atualizar estado e buscar CEP 
  const handleChange = async (e) => {
    const { name, value } = e.target;
    setNovoUsuario((prev) => ({
      ...prev,
      [name]: name === "estado" ? value.toUpperCase() : value,
    }));
    if (name === "cep" && value.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${value}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setNovoUsuario((prev) => ({
            ...prev,
            cidade: data.localidade || "",
            estado: data.uf || "",
            bairro: data.bairro || "",
            logradouro: data.logradouro || "",
          }));
        } else {
          alert("CEP não encontrado.");
          setNovoUsuario((prev) => ({
            ...prev,
            cidade: "",
            estado: "",
            bairro: "",
            logradouro: "",
          }));
        }
      } catch (error) {
        toast.error("Erro ao buscar CEP:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validação de CPF 
    if (novoUsuario.cpf.length !== 11) {
      toast.error("CPF deve conter exatamente 11 dígitos.");
      return;
    }

    // Validação de telefone — deve ter 8 ou 9 dígitos numéricos 
    const telefoneNumerico = novoUsuario.telefone.replace(/\D/g, "");
    if (telefoneNumerico.length !== 8 && telefoneNumerico.length !== 9) {
      toast.error("Telefone deve conter exatamente 8 ou 9 dígitos numéricos.");
      return;
    }

    // Verificar duplicidade de CPF 
    const existe = usuarios.find((u) => u.cpf === novoUsuario.cpf);
    if (existe) {
      toast.error("Usuário com este CPF já está cadastrado.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(novoUsuario),
      });
      if (!res.ok) {
        let erroMsg = "Erro ao salvar usuário";
        try {
          const erro = await res.json();
          erroMsg = erro.message || JSON.stringify(erro) || erroMsg;
        } catch {
          const texto = await res.text();
          erroMsg = texto || erroMsg;
        }
        throw new Error(erroMsg);
      }
      toast.success("Usuário cadastrado com sucesso!");

      setAbrirModal(false);
      setNovoUsuario({
        nome: "",
        email: "",
        telefone: "",
        cpf: "",
        data_nascimento: "",
        cep: "",
        cidade: "",
        estado: "",
        bairro: "",
        logradouro: "",
        numero: "",
        tipodesconto: "",
      });
      fetchUsuarios();
    } catch (err) {
      toast.error("Erro ao cadastrar usuário:", err);
      toast.error(err.message || "Erro ao cadastrar usuário.");
    }
  };

  return (
    <>
      <Layout>
        {/* Título */}
        <div className="text-xl font-bold mb-2">
          <h1>FILIADOS</h1>
        </div>

        {/* Barra de Busca + Botão alinhados (invertidos) */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          {/* Barra de pesquisa (agora à esquerda) */}
          <div className="flex justify-center md:justify-start w-full">
            <div className="relative w-full max-w-md">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0z" />
                </svg>
              </span>

              <input
                type="text"
                placeholder="Buscar..."
                value={buscaCPF}
                onChange={(e) => setBuscaCPF(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#f6339a] focus:border-[#f6339a] transition"
              />
            </div>
          </div>

          {/* Botão Ajustado */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setAbrirModal(true)}
              className="flex items-center gap-2 cursor-pointer border px-6 py-3 rounded-lg bg-[#f6339a] text-white text-base font-semibold shadow-md hover:bg-[#f6339a] transition"
            >
              <svg
                className="w-5 h-5 text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 12h14m-7 7V5"
                />
              </svg>
              Usuário
            </button>
          </div>



        </div>



        {/* Modal de criar novo filiado */}
        {abrirModal && (
          <div className="fixed inset-0 flex justify-center items-center bg-black/30 shadow-inner z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-7 relative max-h-[90vh] overflow-y-auto animate-fadeIn">
              <button
                onClick={() => setAbrirModal(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition">
                <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-xl font-bold text-[#f6339a] tracking-wide">
                Novo Filiado
              </h2>
              <hr className="border-[#f6339a]/40 mb-5 mt-3" />
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {[["nome", "Nome", "text"], ["email", "E-mail", "email"], ["telefone", "Telefone", "text"], ["cpf", "CPF", "text"], ["data_nascimento", "Data de nascimento", "date"], ["cep", "CEP", "text"], ["cidade", "Cidade", "text"], ["estado", "Estado", "text"], ["bairro", "Bairro", "text"], ["logradouro", "Logradouro", "text"], ["numero", "Número", "number"]].map(([name, label, type]) => (
                  <div key={name}>
                    <input
                      type={type}
                      name={name}
                      value={novoUsuario[name]}
                      onChange={handleChange}
                      className="p-3 mb-4 w-full bg-gray-100 border rounded-lg focus:ring-2 focus:ring-[#f6339a] focus:border-[#f6339a] transition outline-none"
                      placeholder={label}
                      required
                    />
                  </div>
                ))}
                <div>
                  <select
                    name="tipodesconto"
                    value={novoUsuario.tipodesconto}
                    onChange={handleChange}
                    className="p-3 mb-4 w-full bg-gray-100 border rounded-lg focus:ring-2 focus:ring-[#f6339a] focus:border-[#f6339a] transition outline-none"
                    required>
                    <option value="">Selecione um tipo</option>
                    {tiposDescontos.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.tipo}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    type="submit"
                    className="bg-[#f6339a] text-white px-5 py-2.5 rounded-lg hover:bg-[#f6339a] transition transform hover:scale-[1.03] active:scale-95 shadow-md">
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tabela de filiados */}
        {usuarios.length === 0 ? (
          <p className="text-center text-gray-500 mt-6 text-lg">
            Nenhum usuário encontrado
          </p>
        ) : usuariosFiltrados.length > 0 ? (
          <>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse text-sm rounded-lg overflow-hidden shadow-sm">
                <thead>
                  <tr className="bg-[#f6339a] text-white">
                    <th className="p-3 text-left">Nome</th>
                    <th className="p-3 text-left">E-mail</th>
                    <th className="p-3 text-left">Telefone</th>
                    <th className="p-3 text-left">CPF</th>
                    <th className="p-3 text-left">Data de nascimento</th>
                    <th className="p-3 text-left">CEP</th>
                    <th className="p-3 text-left">Cidade</th>
                    <th className="p-3 text-left">Estado</th>
                    <th className="p-3 text-left">Bairro</th>
                    <th className="p-3 text-left">Logradouro</th>
                    <th className="p-3 text-left">Número</th>
                    <th className="p-3 text-left">Tipo de Desconto</th>
                  </tr>
                </thead>

                <tbody>
                  {usuariosPagina.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b hover:bg-gray-100 transition"
                    >
                      <td className="p-3 font-medium">{u.nome}</td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3">{u.telefone}</td>
                      <td className="p-3">{u.cpf}</td>
                      <td className="p-3">
                        {new Date(u.data_nascimento).toLocaleDateString()}
                      </td>
                      <td className="p-3">{u.cep}</td>
                      <td className="p-3">{u.cidade}</td>
                      <td className="p-3">{u.estado}</td>
                      <td className="p-3">{u.bairro}</td>
                      <td className="p-3">{u.logradouro}</td>
                      <td className="p-3">{u.numero}</td>
                      <td className="p-3">{u.tipodesconto}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {usuariosFiltrados.length > itensPorPagina && (
              <div className="flex justify-center items-center gap-2 mt-4 select-none">
                <button
                  onClick={() => mudarPagina(paginaAtual - 1)}
                  disabled={paginaAtual === 1}
                  className="px-4 py-2 rounded-full border border-[#f6339a] text-[#f6339a] hover:bg-gray-100 hover:text-[#f6339a] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  ← Anterior
                </button>
                <div className="px-4 py-2 rounded-full text-white bg-[#f6339a]">
                  {paginaAtual}
                </div>
                <button
                  onClick={() => mudarPagina(paginaAtual + 1)}
                  disabled={paginaAtual === totalPaginas}
                  className="px-4 py-2 rounded-full border border-[#f6339a] text-[#f6339a] hover:bg-gray-100 hover:text-[#f6339a] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  Próxima →
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-500 mt-6 text-lg">
            Nenhum usuário encontrado para o CPF informado.
          </p>
        )}
      </Layout>
    </>
  );
}