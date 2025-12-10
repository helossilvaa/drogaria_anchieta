"use client";
import { useState, useEffect } from "react";

export default function Contas() {
    const estadoInicialConta = {
        nomeConta: "",
        categoria: "",
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

    const [filtroCategoria, setFiltroCategoria] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("");

    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 15;

    const API_URL = "http://localhost:8080/api/conta";

    const getHoje = () => {
        const data = new Date();
        return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(
            data.getDate()
        ).padStart(2, "0")}`;
    };

    const toInputDate = (dataString) => {
        if (!dataString) return "";
        try {
            if (dataString.match(/^\d{4}-\d{2}-\d{2}$/)) return dataString;
            const data = new Date(dataString);
            if (isNaN(data.getTime())) return "";
            return `${data.getUTCFullYear()}-${String(data.getUTCMonth() + 1).padStart(
                2,
                "0"
            )}-${String(data.getUTCDate()).padStart(2, "0")}`;
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
            return data
                .toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
                .replace(/\./g, "")
                .replace(/\//g, " ");
        } catch {
            return dataString;
        }
    };

    const formatarValor = (valorString) => {
        const valorLimpo =
            valorString?.toString().replace(/[^\d.,]/g, "").replace(",", ".") || "0";
        const valorNumerico = parseFloat(valorLimpo);
        if (isNaN(valorNumerico)) return valorString;
        return valorNumerico.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
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
        fetchConta();
    }, []);

    const fetchConta = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(API_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setConta(data);
        } catch (erro) {
            console.error("Erro ao carregar contas:", erro);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === "file" && files.length > 0) {
            const reader = new FileReader();
            reader.onloadend = () =>
                setNovaConta((prev) => ({ ...prev, conta_pdf: reader.result.split(",")[1] }));
            reader.readAsDataURL(files[0]);
            return;
        }

        let novoValor =
            type === "checkbox"
                ? checked
                : name === "status"
                ? value === "true"
                : name === "valor"
                ? value.replace(/,/g, ".").replace(/[^\d.]/g, "")
                : value;

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

        if (nomeJaExiste) return alert("Essa conta já existe!");

        const valorParaAPI = novaConta.valor
            ? parseFloat(novaConta.valor).toFixed(2)
            : "0.00";

        let contaParaAPI = {
            ...novaConta,
            valor: valorParaAPI,
            categoria: novaConta.categoria
        };

        const method = editarContaId ? "PUT" : "POST";
        const url = editarContaId ? `${API_URL}/${editarContaId}` : API_URL;

        if (method === "POST") contaParaAPI.dataPostada = getHoje();

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(contaParaAPI)
            });

            if (!res.ok) throw new Error();

            alert(`Conta ${editarContaId ? "editada" : "cadastrada"} com sucesso!`);
            setAbrirModal(false);
            setNovaConta(estadoInicialConta);
            setEditarContaId(null);
            fetchConta();
        } catch (erro) {
            console.error(erro);
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
            categoria: conta.categoria || "",
            dataPostada: toInputDate(conta.dataPostada),
            dataVencimento: toInputDate(conta.dataVencimento),
            valor: getValorParaInput(conta.valor),
            status:
                conta.status === true ||
                conta.status === "PENDENTE" ||
                conta.status === "true",
            conta_pdf: conta.conta_pdf || ""
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
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error();

            alert("Conta excluída!");
            setAbrirModalExcluir(false);
            fetchConta();
        } catch {
            alert("Erro ao excluir.");
        }
    };

    const contaFiltradas = conta.filter((c) => {
        const categoriaMatch = !filtroCategoria || c.categoria === filtroCategoria;
        const tipoMatch = !filtroTipo || c.nomeConta === filtroTipo;
        const statusMatch =
            !filtroStatus ||
            (filtroStatus === "pendente" &&
                (c.status === true || c.status === "PENDENTE")) ||
            (filtroStatus === "pago" &&
                (c.status === false || c.status === "PAGO"));
        return categoriaMatch && tipoMatch && statusMatch;
    });

    const indexUltimo = paginaAtual * itensPorPagina;
    const indexPrimeiro = indexUltimo - itensPorPagina;
    const contaPagina = contaFiltradas.slice(indexPrimeiro, indexUltimo);
    const totalPaginas = Math.ceil(contaFiltradas.length / itensPorPagina);

    const mudarPagina = (num) => {
        if (num < 1) num = 1;
        if (num > totalPaginas) num = totalPaginas;
        setPaginaAtual(num);
    };

    useEffect(() => {
        setPaginaAtual(1);
    }, [filtroCategoria, filtroTipo, filtroStatus]);

    return (
        <>
            <div className="w-full p-4">
                {/* FILTROS */}
                <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
                    <div className="flex gap-4 flex-wrap">
                        {/* Categoria */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-600">
                                Categoria
                            </label>
                            <select
                                value={filtroCategoria}
                                onChange={(e) => {
                                    setFiltroCategoria(e.target.value);
                                    setFiltroTipo("");
                                }}
                                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#44A6A0]"
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
                            <label className="text-sm font-medium text-gray-600">
                                Tipo
                            </label>
                            <select
                                value={filtroTipo}
                                onChange={(e) => setFiltroTipo(e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#44A6A0]"
                            >
                                <option value="">Todos</option>
                                {[...new Set(
                                    conta
                                        .filter((c) =>
                                            filtroCategoria
                                                ? c.categoria === filtroCategoria
                                                : true
                                        )
                                        .map((c) => c.nomeConta)
                                )].map((nome) => (
                                    <option key={nome} value={nome}>
                                        {nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-600">
                                Status
                            </label>
                            <select
                                value={filtroStatus}
                                onChange={(e) => setFiltroStatus(e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#44A6A0]"
                            >
                                <option value="">Todos</option>
                                <option value="pendente">Pendente</option>
                                <option value="pago">Pago</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleNovaConta}
                        className="cursor-pointer border p-2 rounded-md bg-[#44A6A0] text-white hover:bg-teal-600"
                    >
                        Nova Conta
                    </button>
                </div>

                {/* MODAL CADASTRO / EDIÇÃO */}
                {abrirModal && (
                    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl mb-3 font-bold">
                                {editarContaId ? "Editar Conta" : "Nova Conta"}
                            </h2>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                                {[["nomeConta", "Nome da Conta", "text"],
                                ["dataVencimento", "Data do Vencimento", "date"],
                                ["valor", "Valor", "text"],
                                ["conta_pdf", "PDF (Upload)", "file"]].map(
                                    ([name, label, type]) => (
                                        <div key={name}>
                                            <label className="block">{label}</label>
                                            <input
                                                type={type}
                                                name={name}
                                                onChange={handleChange}
                                                className="border rounded-md p-2 w-full focus:ring-2 focus:ring-[#44A6A0]"
                                                {...(type !== "file"
                                                    ? { value: novaConta[name] }
                                                    : {})}
                                                required
                                            />
                                        </div>
                                    )
                                )}

                                {/* Categoria */}
                                <div>
                                    <label className="block">Categoria</label>
                                    <select
                                        name="categoria"
                                        value={novaConta.categoria}
                                        onChange={handleChange}
                                        className="border rounded-md p-2 w-full focus:ring-2 focus:ring-[#44A6A0]"
                                        required
                                    >
                                        <option value="">Selecione...</option>
                                        {categorias.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status */}
                                <div className="flex flex-col gap-2 mt-2">
                                    <label className="block font-medium text-gray-700">
                                        Status
                                    </label>

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
                                        className="bg-[#44A6A0] text-white rounded-md p-2 hover:bg-teal-500"
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
                            >
                                &times;
                            </button>
                        </div>
                    </div>
                )}

                {/* MODAL EXCLUIR */}
                {abrirModalExcluir && (
                    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
                            <h2 className="text-xl mb-4 font-bold">Confirmar Exclusão</h2>
                            <p>Tem certeza que deseja excluir esta conta?</p>

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
                <div className="mt-4 overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-[#44A6A0] text-white">
                                <th className="p-2">ID</th>
                                <th className="p-2">Categoria</th>
                                <th className="p-2">Nome da Conta</th>
                                <th className="p-2">Data Postada</th>
                                <th className="p-2">Data Vencimento</th>
                                <th className="p-2">Valor</th>
                                <th className="p-2">Status</th>
                                <th className="p-2">PDF</th>
                                <th className="p-2">Ações</th>
                            </tr>
                        </thead>

                        <tbody>
                            {contaPagina.map((u) => (
                                <tr key={u.id} className="border-b hover:bg-teal-50">
                                    <td className="p-2">{u.id}</td>
                                    <td className="p-2">{u.categoria || "—"}</td>
                                    <td className="p-2">{u.nomeConta}</td>
                                    <td className="p-2">{formatarData(u.dataPostada)}</td>
                                    <td className="p-2">{formatarData(u.dataVencimento)}</td>
                                    <td className="p-2">{formatarValor(u.valor)}</td>

                                    <td className="p-2">
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                u.status === true || u.status === "PENDENTE"
                                                    ? "bg-teal-100 text-teal-700"
                                                    : "bg-gray-300 text-gray-700"
                                            }`}
                                        >
                                            {u.status === true ||
                                            u.status === "PENDENTE"
                                                ? "Pendente"
                                                : "Pago"}
                                        </span>
                                    </td>

                                    <td className="p-2">
                                        {u.conta_pdf ? (
                                            <a
                                                href={`http://localhost:8080/pdfs/${u.id}`}
                                                target="_blank"
                                                className="text-[#44A6A0] underline"
                                            >
                                                Visualizar PDF
                                            </a>
                                        ) : (
                                            <span className="text-gray-500 text-sm">
                                                Nenhum PDF
                                            </span>
                                        )}
                                    </td>

                                    <td className="p-2 flex gap-2 justify-center">
                                        <button
                                            onClick={() => handleEditar(u)}
                                            className="text-gray-700 hover:text-[#44A6A0]"
                                        >
                                            <svg
                                                className="w-6 h-6"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                viewBox="0 0 24 24"
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
                                        >
                                            <svg
                                                className="w-6 h-6"
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

                    {/* PAGINAÇÃO */}
                    {totalPaginas > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-4">
                            <button
                                onClick={() => mudarPagina(paginaAtual - 1)}
                                disabled={paginaAtual === 1}
                                className="px-3 py-1 bg-[#44A6A0] text-white rounded hover:bg-teal-500 disabled:opacity-40"
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
                                disabled={paginaAtual === totalPaginas}
                                className="px-3 py-1 bg-[#44A6A0] text-white rounded hover:bg-teal-500 disabled:opacity-40"
                            >
                                Próxima
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
