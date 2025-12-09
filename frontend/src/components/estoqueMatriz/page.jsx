// "use client";
// import { useState, useEffect } from "react";

// export default function RequisicoesEstoque() {
//   const estadoInicial = {
//     estoque_matriz_id: "",
//     produto_id: "",
//     quantidade_requisitada: "",
//     valor_unitario: "",
//     valor_total: "",
//     data_requisicao: "",
//     fornecedor_id: "",
//     status: "pendente",
//   };

//   const [abrirModal, setAbrirModal] = useState(false);
//   const [requisicoes, setRequisicoes] = useState([]);
//   const [novoItem, setNovoItem] = useState(estadoInicial);
//   const [editarId, setEditarId] = useState(null);
//   const [abrirModalExcluir, setAbrirModalExcluir] = useState(false);
//   const [excluirId, setExcluirId] = useState(null);
//   const [pesquisa, setPesquisa] = useState("");

//   const [estoques, setEstoques] = useState([]);
//   const [produtos, setProdutos] = useState([]);
//   const [fornecedores, setFornecedores] = useState([]);

//   const [paginaAtual, setPaginaAtual] = useState(1);
//   const itensPorPagina = 15;

//   const API_URL = "http://localhost:8080/api/requisicoes";

//   const formatarValor = (valorString) => {
//     const valorNumerico = parseFloat(valorString) || 0;
//     return valorNumerico.toLocaleString("pt-BR", {
//       style: "currency",
//       currency: "BRL",
//       minimumFractionDigits: 2,
//     });
//   };

//   const toInputDate = (dataString) => {
//     if (!dataString) return "";
//     const data = new Date(dataString);
//     if (isNaN(data.getTime())) return "";
//     const ano = data.getFullYear();
//     const mes = String(data.getMonth() + 1).padStart(2, "0");
//     const dia = String(data.getDate()).padStart(2, "0");
//     return `${ano}-${mes}-${dia}`;
//   };

//   const fetchListas = async () => {
//     try {
//       const token = localStorage.getItem("token");

//       const resEstoques = await fetch("http://localhost:8080/estoque_matriz", { headers: { Authorization: `Bearer ${token}` } });
//       const resProdutos = await fetch("http://localhost:8080/produtos", { headers: { Authorization: `Bearer ${token}` } });
//       const resFornecedores = await fetch("http://localhost:8080/fornecedores", { headers: { Authorization: `Bearer ${token}` } });

//       setEstoques(await resEstoques.json());
//       setProdutos(await resProdutos.json());
//       setFornecedores(await resFornecedores.json());
//     } catch (err) {
//       console.error("Erro ao carregar listas:", err);
//     }
//   };

//   const fetchRequisicoes = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch(API_URL, { headers: { Authorization: `Bearer ${token}` } });
//       setRequisicoes(await res.json());
//     } catch (err) {
//       console.error("Erro ao carregar requisições:", err);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setNovoItem((prev) => ({ ...prev, [name]: value }));

//     // Atualizar valor_total automaticamente
//     if (name === "quantidade_requisitada" || name === "valor_unitario") {
//       const quantidade = parseFloat(name === "quantidade_requisitada" ? value : prev.quantidade_requisitada) || 0;
//       const unitario = parseFloat(name === "valor_unitario" ? value : prev.valor_unitario) || 0;
//       setNovoItem((prev) => ({ ...prev, valor_total: (quantidade * unitario).toFixed(2) }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!novoItem.estoque_matriz_id || !novoItem.produto_id || !novoItem.quantidade_requisitada) {
//       alert("Preencha os campos obrigatórios.");
//       return;
//     }

//     try {
//       const token = localStorage.getItem("token");
//       const method = editarId ? "PUT" : "POST";
//       const url = editarId ? `${API_URL}/${editarId}` : API_URL;

//       const res = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//         body: JSON.stringify(novoItem),
//       });

//       if (!res.ok) throw new Error("Erro ao salvar requisição");

//       alert(`Requisição ${editarId ? "editada" : "cadastrada"} com sucesso!`);
//       setAbrirModal(false);
//       setNovoItem(estadoInicial);
//       setEditarId(null);
//       fetchRequisicoes();
//     } catch (err) {
//       console.error(err);
//       alert("Erro ao salvar requisição");
//     }
//   };

