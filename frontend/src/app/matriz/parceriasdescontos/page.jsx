"use client";

import { useState, useRef, useEffect } from "react";
import Layout from "@/components/layout/layout";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ParceriasDescontos() {
  const [abrirModalParceria, setAbrirModalParceria] = useState(false);
  const [abrirModalEditarParceria, setAbrirModalEditarParceria] = useState(false);
  const [parceriaEditando, setParceriaEditando] = useState(null);
  const [abrirModalExcluir, setAbrirModalExcluir] = useState(false);
  const [parceriaExcluindo, setParceriaExcluindo] = useState(null);
  const [parceiro, setParceiro] = useState("");
  const [porcentagem, setPorcentagem] = useState("");
  const [parcerias, setParcerias] = useState([]);
  const [abrirModalDesconto, setAbrirModalDesconto] = useState(false);
  const [abrirModalEditarDesconto, setAbrirModalEditarDesconto] = useState(false);
  const [descontoEditando, setDescontoEditando] = useState(null);
  const [abrirModalExcluirDesconto, setAbrirModalExcluirDesconto] = useState(false);
  const [descontoExcluindo, setDescontoExcluindo] = useState(null);
  const [tipodescontoId, setTipoDescontoId] = useState("");
  const [nomeDesconto, setNomeDesconto] = useState("");
  const [valorDesconto, setValorDesconto] = useState("");
  const [searchParceria, setSearchParceria] = useState("");
  const [searchDesconto, setSearchDesconto] = useState("");
  const [paginaParceria, setPaginaParceria] = useState(1);
  const [paginaDesconto, setPaginaDesconto] = useState(1);
  const itensPorPagina = 15;
  const [descontos, setDescontos] = useState([]);
  const [activeTab, setActiveTab] = useState("parcerias");
  const [lineStyle, setLineStyle] = useState({});
  const [erro, setErro] = useState("");
  const refs = {
    parcerias: useRef(null),
    descontos: useRef(null),
  };
  const API_URL = "http://localhost:8080";

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  //Funções de Busca de Dados
  useEffect(() => {
    const fetchParcerias = async () => {
      try {
        const res = await fetch(`${API_URL}/parcerias`, {
          headers: {  "Content-Type": "application/json", Authorization: `Bearer ${token}`},
        });
        const data = await res.json();
        setParcerias(data);
      } catch (error) {
        console.error("Erro ao carregar parcerias:", error);
      }
    };

    const fetchDescontos = async () => {
      try {
        const res = await fetch(`${API_URL}/api/descontos`, { 
          headers: {  "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
            console.error(`Erro ao carregar descontos: Status HTTP ${res.status}`);
            try {
                const errorData = await res.json();
                console.error("Detalhes do erro:", errorData);
            } catch (e) {
                console.warn("Não foi possível ler o JSON do erro de resposta.");
            }
            setDescontos([]);
            return; 
        }

        const data = await res.json();
        console.log("Descontos da API:", data);
        
        setDescontos(Array.isArray(data) ? data : []); 

      } catch (error) {
        console.error("Erro ao carregar descontos (fetch/json parse):", error);
        setDescontos([]);
      }
    };

    fetchParcerias();
    fetchDescontos();
  }, []);

  // Atualizar a linha ativa com base na aba selecionada
  useEffect(() => {
    const current = refs[activeTab]?.current;
    if (current) {
      setLineStyle({
        width: current.offsetWidth + "px",
        left: current.offsetLeft + "px",
        top: "calc(100% + 5px)",
        transition: "left 0.3s ease, width 0.3s ease, top 0.3s ease",
      });
    }
  }, [activeTab]);

  // Função para criar uma nova parceria
  const criarParceria = async () => {
    if (!parceiro || !porcentagem) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/parcerias`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ parceiro, porcentagem }),
      });

      const data = await res.json();
      if (res.ok) {
        const resParcerias = await fetch(`${API_URL}/parcerias`, {
          headers: {  "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        const parceriasData = await resParcerias.json();
        setParcerias(parceriasData);
        setAbrirModalParceria(false);
        setParceiro("");
        setPorcentagem("");
        setErro("");

        toast.success("Parceiro criado com sucesso!");
      } else {
        toast.error(data.message || "Erro ao criar parceria");
      }
    } catch (error) {
      toast.error("Erro ao criar parceria:", error);
      setErro("Erro ao criar parceria.");
    }
  };

  const abrirEdicao = (parceria) => {
    setParceriaEditando(parceria);
    setParceiro(parceria.parceiro);
    setPorcentagem(parceria.porcentagem);
    setAbrirModalEditarParceria(true);
  };

  const salvarEdicao = async () => {
    if (!parceiro || !porcentagem) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/parcerias/${parceriaEditando.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ parceiro, porcentagem }),
      });

      const data = await res.json();

      if (res.ok) {
        const resParcerias = await fetch(`${API_URL}/parcerias`, {
          headers: {  "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        const parceriasData = await resParcerias.json();
        setParcerias(parceriasData);
        setAbrirModalEditarParceria(false);
        setParceriaEditando(null);
        setParceiro("");
        setPorcentagem("");
        setErro("");

        toast.success("Parceiro editado com sucesso!");
      } else {
        toast.error(data.message || "Erro ao atualizar parceria.");
      }
    } catch (error) {
      toast.error("Erro ao atualizar parceria:", error);
      setErro("Erro ao atualizar parceria.");
    }
  };

  // Função para abrir o modal de exclusão
  const abrirExclusao = (parceria) => {
    setParceriaExcluindo(parceria);
    setAbrirModalExcluir(true);
  };

  // Função para excluir parceria
  const excluirParceria = async () => {
    if (!parceriaExcluindo) return;
    try {
      const res = await fetch(`${API_URL}/parcerias/${parceriaExcluindo.id}`, {
        method: "DELETE",
        headers: {  "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setParcerias(parcerias.filter(p => p.id !== parceriaExcluindo.id));
        setAbrirModalExcluir(false);

        toast.success("Parceiro excluído com sucesso!");
      } else {
        toast.error(data.message || "Erro ao excluir parceria.");
      }
    } catch (error) {
      toast.error("Erro ao excluir parceria:", error);
      toast.error("Erro ao excluir parceria.");
    }
  };

  // Criar desconto
  const criarDesconto = async () => {
    if (!tipodescontoId || !nomeDesconto || !valorDesconto) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/descontos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tipodesconto_id: tipodescontoId,
          nome: nomeDesconto,
          desconto: valorDesconto,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const resDescontos = await fetch(`${API_URL}/api/descontos`, {
          headers: {  "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        const descontosData = await resDescontos.json();
        setDescontos(descontosData);
        setAbrirModalDesconto(false);
        setTipoDescontoId("");
        setNomeDesconto("");
        setValorDesconto("");
        setErro("");

        toast.success("Desconto criado com sucesso!");
      } else {
        toast.error(data.message || "Erro ao criar desconto.");
      }
    } catch (error) {
      toast.error("Erro ao criar desconto:", error);
      setErro(error.message || "Erro ao criar desconto.");
    }
  };

  const abrirEdicaoDesconto = (desconto) => {
    setDescontoEditando(desconto);
    setTipoDescontoId(desconto.tipodesconto_id);
    setNomeDesconto(desconto.nome);
    setValorDesconto(desconto.desconto);
    setAbrirModalEditarDesconto(true);
  };

  const salvarEdicaoDesconto = async () => {
    if (!tipodescontoId || !nomeDesconto || !valorDesconto) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/descontos/${descontoEditando.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tipodesconto_id: tipodescontoId,
          nome: nomeDesconto,
          desconto: valorDesconto,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const resDescontos = await fetch(`${API_URL}/api/descontos`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        const descontosData = await resDescontos.json();
        setDescontos(descontosData);
        setAbrirModalEditarDesconto(false);
        setDescontoEditando(null);
        setTipoDescontoId("");
        setNomeDesconto("");
        setValorDesconto("");
        setErro("");

        toast.success("Desconto editado com sucesso!");
      } else {
        toast.error(data.message || "Erro ao atualizar desconto.");
      }
    } catch (error) {
      toast.error("Erro ao atualizar desconto:", error);
      setErro("Erro ao atualizar desconto.");
    }
  };

  const abrirExclusaoDesconto = (desconto) => {
    setDescontoExcluindo(desconto);
    setAbrirModalExcluirDesconto(true);
  };

  const excluirDesconto = async () => {
    if (!descontoExcluindo) return;
    try {
      const res = await fetch(`${API_URL}/api/descontos/${descontoExcluindo.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setDescontos(descontos.filter(d => d.id !== descontoExcluindo.id));
        setAbrirModalExcluirDesconto(false);

        toast.success("Desconto excluído com sucesso!");
      } else {
        toast.error(data.message || "Erro ao excluir desconto.");
      }
    } catch (error) {
      toast.error("Erro ao excluir desconto:", error);
      alert("Erro ao excluir desconto.");
    }
  };

  // Função para filtrar as parcerias pelo nome
  const filteredParcerias = parcerias.filter(parceria =>
    parceria.parceiro.toLowerCase().includes(searchParceria.toLowerCase())
  );

  // Função para filtrar os descontos pelo nome
  const filteredDescontos = Array.isArray(descontos)
    ? descontos.filter(desconto =>
      desconto.nome?.toLowerCase().includes(searchDesconto.toLowerCase())
    )
    : [];

  // Paginação das parcerias
  const startParceria = (paginaParceria - 1) * itensPorPagina;
  const paginatedParcerias = parcerias
    .filter((p) => p.parceiro.toLowerCase().includes(searchParceria.toLowerCase()))
    .slice(startParceria, startParceria + itensPorPagina);
  const totalPaginasParcerias = Math.ceil(
    parcerias.filter((p) => p.parceiro.toLowerCase().includes(searchParceria.toLowerCase())).length / itensPorPagina
  );

  // Paginação dos descontos
  const startDesconto = (paginaDesconto - 1) * itensPorPagina;
  const paginatedDescontos = descontos
    .filter((d) => d.nome.toLowerCase().includes(searchDesconto.toLowerCase()))
    .slice(startDesconto, startDesconto + itensPorPagina);
  const totalPaginasDescontos = Math.ceil(
    descontos.filter((d) => d.nome.toLowerCase().includes(searchDesconto.toLowerCase())).length / itensPorPagina
  );

  return (
    <>
      <Layout>
        {/* Título da página */}
        <h1 className="text-xl font-bold mb-4 mt-4 ml-2">PARCERIAS E DESCONTOS</h1>

        {/* Barra de navegação */}
        <div className="flex gap-6 mb-6 relative ml-2">
          <button
            ref={refs.parcerias}
            onClick={() => setActiveTab("parcerias")}
            className={`${activeTab === "parcerias" ? "text-[#245757]" : "text-gray-700"} hover:text-[#245757] focus:outline-none transition-colors duration-300 ease-in-out pb-2`}>
            Parcerias
          </button>
          <button
            ref={refs.descontos}
            onClick={() => setActiveTab("descontos")}
            className={`${activeTab === "descontos" ? "text-[#245757]" : "text-gray-700"} hover:text-[#245757] focus:outline-none transition-colors duration-300 ease-in-out pb-2`}>
            Descontos
          </button>

          {/* Linha cinza de fundo */}
          <div className="absolute h-1 bg-gray-300 left-0 right-0" style={{ top: "100%" }}></div>

          {/* Linha ativa */}
          <div className="absolute h-1 bg-[#245757]" style={lineStyle}></div>
        </div>

        {/* Seção de Parcerias */}
        <div className="mt-6">
          {activeTab === "parcerias" && (
            <section>
              {/* Botão de criar parceria */}
              <button onClick={() => {
                setAbrirModalParceria(true);
                setParceiro("");
                setPorcentagem("");
                setErro("");
                setParceriaEditando(null);
              }}
                className="flex items-center gap-1 border p-2 rounded-md bg-[#245757] text-white mt-2 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0">
                <svg className="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7 7V5" />
                </svg>
                Novo Parceiro
              </button>

              {/* Barra de pesquisa */}
              <div className="mb-4">
                <div className="relative w-64">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-6 h-6 text-gray-400 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-full focus:ring-2 focus:outline-none placeholder-gray-400 focus:ring-[#245757] focus:border-[#245757] transition"
                    value={searchParceria}
                    onChange={(e) => setSearchParceria(e.target.value)}
                  />
                </div>
              </div>

              {/* Modal para criar nova parceria */}
              {abrirModalParceria && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 shadow-inner z-50">
                  <div className="bg-white p-7 rounded-xl shadow-2xl relative w-full max-w-sm animate-fadeIn">
                    <button
                      onClick={() => {
                        setAbrirModalParceria(false);
                        setParceiro("");
                        setPorcentagem("");
                        setErro("");
                      }}
                      className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <h2 className="text-xl font-bold text-[#245757] tracking-wide">
                      Criar Parceria
                    </h2>
                    <hr className="border-[#245757]/40 mb-5 mt-3" />
                    <input
                      type="text"
                      value={parceiro}
                      onChange={(e) => setParceiro(e.target.value)}
                      placeholder="Nome do Parceiro"
                      className="p-3 mb-4 w-full border rounded-lg bg-gray-100 focus:ring-2 focus:ring-[#245757] focus:border-[#245757] transition outline-none" />
                    <input
                      type="number"
                      value={porcentagem}
                      onChange={(e) => setPorcentagem(e.target.value)}
                      placeholder="Porcentagem (%)"
                      className="p-3 mb-4 w-full border rounded-lg bg-gray-100 focus:ring-2 focus:ring-[#245757] focus:border-[#245757] transition outline-none" />
                    {erro && <p className="text-red-500 mt-1 text-sm">{erro}</p>}
                    <div className="flex justify-end mt-6">
                      <button
                        onClick={criarParceria}
                        className="bg-[#245757] text-white px-5 py-2.5 rounded-lg hover:bg-[#1b4343] transition transform hover:scale-[1.03] active:scale-95 shadow-md">
                        Criar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal para editar parceria */}
              {abrirModalEditarParceria && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 shadow-inner z-50">
                  <div className="bg-white p-7 rounded-xl shadow-2xl relative w-full max-w-sm animate-fadeIn">
                    <button
                      onClick={() => {
                        setAbrirModalEditarParceria(false);
                        setParceriaEditando(null);
                        setParceiro("");
                        setPorcentagem("");
                        setErro("");
                      }}
                      className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <h2 className="text-xl font-bold text-[#245757] tracking-wide">
                      Editar Parceria
                    </h2>
                    <hr className="border-[#245757]/40 mb-5 mt-3" />
                    <input
                      type="text"
                      value={parceiro}
                      onChange={(e) => setParceiro(e.target.value)}
                      placeholder="Nome do Parceiro"
                      className="p-3 mb-4 w-full bg-gray-100 border rounded-lg focus:ring-2 focus:ring-[#245757] focus:border-[#245757] transition outline-none" />
                    <input
                      type="number"
                      value={porcentagem}
                      onChange={(e) => setPorcentagem(e.target.value)}
                      placeholder="Porcentagem (%)"
                      className="p-3 mb-4 w-full bg-gray-100 border rounded-lg focus:ring-2 focus:ring-[#245757] focus:border-[#245757] transition outline-none" />
                    {erro && <p className="text-red-500 mt-1 text-sm">{erro}</p>}
                    <div className="flex justify-end mt-6">
                      <button
                        onClick={salvarEdicao}
                        className="bg-[#245757] text-white px-5 py-2.5 rounded-lg hover:bg-[#1b4343] transition transform hover:scale-[1.03] active:scale-95 shadow-md">
                        Salvar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal para confirmação de exclusão */}
              {abrirModalExcluir && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 shadow-inner z-50">
                  <div className="bg-white p-7 rounded-xl shadow-2xl relative w-full max-w-sm animate-fadeIn">
                    <button
                      onClick={() => setAbrirModalExcluir(false)}
                      className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <h2 className="text-xl font-bold text-[#245757] tracking-wide">
                      Excluir Parceria
                    </h2>
                    <hr className="border-[#245757]/40 mb-5 mt-3" />
                    <p className="text-gray-700 leading-relaxed">
                      Tem certeza que deseja excluir a parceria{" "}
                      <span className="font-semibold">{parceriaExcluindo?.parceiro}</span>?
                    </p>
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={() => setAbrirModalExcluir(false)}
                        className="bg-[#245757] text-white px-5 py-2.5 rounded-lg hover:bg-[#1b4343] transition transform hover:scale-[1.03] active:scale-95 shadow-md">
                        Cancelar
                      </button>
                      <button
                        onClick={excluirParceria}
                        className="bg-[#245757] text-white px-5 py-2.5 rounded-lg hover:bg-[#1b4343] transition transform hover:scale-[1.03] active:scale-95 shadow-md">
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabela de Parcerias */}
              {paginatedParcerias.length === 0 ? (
                <p className="text-center text-gray-500 mt-6 text-lg">Nenhuma parceria encontrada</p>
              ) : (
                <div className="mt-6 overflow-x-auto shadow-md rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-[#245757] text-white">
                      <tr>
                        <th className="p-3 text-left">ID</th>
                        <th className="p-3 text-left">Parceiro</th>
                        <th className="p-3 text-left">Porcentagem</th>
                        <th className="p-3 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedParcerias.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="p-3">{p.id}</td>
                          <td className="p-3 font-medium">{p.parceiro}</td>
                          <td className="p-3">{parseFloat(p.porcentagem * 100).toFixed(0)}%</td>
                          <td className="p-3 flex justify-center items-center gap-3">
                            <button onClick={() => abrirEdicao(p)} title="Editar" className="text-[#245757] hover:text-green-600 transition-colors">
                              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z" />
                              </svg>
                            </button>
                            <button onClick={() => abrirExclusao(p)} title="Excluir" className="text-[#245757] hover:text-green-600 transition-colors">
                              <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" clipRule="evenodd" d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Paginação de Parcerias */}
              {totalPaginasParcerias > 1 && (
                <div className="flex justify-center items-center gap-3 mt-4">
                  <button
                    onClick={() => setPaginaParceria((prev) => Math.max(prev - 1, 1))}
                    disabled={paginaParceria === 1}
                    className="px-3 py-1.5 rounded-full border border-gray-300 bg-white shadow-sm text-gray-700 text-sm font-medium hover:bg-gray-100 hover:shadow disabled:opacity-40 disabled:cursor-not-allowed">
                    ← Anterior
                  </button>
                  <span
                    className="px-4 py-1.5 rounded-full bg-[#245757] text-white text-sm font-semibold shadow">
                    {paginaParceria}
                  </span>
                  <button
                    onClick={() => setPaginaParceria((prev) => Math.min(prev + 1, totalPaginasParcerias))}
                    disabled={paginaParceria === totalPaginasParcerias || totalPaginasParcerias === 0}
                    className="px-3 py-1.5 rounded-full border border-gray-300 bg-white shadow-sm text-gray-700 text-sm font-medium hover:bg-gray-100 hover:shadow disabled:opacity-40 disabled:cursor-not-allowed">
                    Próxima →
                  </button>
                </div>
              )}
            </section>
          )}

          {/* Seção de Descontos */}
          {activeTab === "descontos" && (
            <section>
              {/* Botão de criar desconto */}
              <button
                onClick={() => {
                  setAbrirModalDesconto(true);
                  setTipoDescontoId("");
                  setNomeDesconto("");
                  setValorDesconto("");
                  setErro("");
                  setDescontoEditando(null);
                }}
                className="flex items-center gap-1 border p-2 rounded-md bg-[#245757] text-white mt-2 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
              >
                <svg className="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7 7V5" />
                </svg>
                Novo Desconto
              </button>

              {/* Barra de pesquisa */}
              <div className="mb-4">
                <div className="relative w-64">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-6 h-6 text-gray-400 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-full focus:ring-2 focus:outline-none placeholder-gray-400 focus:ring-[#245757] focus:border-[#245757] transition"
                    value={searchDesconto}
                    onChange={(e) => setSearchDesconto(e.target.value)}
                  />
                </div>
              </div>

              {/* Modal para criar novo desconto */}
              {abrirModalDesconto && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 shadow-inner z-50">
                  <div className="bg-white p-7 rounded-xl shadow-2xl relative w-full max-w-sm animate-fadeIn">
                    <button
                      onClick={() => {
                        setAbrirModalDesconto(false);
                        setTipoDescontoId("");
                        setNomeDesconto("");
                        setValorDesconto("");
                        setErro("");
                      }}
                      className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition">
                      <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <h2 className="text-xl font-bold text-[#245757] tracking-wide">
                      Criar Novo Desconto
                    </h2>
                    <hr className="border-[#245757]/40 mb-5 mt-3" />
                    <input
                      type="number"
                      value={tipodescontoId}
                      onChange={(e) => setTipoDescontoId(e.target.value)}
                      placeholder="ID Tipo de Desconto"
                      className="p-3 mb-4 w-full bg-gray-100 border rounded-lg focus:ring-2 focus:ring-[#245757] focus:border-[#245757] transition outline-none" />
                    <input
                      type="text"
                      value={nomeDesconto}
                      onChange={(e) => setNomeDesconto(e.target.value)}
                      placeholder="Nome do Desconto"
                      className="p-3 mb-4 w-full bg-gray-100 border rounded-lg focus:ring-2 focus:ring-[#245757] focus:border-[#245757] transition outline-none" />
                    <input
                      type="number"
                      value={valorDesconto}
                      onChange={(e) => setValorDesconto(e.target.value)}
                      placeholder="Valor do Desconto"
                      className="p-3 mb-4 w-full bg-gray-100 border rounded-lg focus:ring-2 focus:ring-[#245757] focus:border-[#245757] transition outline-none" />
                    {erro && <p className="text-red-500 mt-1 text-sm">{erro}</p>}
                    <div className="flex justify-end mt-6">
                      <button
                        onClick={criarDesconto}
                        className="bg-[#245757] text-white px-5 py-2.5 rounded-lg hover:bg-[#1b4343] transition transform hover:scale-[1.03] active:scale-95 shadow-md">
                        Criar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal para editar desconto */}
              {abrirModalEditarDesconto && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 shadow-inner z-50">
                  <div className="bg-white p-7 rounded-xl shadow-2xl relative w-full max-w-sm animate-fadeIn">
                    <button
                      onClick={() => {
                        setAbrirModalEditarDesconto(false);
                        setDescontoEditando(null);
                        setTipoDescontoId("");
                        setNomeDesconto("");
                        setValorDesconto("");
                        setErro("");
                      }}
                      className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <h2 className="text-xl font-bold text-[#245757] tracking-wide">
                      Editar Desconto
                    </h2>
                    <hr className="border-[#245757]/40 mb-5 mt-3" />
                    <input
                      type="number"
                      value={tipodescontoId}
                      onChange={(e) => setTipoDescontoId(e.target.value)}
                      placeholder="ID Tipo de Desconto"
                      className="p-3 mb-4 w-full bg-gray-100 border rounded-lg focus:ring-2 focus:ring-[#245757] focus:border-[#245757] transition outline-none" />
                    <input
                      type="text"
                      value={nomeDesconto}
                      onChange={(e) => setNomeDesconto(e.target.value)}
                      placeholder="Nome do Desconto"
                      className="p-3 mb-4 w-full bg-gray-100 border rounded-lg focus:ring-2 focus:ring-[#245757] focus:border-[#245757] transition outline-none" />
                    <input
                      type="number"
                      value={valorDesconto}
                      onChange={(e) => setValorDesconto(e.target.value)}
                      placeholder="Valor do Desconto"
                      className="p-3 mb-4 w-full bg-gray-100 border rounded-lg focus:ring-2 focus:ring-[#245757] focus:border-[#245757] transition outline-none" />
                    {erro && <p className="text-red-500 mt-1 text-sm">{erro}</p>}
                    <div className="flex justify-end mt-6">
                      <button
                        onClick={salvarEdicaoDesconto}
                        className="bg-[#245757] text-white px-5 py-2.5 rounded-lg hover:bg-[#1b4343] transition transform hover:scale-[1.03] active:scale-95 shadow-md">
                        Salvar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal para confirmação de exclusão do desconto */}
              {abrirModalExcluirDesconto && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 shadow-inner z-50">
                  <div className="bg-white p-7 rounded-xl shadow-2xl relative w-full max-w-sm animate-fadeIn">
                    <button
                      onClick={() => setAbrirModalExcluirDesconto(false)}
                      className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition">
                      <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <h2 className="text-xl font-bold text-[#245757] tracking-wide">
                      Excluir Desconto
                    </h2>
                    <hr className="border-[#245757]/40 mb-5 mt-3" />
                    <p className="text-gray-700 leading-relaxed">
                      Tem certeza que deseja excluir o desconto{" "}
                      <span className="font-semibold">{descontoExcluindo?.nome}</span>?
                    </p>
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={() => setAbrirModalExcluirDesconto(false)}
                        className="bg-[#245757] text-white px-5 py-2.5 rounded-lg hover:bg-[#1b4343] transition transform hover:scale-[1.03] active:scale-95 shadow-md">
                        Cancelar
                      </button>
                      <button
                        onClick={excluirDesconto}
                        className="bg-[#245757] text-white px-5 py-2.5 rounded-lg hover:bg-[#1b4343]red-700 transition transform hover:scale-[1.03] active:scale-95 shadow-md">
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabela de Descontos */}
              {paginatedDescontos.length === 0 ? (
                <p className="text-center text-gray-500 mt-6 text-lg">Nenhum desconto encontrado</p>
              ) : (
                <div className="mt-6 overflow-x-auto shadow-md rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-[#245757] text-white">
                      <tr>
                        <th className="p-3 text-left">ID</th>
                        <th className="p-3 text-left">ID Tipo</th>
                        <th className="p-3 text-left">Nome</th>
                        <th className="p-3 text-left">Desconto</th>
                        <th className="p-3 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedDescontos.map((d) => (
                        <tr key={d.id} className="hover:bg-gray-50">
                          <td className="p-3">{d.id}</td>
                          <td className="p-3">{d.tipodesconto_id}</td>
                          <td className="p-3">{d.nome}</td>
                          <td className="p-3">
                            {parseFloat(d.desconto * 100).toFixed(0)}%
                          </td>
                          <td className="p-3 flex justify-center items-center gap-3">
                            <button onClick={() => abrirEdicaoDesconto(d)} title="Editar" className="text-[#245757] hover:text-green-600 transition-colors">
                              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z" />
                              </svg>
                            </button>
                            <button onClick={() => abrirExclusaoDesconto(d)} title="Excluir" className="text-[#245757] hover:text-green-600 transition-colors">
                              <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Paginação de Descontos */}
              {totalPaginasDescontos > 1 && (
                <div className="flex justify-center items-center gap-3 mt-4">
                  <button
                    onClick={() => setPaginaDesconto((prev) => Math.max(prev - 1, 1))}
                    disabled={paginaDesconto === 1}
                    className=" px-3 py-1.5 rounded-full border border-gray-300 bg-white shadow-sm text-gray-700 text-sm font-medium hover:bg-gray-100 hover:shadow disabled:opacity-40 disabled:cursor-not-allowed">
                    ← Anterior
                  </button>
                  <span
                    className="px-4 py-1.5 rounded-full bg-[#245757] text-white text-sm font-semibold shadow">
                    {paginaDesconto}
                  </span>
                  <button
                    onClick={() => setPaginaDesconto((prev) => Math.min(prev + 1, totalPaginasDescontos))}
                    disabled={paginaDesconto === totalPaginasDescontos || totalPaginasDescontos === 0}
                    className="px-3 py-1.5 rounded-full border border-gray-300 bg-white shadow-sm text-gray-700 text-sm font-medium hover:bg-gray-100 hover:shadow disabled:opacity-40 disabled:cursor-not-allowed">
                    Próxima →
                  </button>
                </div>
              )}
            </section>
          )}
        </div>
      </Layout>
    </>
  );
}