"use client";
import { useState, useEffect } from "react";

export default function Contas() {
    const estadoInicialConta = {
        nomeConta: "",
        categoria: "", // ✅ NOVO CAMPO
        dataPostada: "",
        dataVencimento: "",
        valor: "",
        status: true,
        conta_pdf: ""
    };

    const categorias = [
        "Despesas Fixas",
        "Tributos e Taxas",
        "Materiais e Suprimentos",
        "Manutenção",
        "Financeiras / Bancárias"
    ];

    const [abrirModal, setAbrirModal] = useState(false);
    const [conta, setConta] = useState([]); 
    const [novaConta, setNovaConta] = useState(estadoInicialConta);
    const [editarContaId, setEditarContaId] = useState(null);
    const [excluirContaId, setExcluirContaId] = useState(null);
    const [abrirModalExcluir, setAbrirModalExcluir] = useState(false);

    // 🔍 Filtros
    const [filtroCategoria, setFiltroCategoria] = useState(""); // ✅ NOVO FILTRO
    const [filtroTipo, setFiltroTipo] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("");

    // Paginação
    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 15;

    const API_URL = "http://localhost:8080/api/conta";

    const getHoje = () => {
        const data = new Date();
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        const dia = String(data.getDate()).padStart(2, "0");
        return `${ano}-${mes}-${dia}`;
    };

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
        const valorLimpo = valorString?.toString().replace(/[^\d.,]/g, "").replace(",", ".") || "0";
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
        const valor = parseFloat(valorString.toString().replace(/,/g, ".").replace(/[^\d.]/g, ""));
        if (isNaN(valor)) return "";
        return valor.toFixed(2).replace(".", ",");
    };

    useEffect(() => {
        fetchConta();
    }, []);

    const fetchConta = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await res.json();
            setConta(data);
        } catch (error) {
            console.error("Erro ao carregar contas:", error);
        }
    };


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === "file" && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setNovaConta((prev) => ({ ...prev, conta_pdf: reader.result.split(",")[1] }));
            };
            reader.readAsDataURL(file);
            return;
        }

        let novoValor;
        if (type === "checkbox") {
            novoValor = checked;
        } else if (name === "status") {
            novoValor = value === "true";
        } else {
            if (name === "valor") {
                novoValor = value.replace(/,/g, ".").replace(/[^\d.]/g, "");
                const partes = novoValor.split(".");
                if (partes.length > 2) {
                    novoValor = partes[0] + "." + partes.slice(1).join("");
                }
            } else {
                novoValor = value;
            }
        }
        setNovaConta((prev) => ({ ...prev, [name]: novoValor }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");

        const nomeJaExiste = conta.some(
            (c) =>
                c.nomeConta.toLowerCase().trim() === novaConta.nomeConta.toLowerCase().trim() &&
                c.id !== editarContaId
        );
        if (nomeJaExiste) {
            alert("Já existe uma conta com esse nome. Escolha outro nome.");
            return;
        }

        const valorParaAPI = novaConta.valor ? parseFloat(novaConta.valor).toFixed(2) : "0.00";
        let contaParaAPI = { ...novaConta, valor: valorParaAPI };

        contaParaAPI.categoria = novaConta.categoria;

        const method = editarContaId ? "PUT" : "POST";
        const url = editarContaId ? `${API_URL}/${editarContaId}` : API_URL;

        if (method === "POST") {
            contaParaAPI = { ...contaParaAPI, dataPostada: getHoje() };
        }

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(contaParaAPI),
            });

            if (res.status === 409) {
                const msg = await res.json();
                alert(msg.message || "Já existe uma conta com esse nome.");
                return;
            }

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Erro na resposta do servidor:", res.status, errorText);
                throw new Error("Erro ao salvar conta");
            }

            alert(`Conta ${editarContaId ? "editada" : "cadastrada"} com sucesso!`);
            setAbrirModal(false);
            setNovaConta(estadoInicialConta);
            setEditarContaId(null);
            fetchConta();
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar conta.");
        }
    };

    const handleNovaConta = () => {
        setNovaConta(estadoInicialConta);
        setEditarContaId(null);
        setAbrirModal(true);
    };

    const handleEditar = (conta) => {
        setEditarContaId(conta.id);
        setNovaConta({
            nomeConta: conta.nomeConta || "",
            categoria: conta.categoria || "", // ✅ ADICIONADO
            dataPostada: toInputDate(conta.dataPostada),
            dataVencimento: toInputDate(conta.dataVencimento),
            valor: getValorParaInput(conta.valor),
            status: conta.status === true || conta.status === "PENDENTE" || conta.status === "true",
            conta_pdf: conta.conta_pdf || "",
        });
        setAbrirModal(true);
    };

    const handleExcluir = (id) => {
        setExcluirContaId(id);
        setAbrirModalExcluir(true);
    };

    const confirmarExcluir = async () => {
    try {
        const token = localStorage.getItem("token"); 

        const res = await fetch(`${API_URL}/${excluirContaId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Erro ao excluir conta");
        alert("Conta excluída com sucesso!");
        setAbrirModalExcluir(false);
        setExcluirContaId(null);
        fetchConta();
    } catch (error) {
        console.error(error);
        alert("Erro ao excluir conta.");
    }
};

    // --- FILTRAGEM ---
    const contaFiltradas = conta.filter((c) => {
        const categoriaMatch = !filtroCategoria || c.categoria === filtroCategoria; // ✅ NOVO FILTRO
        const tipoMatch = !filtroTipo || c.nomeConta === filtroTipo;
        const statusMatch =
            !filtroStatus ||
            (filtroStatus === "pendente" && (c.status === true || c.status === "PENDENTE")) ||
            (filtroStatus === "pago" && (c.status === false || c.status === "PAGO"));
        return categoriaMatch && tipoMatch && statusMatch;
    });

    // --- PAGINAÇÃO ---
    const indexUltimo = paginaAtual * itensPorPagina;
    const indexPrimeiro = indexUltimo - itensPorPagina;
    const contaPagina = contaFiltradas.slice(indexPrimeiro, indexUltimo);
    const totalPaginas = Math.ceil(contaFiltradas.length / itensPorPagina);
    const mudarPagina = (numero) => {
        if (numero < 1) numero = 1;
        if (numero > totalPaginas) numero = totalPaginas;
        setPaginaAtual(numero);
    };

    useEffect(() => {
        setPaginaAtual(1);
    }, [filtroTipo, filtroStatus, filtroCategoria]); // ✅ Atualiza paginação com novo filtro

    return (
        <>
        <div className="w-full p-4 ">
            {/* FILTROS */}
            <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
                <div className="flex gap-4 flex-wrap">
                    {/* Categoria */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-600">Categoria</label>
                        <select
                            value={filtroCategoria}
                            onChange={(e) => {
                                setFiltroCategoria(e.target.value);
                                setFiltroTipo(""); // ✅ limpa o filtro tipo ao mudar categoria
                            }}
                            className="border rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        >
                            <option value="">Todas</option>
                            {categorias.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tipo */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-600">Tipo</label>
                        <select
                            value={filtroTipo}
                            onChange={(e) => setFiltroTipo(e.target.value)}
                            className="border rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        >
                            <option value="">Todos</option>
                            {
                                // ✅ mostra apenas nomeConta da categoria selecionada
                                [...new Set(
                                    conta
                                        .filter((c) =>
                                            filtroCategoria ? c.categoria === filtroCategoria : true
                                        )
                                        .map((c) => c.nomeConta)
                                )].map((nome) => (
                                    <option key={nome} value={nome}>
                                        {nome}
                                    </option>
                                ))
                            }
                        </select>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-600">Status</label>
                        <select
                            value={filtroStatus}
                            onChange={(e) => setFiltroStatus(e.target.value)}
                            className="border rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        >
                            <option value="">Todos</option>
                            <option value="pendente">Pendente</option>
                            <option value="pago">Pago</option>
                        </select>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleNovaConta}
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
                            {editarContaId ? "Editar Conta" : "Nova Conta"}
                        </h2>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                            {[
                                ["nomeConta", "Nome da Conta", "text"],
                                ["dataVencimento", "Data do Vencimento", "date"],
                                ["valor", "Valor", "text"],
                                ["conta_pdf", "PDF (Upload)", "file"],
                            ].map(([name, label, type]) => (
                                <div key={name}>
                                    <label htmlFor={name} className="block">{label}</label>
                                    <input
                                        id={name}
                                        type={type}
                                        name={name}
                                        onChange={handleChange}
                                        className="border rounded-md p-2 w-full"
                                        {...(type !== "file" ? { value: novaConta[name] } : {})}
                                        required
                                    />
                                </div>
                            ))}
                            {/* Categoria */}
                            <div>
                                <label className="block">Categoria</label>
                                <select
                                    name="categoria"
                                    value={novaConta.categoria}
                                    onChange={handleChange}
                                    className="border rounded-md p-2 w-full"
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    {categorias.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Status */}
                            <div className="flex flex-col gap-2 mt-2">
                                <label className="block font-medium text-gray-700">Status</label>
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="true"
                                            checked={novaConta.status === true}
                                            onChange={handleChange}
                                            className="w-4 h-4"
                                        />
                                        <span>Pendente</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="false"
                                            checked={novaConta.status === false}
                                            onChange={handleChange}
                                            className="w-4 h-4"
                                        />
                                        <span>Pago</span>
                                    </label>
                                </div>
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
                            onClick={() => {
                                setAbrirModal(false);
                                setEditarContaId(null);
                                setNovaConta(estadoInicialConta);
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
                        <p>Tem certeza que deseja excluir esta conta?</p>
                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                onClick={() => setAbrirModalExcluir(false)}
                                className="bg-gray-300 px-4 py-2 rounded-md"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarExcluir}
                                className="bg-red-600 text-white px-4 py-2 rounded-md"
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Tabela */}
            <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse table-auto">
                    <thead>
                        {/* ✅ Cabeçalho da tabela */}
                        <tr className="bg-[#245757] text-left text-white rounded-t-lg">
                            <th className="p-2">ID</th>
                            <th className="p-2">Categoria</th>
                            <th className="p-2">Nome da Conta</th>
                            <th className="p-2">Data da Postagem</th>
                            <th className="p-2">Data do Vencimento</th>
                            <th className="p-2">Valor</th>
                            <th className="p-2">Status</th>
                            <th className="p-2">PDF</th>
                            <th className="p-2 rounded-tr-lg">Ações</th>
                        </tr>
                    </thead>

                    <tbody>
                        {contaPagina.map((u) => (
                            <tr key={u.id} className="border-t hover:bg-gray-50">
                                <td className="p-2">{u.id}</td>
                                <td className="p-2">{u.categoria || "—"}</td>
                                <td className="p-2">{u.nomeConta}</td>
                                <td className="p-2">{formatarData(u.dataPostada)}</td>
                                <td className="p-2">{formatarData(u.dataVencimento)}</td>
                                <td className="p-2">{formatarValor(u.valor)}</td>

                                <td className="p-2">
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${u.status === true || u.status === "PENDENTE"
                                            ? "bg-[#245757]/20 text-[#245757]"
                                            : "bg-gray-300 text-gray-700"
                                            }`}
                                    >
                                        {u.status === true || u.status === "PENDENTE"
                                            ? "Pendente"
                                            : "Pago"}
                                    </span>
                                </td>

                                {/* PDF */}
                                <td className="p-2">
                                    {u.conta_pdf && typeof u.conta_pdf === "string" && u.conta_pdf.length > 0 ? (
                                        console.log(conta),

                                        <a
                                            href={`http://localhost:8080/pdfs/${u.id}`}
                                            target="_blank"

                                        >
                                            Visualizar PDF
                                        </a>

                                    ) : (
                                        <span className="text-gray-500 text-sm">Nenhum PDF</span>
                                    )}
                                </td>

                                {/* Ações */}
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
                    </tbody>
                </table>
                {/* Paginação */}
                {totalPaginas > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-4 select-none">
                        <button
                            onClick={() => mudarPagina(paginaAtual - 1)}
                            disabled={paginaAtual === 1}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            &lt; Anterior
                        </button>
                        {[...Array(totalPaginas)].map((_, i) => {
                            const numeroPagina = i + 1;
                            return (
                                <button
                                    key={numeroPagina}
                                    onClick={() => mudarPagina(numeroPagina)}
                                    className={`px-3 py-1 border rounded ${paginaAtual === numeroPagina ? "bg-blue-300" : ""
                                        }`}
                                >
                                    {numeroPagina}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => mudarPagina(paginaAtual + 1)}
                            disabled={paginaAtual === totalPaginas}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Próxima &gt;
                        </button>
                    </div>
                )}
            </div>
            </div>
        </>
    );
}