//   const handleEditar = (item) => {
//     setEditarId(item.id);
//     setNovoItem({
//       estoque_matriz_id: item.estoque_matriz_id,
//       produto_id: item.produto_id,
//       quantidade_requisitada: item.quantidade_requisitada,
//       valor_unitario: item.valor_unitario,
//       valor_total: item.valor_total,
//       data_requisicao: toInputDate(item.data_requisicao),
//       fornecedor_id: item.fornecedor_id,
//       status: item.status,
//     });
//     setAbrirModal(true);
//   };

//   const handleExcluir = (id) => {
//     setExcluirId(id);
//     setAbrirModalExcluir(true);
//   };

//   const confirmarExcluir = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch(`${API_URL}/${excluirId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
//       if (!res.ok) throw new Error("Erro ao excluir requisição");
//       alert("Requisição excluída com sucesso!");
//       setAbrirModalExcluir(false);
//       setExcluirId(null);
//       fetchRequisicoes();
//     } catch (err) {
//       console.error(err);
//       alert("Erro ao excluir requisição");
//     }
//   };

//   const requisicoesFiltradas = requisicoes.filter((r) => {
//     if (!pesquisa) return true;
//     const termo = pesquisa.toLowerCase();
//     const produtoNome = produtos.find((p) => p.id === r.produto_id)?.nome || "";
//     return produtoNome.toLowerCase().includes(termo);
//   });

//   const indexUltimo = paginaAtual * itensPorPagina;
//   const indexPrimeiro = indexUltimo - itensPorPagina;
//   const requisicoesPagina = requisicoesFiltradas.slice(indexPrimeiro, indexUltimo);
//   const totalPaginas = Math.max(1, Math.ceil(requisicoesFiltradas.length / itensPorPagina));

//   useEffect(() => {
//     fetchListas();
//     fetchRequisicoes();
//   }, []);

//   return (
//     <>
//       {/* FILTROS E NOVA REQUISIÇÃO */}
//       <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
//         <input
//           type="text"
//           placeholder="Pesquisar por produto"
//           value={pesquisa}
//           onChange={(e) => setPesquisa(e.target.value)}
//           className="border rounded-lg px-4 py-2 text-sm"
//         />
//         <button onClick={() => { setNovoItem(estadoInicial); setEditarId(null); setAbrirModal(true); }} className="bg-blue-500 text-white p-2 rounded-md">Nova Requisição</button>
//       </div>

//       {/* MODAL ADICIONAR/EDITAR */}
//       {abrirModal && (
//         <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
//             <h2 className="text-xl mb-3 font-bold">{editarId ? "Editar Requisição" : "Nova Requisição"}</h2>
//             <form onSubmit={handleSubmit} className="flex flex-col gap-3">
//               {/* Estoque */}
//               <label>Estoque Matriz</label>
//               <select name="estoque_matriz_id" value={novoItem.estoque_matriz_id} onChange={handleChange} required className="border p-2 rounded">
//                 <option value="">Selecione</option>
//                 {estoques.map((e) => (<option key={e.id} value={e.id}>{e.nome}</option>))}
//               </select>

//               {/* Produto */}
//               <label>Produto</label>
//               <select name="produto_id" value={novoItem.produto_id} onChange={handleChange} required className="border p-2 rounded">
//                 <option value="">Selecione</option>
//                 {produtos.map((p) => (<option key={p.id} value={p.id}>{p.nome}</option>))}
//               </select>

//               {/* Quantidade */}
//               <label>Quantidade</label>
//               <input type="number" name="quantidade_requisitada" value={novoItem.quantidade_requisitada} onChange={handleChange} className="border p-2 rounded" required />

//               {/* Valor Unitário */}
//               <label>Valor Unitário</label>
//               <input type="text" name="valor_unitario" value={novoItem.valor_unitario} onChange={handleChange} className="border p-2 rounded" required />

//               {/* Valor Total */}
//               <label>Valor Total</label>
//               <input type="text" name="valor_total" value={novoItem.valor_total} readOnly className="border p-2 rounded bg-gray-100" />

//               {/* Data */}
//               <label>Data da Requisição</label>
//               <input type="date" name="data_requisicao" value={novoItem.data_requisicao} onChange={handleChange} className="border p-2 rounded" required />

