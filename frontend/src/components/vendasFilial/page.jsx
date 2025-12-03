"use client";
import { useState, useEffect } from "react";

export default function Vendas() {
  const [vendas, setVendas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [descontos, setDescontos] = useState([]);

  const [filtroValor, setFiltroValor] = useState(10000); // filtro único de valor
  const [filtroData, setFiltroData] = useState("");

  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 15;

  const API_URL = "http://localhost:8080/vendas";

  const formatarValor = (valor) =>
    valor !== null && valor !== undefined
      ? Number(valor).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })
      : "—";

  const getNomeCliente = (id) => {
    const c = clientes.find((i) => i.id === id);
    return c ? c.nome : "—";
  };

  const getNomeUsuario = (idUsuario) => {
    const u = usuarios.find((i) => i.id === idUsuario);
    if (!u) return "—";

    const f = funcionarios.find((func) => func.id === u.funcionario_id);
    return f ? f.nome : "—";
  };

  const getNomeUnidade = (id) => {
    const un = unidades.find((i) => i.id === id);
    return un ? un.nome : "—";
  };

  const getPagamento = (id) => {
    const p = pagamentos.find((i) => i.id === id);
    return p ? p.tipo : "—";
  };

  const getDescontoValor = (id) => {
    const d = descontos.find((i) => i.id === id);
    return d ? d.desconto : 0;
  };

  const fetchVendas = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setVendas(Array.isArray(data) ? data : []);
    } catch {
      setVendas([]);
    }
  };

  const carregarListas = async () => {
    try {
      const token = localStorage.getItem("token");
      const urls = [
        { key: "clientes", url: "http://localhost:8080/api/filiados" },
        { key: "usuarios", url: "http://localhost:8080/usuarios" },
        { key: "funcionarios", url: "http://localhost:8080/funcionarios" },
        { key: "unidades", url: "http://localhost:8080/unidade" },
        { key: "pagamentos", url: "http://localhost:8080/pagamento" },
        { key: "descontos", url: "http://localhost:8080/api/descontos" },
      ];

      const fetches = urls.map(async ({ key, url }) => {
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        return { key, data };
      });

      const resultados = await Promise.all(fetches);

      resultados.forEach(({ key, data }) => {
        if (key === "clientes") setClientes(data);
        if (key === "usuarios") setUsuarios(data);
        if (key === "funcionarios") setFuncionarios(data);
        if (key === "unidades") setUnidades(data);
        if (key === "pagamentos") setPagamentos(data);
        if (key === "descontos") setDescontos(data);
      });
    } catch {
      setClientes([]);
      setUsuarios([]);
      setFuncionarios([]);
      setUnidades([]);
      setPagamentos([]);
      setDescontos([]);
    }
  };

  const vendasFiltradas = vendas.filter((v) => {
    const desconto = getDescontoValor(v.desconto_id) || 0;
    const subtotal = v.total + desconto;

    const passaValor = subtotal <= filtroValor; // filtro único
    const passaData = !filtroData || (v.data && v.data.startsWith(filtroData));

    return passaValor && passaData;
  });

  const indexUltimo = paginaAtual * itensPorPagina;
  const indexPrimeiro = indexUltimo - itensPorPagina;
  const vendasPagina = vendasFiltradas.slice(indexPrimeiro, indexUltimo);
  const totalPaginas = Math.ceil(vendasFiltradas.length / itensPorPagina);

  useEffect(() => setPaginaAtual(1), [filtroValor, filtroData]);

  useEffect(() => {
    fetchVendas();
    carregarListas();
  }, []);

  const mudarPagina = (num) => {
    if (num < 1 || num > totalPaginas) return;
    setPaginaAtual(num);
  };

  return (
    <>
      <div className="flex items-end gap-4 mt-4 flex-wrap">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">
            Valor máximo: {formatarValor(filtroValor)}
          </label>
          <input
            type="range"
            min="0"
            max="2000"
            step="10"
            value={filtroValor}
            onChange={(e) => setFiltroValor(Number(e.target.value))}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">Data</label>
          <input
            type="date"
            className="border rounded-lg px-4 py-2 text-sm"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-[#245757] text-white">
              <th className="p-2">Cliente</th>
              <th className="p-2">Usuário</th>
              <th className="p-2">Unidade</th>
              <th className="p-2">Subtotal</th>
              <th className="p-2">Desconto</th>
              <th className="p-2">Total Final</th>
              <th className="p-2">Pagamento</th>
              <th className="p-2">Data</th>
            </tr>
          </thead>

          <tbody>
            {vendasPagina.map((v) => {
              const desconto = getDescontoValor(v.desconto_id) || 0;
              const subtotal = v.total + desconto;

              return (
                <tr key={v.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{getNomeCliente(v.cliente_id)}</td>
                  <td className="p-2">{getNomeUsuario(v.usuario_id)}</td>
                  <td className="p-2">{getNomeUnidade(v.unidade_id)}</td>
                  <td className="p-2">{formatarValor(subtotal)}</td>
                  <td className="p-2">{formatarValor(desconto)}</td>
                  <td className="p-2">{formatarValor(v.total)}</td>
                  <td className="p-2">{getPagamento(v.tipo_pagamento_id)}</td>
                  <td className="p-2">
                    {v.data ? new Date(v.data).toLocaleDateString("pt-BR") : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {totalPaginas > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              onClick={() => mudarPagina(paginaAtual - 1)}
              disabled={paginaAtual === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              &lt; Anterior
            </button>

            {[...Array(totalPaginas)].map((_, i) => (
              <button
                key={i}
                onClick={() => mudarPagina(i + 1)}
                className={`px-3 py-1 border rounded ${
                  paginaAtual === i + 1 ? "bg-blue-300" : ""
                }`}
              >
                {i + 1}
              </button>
            ))}

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
    </>
  );
}
