"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/layout/layout";

export default function Filiados() {
  //Função global para obter o token
  const getToken = () => localStorage.getItem("token");
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
      const token = localStorage.getItem("token");
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${getToken()}` },
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
        headers: { Authorization: `Bearer ${getToken()}` },
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
          alert("CEP não encontrado.");
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
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  // Enviar usuário novo ao backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações no frontend
    //CPF deve ter 11 dígitos numéricos
    if (novoUsuario.cpf.length !== 11) {
      alert("CPF deve conter exatamente 11 dígitos.");
      return;
    }
    //Telefone deve ter 9 dígitos numéricos
    if (novoUsuario.telefone.length !== 9) {
      alert("Telefone deve conter exatamente 9 dígitos.");
      return;
    }
    //CEP deve ter 8 dígitos numéricos
    if (novoUsuario.cep.length !== 8) {
      alert("CEP deve conter exatamente 8 dígitos.");
      return;
    }
    //Estado deve ter duas letras maiúsculas
    if (novoUsuario.estado.length !== 2) {
      alert("Estado deve ser uma sigla de 2 caracteres.");
      return;
    }

    // Verificar se já existe usuário com mesmo CPF localmente
    const existe = usuarios.find(u => u.cpf === novoUsuario.cpf);
    if (existe) {
      alert("Usuário com este CPF já está cadastrado.");
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
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
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", err);
      alert(err.message || "Erro ao cadastrar usuário.");
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
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(novoUsuario),
      });

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.message || "Erro ao editar usuário");
      }

      alert("Usuário atualizado com sucesso!");
      setAbrirModalEditar(false);
      fetchUsuarios();
    } catch (error) {
      alert(error.message);
    }
  };

  // Confirmar exclusão
  const confirmarExclusao = async () => {
    try {
      const res = await fetch(`${API_URL}/${usuarioSelecionado.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.message || "Erro ao excluir usuário");
      }

      alert("Usuário excluído com sucesso!");
      setAbrirModalExcluir(false);
      fetchUsuarios();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <>
      <Layout>
        {/*Título da página*/}
        <h1 className="text-xl font-bold mb-2">
          FILIADOS
        </h1>

        {/*Botão de cadastrar novo usuário*/}
        <button
          onClick={() => setAbrirModal(true)}
          className="border p-2 rounded-md bg-blue-500 text-white mt-2"
        >
          <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7 7V5" />
          </svg>
          Novo Usuário
        </button>

        {/*Barra de pesquisa dos usuários por CPF*/}
        <div className="mt-4 flex items-center gap-2">
          <input
            type="text"
            placeholder="Buscar por CPF..."
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

        {/* Modal de novo usuário*/}
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

                {/*Função de listar os tipos de desconto*/}
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

        {/* Modal de editar usuário*/}
        {abrirModalEditar && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl mb-3 font-bold">Editar Usuário</h2>
              <form onSubmit={salvarEdicao} className="flex flex-col gap-3">
                {Object.keys(novoUsuario).map((key) => {
                  if (key !== "tipodesconto") {
                    return (
                      <div key={key}>
                        <label className="capitalize">{key.replace("_", " ")}</label>
                        <input
                          type={key === "data_nascimento" ? "date" : "text"}
                          name={key}
                          value={novoUsuario[key]}
                          onChange={handleChange}
                          className="border rounded-md p-2 w-full"
                          required
                          disabled={key === "cpf"}
                        />
                      </div>
                    );
                  }
                  return null;
                })}

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

                <button type="submit" className="bg-green-600 text-white rounded-md p-2">
                  Salvar Alterações
                </button>
              </form>
              <button
                onClick={() => setAbrirModalEditar(false)}
                className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
              >
                &times;
              </button>
            </div>
          </div>
        )}


        {/* Modal de excluir usuário */}
        {abrirModalExcluir && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg mb-3 font-bold">Confirmar exclusão</h2>
              <p>Deseja realmente excluir o usuário <b>{usuarioSelecionado?.nome}</b>?</p>
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={confirmarExclusao}
                  className="bg-red-600 text-white rounded-md p-2"
                >
                  Excluir
                </button>
                <button
                  onClick={() => setAbrirModalExcluir(false)}
                  className="bg-gray-300 rounded-md p-2"
                >
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
                      <th className="p-2">Ações</th>
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
                        <td className="p-2 flex gap-3">
                          <button onClick={() => abrirEdicao(u)} title="Editar">
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
                          <button onClick={() => abrirExclusao(u)} title="Excluir">
                            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                              <path fillRule="evenodd" d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINAÇÃO */}
              {usuariosFiltrados.length >= itensPorPagina && (
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
                        className={`px-3 py-1 border rounded ${paginaAtual === numeroPagina ? "bg-red-300" : ""}`}
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