//               {/* Fornecedor */}
//               <label>Fornecedor</label>
//               <select name="fornecedor_id" value={novoItem.fornecedor_id} onChange={handleChange} required className="border p-2 rounded">
//                 <option value="">Selecione</option>
//                 {fornecedores.map((f) => (<option key={f.id} value={f.id}>{f.nome}</option>))}
//               </select>

//               {/* Status */}
//               <label>Status</label>
//               <select name="status" value={novoItem.status} onChange={handleChange} className="border p-2 rounded">
//                 <option value="pendente">Pendente</option>
//                 <option value="aprovado">Aprovado</option>
//                 <option value="cancelado">Cancelado</option>
//               </select>

//               <button type="submit" className="bg-green-600 text-white rounded-md p-2 mt-3">{editarId ? "Editar" : "Salvar"}</button>
//             </form>
//             <button onClick={() => setAbrirModal(false)} className="absolute top-2 right-3 text-xl text-gray-500 hover:text-red-500">&times;</button>
//           </div>
//         </div>
//       )}

//       {/* MODAL EXCLUSÃO */}
//       {abrirModalExcluir && (
//         <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
//             <h2 className="text-xl mb-4 font-bold">Confirmar Exclusão</h2>
//             <p>Deseja realmente excluir esta requisição?</p>
//             <div className="flex justify-end gap-4 mt-6">
//               <button onClick={() => setAbrirModalExcluir(false)} className="bg-gray-300 px-4 py-2 rounded-md">Cancelar</button>
//               <button onClick={confirmarExcluir} className="bg-red-600 text-white px-4 py-2 rounded-md">Excluir</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* TABELA */}
//       <div className="mt-6 overflow-x-auto">
//         <table className="w-full table-auto border-collapse">
//           <thead>
//             <tr className="bg-[#245757] text-white">
//               <th className="p-2">Estoque</th>
//               <th className="p-2">Produto</th>
//               <th className="p-2">Quantidade</th>
//               <th className="p-2">Valor Unitário</th>
//               <th className="p-2">Valor Total</th>
//               <th className="p-2">Fornecedor</th>
//               <th className="p-2">Data</th>
//               <th className="p-2">Status</th>
//               <th className="p-2">Ações</th>
//             </tr>
//           </thead>
//           <tbody>
//             {requisicoesPagina.map((r) => {
//               const estoqueNome = estoques.find((e) => e.id === r.estoque_matriz_id)?.nome || "";
//               const produtoNome = produtos.find((p) => p.id === r.produto_id)?.nome || "";
//               const fornecedorNome = fornecedores.find((f) => f.id === r.fornecedor_id)?.nome || "";

//               return (
//                 <tr key={r.id} className="hover:bg-gray-100">
//                   <td className="p-2">{estoqueNome}</td>
//                   <td className="p-2">{produtoNome}</td>
//                   <td className="p-2">{r.quantidade_requisitada}</td>
//                   <td className="p-2">{formatarValor(r.valor_unitario)}</td>
//                   <td className="p-2">{formatarValor(r.valor_total)}</td>
//                   <td className="p-2">{fornecedorNome}</td>
//                   <td className="p-2">{r.data_requisicao ? new Date(r.data_requisicao).toLocaleDateString("pt-BR") : ""}</td>
//                   <td className="p-2">{r.status}</td>
//                   <td className="p-2 flex gap-2 justify-center">
//                     <button onClick={() => handleEditar(r)} className="text-gray-700 hover:text-[#245757]">Editar</button>
//                     <button onClick={() => handleExcluir(r.id)} className="text-red-600 hover:text-red-800">Excluir</button>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>

//         {/* Paginação */}
//         {totalPaginas > 1 && (
//           <div className="flex justify-center gap-2 mt-4">
//             <button onClick={() => setPaginaAtual(paginaAtual - 1)} disabled={paginaAtual === 1} className="border px-3 py-1 rounded disabled:opacity-50">&lt; Anterior</button>
//             {[...Array(totalPaginas)].map((_, i) => (
//               <button key={i} onClick={() => setPaginaAtual(i + 1)} className={`border px-3 py-1 rounded ${paginaAtual === i + 1 ? "bg-blue-300" : ""}`}>{i + 1}</button>
//             ))}
//             <button onClick={() => setPaginaAtual(paginaAtual + 1)} disabled={paginaAtual === totalPaginas} className="border px-3 py-1 rounded disabled:opacity-50">Próxima &gt;</button>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }
