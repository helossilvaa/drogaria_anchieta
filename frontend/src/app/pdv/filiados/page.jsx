"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/layout/layout";

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
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação de CPF
    if (novoUsuario.cpf.length !== 11) {
      alert("CPF deve conter exatamente 11 dígitos.");
      return;
    }

    // Validação de telefone — deve ter 8 ou 9 dígitos numéricos
    const telefoneNumerico = novoUsuario.telefone.replace(/\D/g, "");
    if (telefoneNumerico.length !== 8 && telefoneNumerico.length !== 9) {
      alert("Telefone deve conter exatamente 8 ou 9 dígitos numéricos.");
      return;
    }

    // Verificar duplicidade de CPF
    const existe = usuarios.find((u) => u.cpf === novoUsuario.cpf);
    if (existe) {
      alert("Usuário com este CPF já está cadastrado.");
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

      alert("Usuário cadastrado com sucesso!");
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
      console.error("Erro ao cadastrar usuário:", err);
      alert(err.message || "Erro ao cadastrar usuário.");
    }
  };

  return (
    <>
      <Layout>
        <div>
          <h1>FILIADOS</h1>
        </div>

        <button
          type="button"
          onClick={() => setAbrirModal(true)}
          className="cursor-pointer border p-2 rounded-md bg-blue-500 text-white mt-2"
        >
          <svg
            className="w-6 h-6 text-gray-800 dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
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
          </svg>{" "}
          Novo Usuário
        </button>

        <div className="mt-4 flex items-center gap-2">
          <input
            type="text"
            placeholder="Buscar usuário por CPF..."
            value={buscaCPF}
            onChange={(e) => setBuscaCPF(e.target.value)}
            className="border rounded-md p-2 w-64"
          />
          <button
            onClick={() => setPaginaAtual(1)}
            className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300"
          >
            Pesquisar
          </button>
        </div>

        {abrirModal && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl mb-3 font-bold">Novo Usuário</h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {[
                  ["nome", "Nome", "text"],
                  ["email", "E-mail", "email"],
                  ["telefone", "Telefone", "text"],
                  ["cpf", "CPF", "text"],
                  ["data_nascimento", "Data de nascimento", "date"],
                  ["cep", "CEP", "text"],
                  ["cidade", "Cidade", "text"],
                  ["estado", "Estado", "text"],
                  ["bairro", "Bairro", "text"],
                  ["logradouro", "Logradouro", "text"],
                  ["numero", "Número", "number"],
                ].map(([name, label, type]) => (
                  <div key={name}>
                    <label>{label}</label>
                    <input
                      type={type}
                      name={name}
                      value={novoUsuario[name]}
                      onChange={handleChange}
                      className="border rounded-md p-2 w-full"
                      required
                    />
                  </div>
                ))}

                <div>
                  <label>Tipo de Desconto</label>
                  <select
                    name="tipodesconto"
                    value={novoUsuario.tipodesconto}
                    onChange={handleChange}
                    className="border rounded-md p-2 w-full"
                    required
                  >
                    <option value="">Selecione um tipo</option>
                    {tiposDescontos.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.tipo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-between mt-4">
                  <button
                    type="submit"
                    className="bg-green-600 text-white rounded-md p-2"
                  >
                    Salvar
                  </button>
                </div>
              </form>

              <button
                onClick={() => setAbrirModal(false)}
                className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
              >
                &times;
              </button>
            </div>
          </div>
        )}

        {usuarios.length === 0 ? (
          <p className="text-center text-gray-500 mt-6 text-lg">
            Nenhum usuário encontrado
          </p>
        ) : usuariosFiltrados.length > 0 ? (
          <>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-red-300">
                  <tr>
                    <th className="p-2">Nome</th>
                    <th className="p-2">E-mail</th>
                    <th className="p-2">Telefone</th>
                    <th className="p-2">CPF</th>
                    <th className="p-2">Data de nascimento</th>
                    <th className="p-2">CEP</th>
                    <th className="p-2">Cidade</th>
                    <th className="p-2">Estado</th>
                    <th className="p-2">Bairro</th>
                    <th className="p-2">Logradouro</th>
                    <th className="p-2">Número</th>
                    <th className="p-2">Tipo de Desconto</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosPagina.map((u) => (
                    <tr key={u.id} className="border-t">
                      <td className="p-2">{u.nome}</td>
                      <td className="p-2">{u.email}</td>
                      <td className="p-2">{u.telefone}</td>
                      <td className="p-2">{u.cpf}</td>
                      <td className="p-2">
                        {new Date(u.data_nascimento).toLocaleDateString()}
                      </td>
                      <td className="p-2">{u.cep}</td>
                      <td className="p-2">{u.cidade}</td>
                      <td className="p-2">{u.estado}</td>
                      <td className="p-2">{u.bairro}</td>
                      <td className="p-2">{u.logradouro}</td>
                      <td className="p-2">{u.numero}</td>
                      <td className="p-2">{u.tipodesconto}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {usuariosFiltrados.length > itensPorPagina && (
              <div className="flex justify-center items-center gap-2 mt-4 select-none">
                <button
                  onClick={() => mudarPagina(paginaAtual - 1)}
                  disabled={paginaAtual === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer"
                >
                  &lt; Anterior
                </button>

                {[...Array(totalPaginas)].map((_, i) => {
                  const numeroPagina = i + 1;
                  return (
                    <button
                      key={numeroPagina}
                      onClick={() => mudarPagina(numeroPagina)}
                      className={`px-3 py-1 border rounded ${
                        paginaAtual === numeroPagina ? "bg-red-300" : ""
                      }`}
                    >
                      {numeroPagina}
                    </button>
                  );
                })}

                <button
                  onClick={() => mudarPagina(paginaAtual + 1)}
                  disabled={paginaAtual === totalPaginas}
                  className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer"
                >
                  Próxima &gt;
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