"use client";
import React, { useState, useMemo, useCallback } from "react";
import { ChevronDown, Search, MoreVertical } from "lucide-react";

export default function TableBase({ columns, data, defaultSortColumn }) {

  const [filterValue, setFilterValue] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: defaultSortColumn,
    direction: "ascending",
  });

  // Filtrar
  const filteredData = useMemo(() => {
    if (!filterValue) return data;
    return data.filter((item) =>
      columns.some((col) => {
        const val = item[col.uid];
        return val && val.toString().toLowerCase().includes(filterValue.toLowerCase());
      })
    );
  }, [filterValue, data, columns]);

  // Ordenar
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [filteredData, sortDescriptor]);

  // Paginação
  const pages = Math.ceil(sortedData.length / rowsPerPage);
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedData.slice(start, end);
  }, [page, rowsPerPage, sortedData]);

  const onSortChange = useCallback(
    (columnKey) => {
      setSortDescriptor((prev) => {
        if (prev.column === columnKey) {
          return {
            column: columnKey,
            direction: prev.direction === "ascending" ? "descending" : "ascending",
          };
        }
        return { column: columnKey, direction: "ascending" };
      });
    },
    []
  );

  return (
    <div className="p-4 bg-gray-50">
      {/* Top Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-64">
          <div className="flex items-center h-10 px-3 rounded-lg border border-gray-300 focus-within:border-green-900 transition-colors bg-white shadow-sm">
            <Search size={16} className="text-gray-400" />
            <input
              placeholder="Search..."
              value={filterValue}
              onChange={(e) => { setFilterValue(e.target.value); setPage(1); }}
              className="w-full ml-2 bg-transparent focus:outline-none placeholder-gray-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
            className="border rounded-lg px-2 py-1 text-sm"
          >
            {[5, 10, 15].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.uid}
                  onClick={col.sortable ? () => onSortChange(col.uid) : undefined}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.sortable ? 'cursor-pointer hover:text-gray-700' : ''}`}
                >
                  <div className="flex items-center gap-1">
                    {col.name}
                    {col.sortable && col.uid === sortDescriptor.column && (
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${sortDescriptor.direction === 'ascending' ? 'rotate-180' : 'rotate-0'}`}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.length > 0 ? (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col.uid} className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                      {col.render ? col.render(item) : item[col.uid]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-10 text-gray-500">
                  No items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
        <span>Pagina {page} de {pages}</span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Próximo
          </button>
        </div>
      </div>
    </div>
  );
}
