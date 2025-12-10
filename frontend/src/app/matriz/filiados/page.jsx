"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/layout/layout";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Filiados() {
  //Constantes utilizadas nas funcionalidades do código
  const [abrirModal, setAbrirModal] = useState(false);
  const [abrirModalEditar, setAbrirModalEditar] = useState(false);
  const [abrirModalExcluir, setAbrirModalExcluir] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
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

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Buscar usuários do backend
  useEffect(() => {
    fetchUsuarios();
    fetchTiposDescontos();
  }, []);

  // Resetar o estado de novoUsuario quando o modal de "Novo Usuário" for aberto
  useEffect(() => {
    if (abrirModal) {
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
    }
  }, [abrirModal]);

  const fetchUsuarios = async () => {
    try {
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
      const res = await fetch("http://localhost:8080/api/tiposdescontos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTiposDescontos(data);
    } catch (error) {
      console.error("Erro ao carregar tipos de descontos:", error);
    }
  };

  // Cálculo dos usuários que vão aparecer na página atual
  const indexUltimo = paginaAtual * itensPorPagina;
  const indexPrimeiro = indexUltimo - itensPorPagina;
  const usuariosFiltrados = usuarios.filter((u) =>
    u.cpf?.toLowerCase().includes(buscaCPF.toLowerCase())
  );
  const usuariosPagina = usuariosFiltrados.slice(indexPrimeiro, indexUltimo);
  // Calcular total de páginas
  const totalPaginas = Math.ceil(usuariosFiltrados.length / itensPorPagina);

  // Função para mudar página
  const mudarPagina = (numero) => {
    if (numero < 1) numero = 1;
    if (numero > totalPaginas) numero = totalPaginas;
    setPaginaAtual(numero);
  };

  // Atualizar estado dos inputs e ligar com a API
  const handleChange = async (e) => {
    const { name, value } = e.target;

    // Atualiza o valor do input normalmente
    setNovoUsuario((prev) => ({
      ...prev,
      [name]: name === "estado" ? value.toUpperCase() : value,
    }));

    // Se o campo alterado for o CEP e tiver 8 dígitos, chama o ViaCEP
    if (name === "cep" && value.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${value}/json/`);
        const data = await res.json();

        if (!data.erro) {
          // Atualiza os campos complementares com os dados retornados
          setNovoUsuario((prev) => ({
            ...prev,
            cidade: data.localidade || "",
            estado: data.uf || "",
            bairro: data.bairro || "",
            logradouro: data.logradouro || "",
          }));
        } else {
          toast.error("CEP não encontrado.");
          // Limpa os campos complementares caso o CEP não exista
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

  // Enviar usuário novo ao backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações no frontend
    //CPF deve ter 11 dígitos numéricos
    if (novoUsuario.cpf.length !== 11) {
      toast.error("CPF deve conter exatamente 11 dígitos.");
      return;
    }
    //Telefone deve ter 9 dígitos numéricos
    if (novoUsuario.telefone.length !== 9) {
      toast.error("Telefone deve conter exatamente 9 dígitos.");
      return;
    }
    //CEP deve ter 8 dígitos numéricos
    if (novoUsuario.cep.length !== 8) {
      toast.error("CEP deve conter exatamente 8 dígitos.");
      return;
    }
    //Estado deve ter duas letras maiúsculas
    if (novoUsuario.estado.length !== 2) {
      toast.error("Estado deve ser uma sigla de 2 caracteres.");
      return;
    }

    // Verificar se já existe usuário com mesmo CPF localmente
    const existe = usuarios.find(u => u.cpf === novoUsuario.cpf);
    if (existe) {
      toast.error("Usuário com este CPF já está cadastrado.");
      return;
    }

    try {
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
        toast.error(erroMsg);
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
    } catch (error) {
      toast.error(error.message || "Erro ao cadastrar usuário.");
    }
  };

  // Abrir modal de edição
  const abrirEdicao = (usuario) => {
    const formatarData = (dataISO) => {
      if (!dataISO) return "";
      const d = new Date(dataISO);
      const ano = d.getFullYear();
      const mes = String(d.getMonth() + 1).padStart(2, "0");
      const dia = String(d.getDate()).padStart(2, "0");
      return `${ano}-${mes}-${dia}`;
    };

    setUsuarioSelecionado(usuario);
    setNovoUsuario({
      ...usuario,
      data_nascimento: formatarData(usuario.data_nascimento),
    });
    setAbrirModalEditar(true);
  };
  // Abrir modal de exclusão
  const abrirExclusao = (usuario) => {
    setUsuarioSelecionado(usuario);
    setAbrirModalExcluir(true);
  };

  // Salvar edição
  const salvarEdicao = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch(`${API_URL}/${usuarioSelecionado.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(novoUsuario),
    });

    // apenas UMA leitura do body
    const bodyText = await res.text();
    let bodyJson = null;

    try {
      bodyJson = JSON.parse(bodyText);
    } catch {}

    if (!res.ok) {
      const mensagem =
        bodyJson?.message ||
        bodyJson?.mensagem ||
        bodyText ||
        "Erro ao editar usuário";

      toast.error(mensagem);
      throw new Error(mensagem);
    }

    toast.success("Usuário atualizado com sucesso!");
    setAbrirModalEditar(false);
    fetchUsuarios();

  } catch (error) {
    toast.error(error.message || "Erro ao editar usuário.");
  }
};

  // Confirmar exclusão
  const confirmarExclusao = async () => {
    try {
      const res = await fetch(`${API_URL}/${usuarioSelecionado.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        toast.error("Erro ao excluir usuário");
        throw new Error("Erro ao excluir usuário");
      }

      toast.success("Usuário excluído com sucesso!");
      setAbrirModalExcluir(false);
      fetchUsuarios();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <Layout>
        {/*Título da página*/}
        <h1 className="text-xl font-bold mb-2">
          FILIADOS
        </h1>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Barra de pesquisa */}
        <div className="mt-4 flex items-center">
          <div className="relative w-64">
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
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#245757] focus:border-[#245757] transition" />
          </div>
        </div> 
        
        {/*Botão de cadastrar novo usuário*/}
        <div className="flex justify-end">
        <button
          onClick={() => setAbrirModal(true)}
          className="flex items-center gap-2 cursor-pointer border px-4 py-2.5 rounded-lg bg-[#245757] text-white text-sm font-semibold shadow-sm hover:bg-[#245757] transition">
          <svg className="w-6 h-6 text-white dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7 7V5" />
          </svg>
          Novo Usuário
        </button>  
        </div>
        </div>
       
        {/* Modal de novo usuário */}
        {abrirModal && (
          <div className="fixed inset-0 flex justify-center items-center bg-black/30 shadow-inner z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-7 relative max-h-[90vh] overflow-y-auto animate-fadeIn">
              <button
                onClick={() => setAbrirModal(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition">
                <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-xl font-bold text-[#245757] tracking-wide">
                Novo Usuário
              </h2>
              <hr className="border-[#245757]/40 mb-5 mt-3" />
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
                    <input
                      type={type}
                      name={name}
                      value={novoUsuario[name]}
                      onChange={handleChange}
                      className="p-3 mb-4 w-full bg-gray-100 border rounded-lg focus:ring-2 focus:ring-[#245757] focus:border-[#245757] transition outline-none"
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
                    className="p-3 mb-4 w-full bg-gray-100 border rounded-lg focus:ring-2 focus:ring-[#245757] focus:border-[#245757] transition outline-none"
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
                    className="bg-[#245757] text-white px-5 py-2.5 rounded-lg hover:bg-[#1b4343] transition transform hover:scale-[1.03] active:scale-95 shadow-md">
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de editar usuário */}
        {abrirModalEditar && (
          <div className="fixed inset-0 flex justify-center items-center bg-black/30 shadow-inner z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-7 relative max-h-[90vh] overflow-y-auto animate-fadeIn">
              <button
                onClick={() => setAbrirModalEditar(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition z-60">
                <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-xl font-bold text-[#245757] tracking-wide text-left">
                Editar Usuário
              </h2>
              <hr className="border-[#245757]/40 mb-5 mt-3" />
              <form onSubmit={salvarEdicao} className="flex flex-col gap-3">
                {Object.keys(novoUsuario).map((key) => {
                  if (key !== "tipodesconto") {
                    return (
                      <div key={key}>
                        <input
                          type={key === "data_nascimento" ? "date" : "text"}
                          name={key}
                          value={novoUsuario[key]}
                          onChange={handleChange}
                          className="p-3 mb-4 w-full bg-gray-100 border rounded-lg focus:ring-2 focus:ring-[#245757] focus:border-[#245757] transition outline-none"
                          placeholder={key.replace("_", " ").toUpperCase()}
                          required
                          disabled={key === "cpf"} />
                      </div>
                    );
                  }
                  return null;
                })}
                <div>
                  <select
                    name="tipodesconto"
                    value={novoUsuario.tipodesconto}
                    onChange={handleChange}
                    className="p-3 mb-4 w-full bg-gray-100 border rounded-lg focus:ring-2 focus:ring-[#245757] focus:border-[#245757] transition outline-none"
                    required>
                    <option value="">Selecione um tipo</option>
                    {tiposDescontos.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.tipo}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="submit"
                    className="bg-[#245757] text-white px-5 py-2.5 rounded-lg hover:bg-[#1b4343] transition transform hover:scale-[1.03] active:scale-95 shadow-md">
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de excluir usuário */}
        {abrirModalExcluir && (
          <div className="fixed inset-0 flex justify-center items-center bg-black/30 shadow-inner z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-7 max-h-[90vh] overflow-y-auto animate-fadeIn relative">
              <button
                onClick={() => setAbrirModalExcluir(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition z-60">
                <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-xl font-bold text-[#245757] tracking-wide text-left">
                Confirmar Exclusão
              </h2>
              <hr className="border-[#245757]/40 mb-5 mt-3" />
              <p className="text-gray-700 leading-relaxed">
                Deseja realmente excluir o usuário <b>{usuarioSelecionado?.nome}</b>?
              </p>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={confirmarExclusao}
                  className="bg-[#245757] text-white px-5 py-2.5 rounded-lg hover:bg-[#1b4343] transition transform hover:scale-[1.03] active:scale-95 shadow-md">
                  Excluir
                </button>
                <button
                  onClick={() => setAbrirModalExcluir(false)}
                  className="bg-[#245757] text-white px-5 py-2.5 rounded-lg hover:bg-[#1b4343] transition transform hover:scale-[1.03] active:scale-95 shadow-md">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {usuarios.length === 0 ? (
          <p className="text-center text-gray-500 mt-6 text-lg">
            Nenhum usuário encontrado
          </p>
        ) :

          usuariosFiltrados.length > 0 ? (
            <>
              {/* TABELA */}
              <div className="mt-6 w-full overflow-x-visible">
                <table className="w-full border-collapse text-xs rounded-lg overflow-hidden shadow-sm table-fixed">
                  <thead>
                    <tr className="bg-[#245757] text-white">
                      <th className="p-2 text-left truncate max-w-[120px]">Nome</th>
                      <th className="p-2 text-left truncate max-w-[120px]">E-mail</th>
                      <th className="p-2 text-left truncate max-w-[120px]">Telefone</th>
                      <th className="p-2 text-left truncate max-w-[120px]">CPF</th>
                      <th className="p-2 text-left truncate max-w-[120px]">Data de nascimento</th>
                      <th className="p-2 text-left truncate max-w-[120px]">CEP</th>
                      <th className="p-2 text-left truncate max-w-[120px]">Cidade</th>
                      <th className="p-2 text-left truncate max-w-[120px]">Estado</th>
                      <th className="p-2 text-left truncate max-w-[120px]">Bairro</th>
                      <th className="p-2 text-left truncate max-w-[120px]">Logradouro</th>
                      <th className="p-2 text-left truncate max-w-[120px]">Número</th>
                      <th className="p-2 text-left truncate max-w-[120px]">Tipo de Desconto</th>
                      <th className="p-2 text-left truncate max-w-[120px] text-center">Ações</th>
                    </tr>
                  </thead>

                  <tbody>
                    {usuariosPagina.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b hover:bg-gray-100 transition"
                      >
                        <td className="p-2 truncate max-w-[120px] font-medium">{u.nome}</td>
                        <td className="p-2 truncate max-w-[120px]">{u.email}</td>
                        <td className="p-2 truncate max-w-[120px]">{u.telefone}</td>
                        <td className="p-2 truncate max-w-[120px]">{u.cpf}</td>
                        <td className="p-2 truncate max-w-[120px]">
                          {new Date(u.data_nascimento).toLocaleDateString()}
                        </td>
                        <td className="p-2 truncate max-w-[120px]">{u.cep}</td>
                        <td className="p-2 truncate max-w-[120px]">{u.cidade}</td>
                        <td className="p-2 truncate max-w-[120px]">{u.estado}</td>
                        <td className="p-2 truncate max-w-[120px]">{u.bairro}</td>
                        <td className="p-2 truncate max-w-[120px]">{u.logradouro}</td>
                        <td className="p-2 truncate max-w-[120px]">{u.numero}</td>
                        <td className="p-2 truncate max-w-[120px]">{u.tipodesconto}</td>

                        <td className="p-3 truncate flex items-center justify-center gap-4">
                          <button onClick={() => abrirEdicao(u)} title="Editar">
                            <svg
                              className="w-6 h-6 text-[#245757]"
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

                          <button onClick={() => abrirExclusao(u)} title="Excluir">
                            <svg
                              className="w-6 h-6 text-[#245757]"
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

              {/* Paginação */}
              {usuariosFiltrados.length > itensPorPagina && (
                <div className="flex justify-center items-center gap-2 mt-4 select-none">
                  <button
                    onClick={() => mudarPagina(paginaAtual - 1)}
                    disabled={paginaAtual === 1}
                    className="px-4 py-2 rounded-full border border-green-900 text-[#245757] hover:bg-gray-100 hover:text-[#245757] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    ← Anterior
                  </button>
                  <div className="px-4 py-2 rounded-full text-white bg-[#245757]">
                    {paginaAtual}
                  </div>
                  <button
                    onClick={() => mudarPagina(paginaAtual + 1)}
                    disabled={paginaAtual === totalPaginas}
                    className="px-4 py-2 rounded-full border border-green-900 text-[#245757] hover:bg-gray-100 hover:text-[#245757] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
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