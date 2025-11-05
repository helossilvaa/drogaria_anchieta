"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { Search, ChevronDown, Plus, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import DialogFranquia from '@/components/addFranquia/adicionarFranquia'


const users = [
    { id: 1, name: "Tony Reichert", role: "CEO", team: "Management", status: "active", age: "29", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026702d", email: "tony.r@example.com" },
    { id: 2, name: "Zoey Lang", role: "Technical Lead", team: "Development", status: "paused", age: "25", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026702e", email: "zoey.l@example.com" },
    { id: 3, name: "Jane Fisher", role: "Sr. Dev", team: "Development", status: "active", age: "22", avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d", email: "jane.f@example.com" },
    { id: 4, name: "William Howard", role: "Design Lead", team: "Design", status: "vacation", age: "28", avatar: "https://i.pravatar.cc/150?u=a048581f4e29026701d", email: "william.h@example.com" },
    { id: 5, name: "Kris Fisher", role: "Jr. Dev", team: "Development", status: "active", age: "24", avatar: "https://i.pravatar.cc/150?u=a092581d4e29026702d", email: "kris.f@example.com" },
    { id: 6, name: "Bao Lu", role: "Product Manager", team: "Product", status: "active", age: "30", avatar: "https://i.pravatar.cc/150?u=a02358114e29026702d", email: "bao.l@example.com" },
    { id: 7, name: "Elena Gilbert", role: "HR Manager", team: "HR", status: "paused", age: "35", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026702a", email: "elena.g@example.com" },
    { id: 8, name: "Damon Salvatore", role: "Marketing Specialist", team: "Marketing", status: "active", age: "32", avatar: "https://i.pravatar.cc/150?u=a052581f4e29026702b", email: "damon.s@example.com" },
    { id: 9, name: "Caroline Forbes", role: "Sales Rep", team: "Sales", status: "active", age: "26", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026702c", email: "caroline.f@example.com" },
    { id: 10, name: "Stefan Salvatore", role: "Intern", team: "Development", status: "vacation", age: "20", avatar: "https://i.pravatar.cc/150?u=a062581f4e29026702d", email: "stefan.s@example.com" },
];

const COLUMNS = [
    { name: "NOME", uid: "nome", sortable: true },
    { name: "CNPJ", uid: "cnpj", sortable: true },
    { name: "TELEFONE", uid: "telefone", sortable: true },
    { name: "STATUS", uid: "status", sortable: true },
    { name: "E-MAIL", uid: "email", sortable: true },
    { name: "CONTATO", uid: "contato", sortable: true },
    { name: "AÇÕES", uid: "acoes" },
];

const STATUS_OPTIONS = [
    { name: "ativa", uid: "ativa" },
    { name: "inativa", uid: "inativa" }
];

// --- Status Badge Utility ---
const StatusBadge = ({ status }) => {
    let colorClass = '';
    let dotClass = '';
    switch (status) {
        case 'ativa':
            colorClass = 'text-green-700 bg-green-100 border-green-300';
            dotClass = 'bg-green-500';
            break;
        case 'inativa':
            colorClass = 'text-yellow-700 bg-yellow-100 border-yellow-300';
            dotClass = 'bg-yellow-500';
            break;
        default:
            colorClass = 'text-gray-700 bg-gray-100 border-gray-300';
            dotClass = 'bg-gray-500';
    }

    return (
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
            <span className={`w-2 h-2 rounded-full ${dotClass}`}></span>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
    );
};

const renderCell = (user, columnKey) => {
    const cellValue = user[columnKey];

    switch (columnKey) {
        case "name":
            return (
                <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-9 h-9 object-cover rounded-full shadow-md" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/150x150/000000/FFFFFF?text=AV"; }} />
                    <div className="flex flex-col">
                        <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                </div>
            );
        case "role":
            return (
                <div className="flex flex-col">
                    <p className="text-sm font-medium capitalize text-gray-800">{cellValue}</p>
                    <p className="text-xs capitalize text-gray-500">{user.team}</p>
                </div>
            );
        case "status":
            return <StatusBadge status={cellValue} />;
        case "actions":
            return (
                <div className="relative flex justify-end items-center gap-2">
                    {/* Placeholder for the Actions dropdown/menu */}
                    <button className="text-gray-400 hover:text-gray-600 transition p-2 rounded-full hover:bg-gray-100">
                        <MoreVertical size={16} />
                    </button>
                </div>
            );
        default:
            return <span className="text-sm text-gray-700">{cellValue}</span>;
    }
};


export default function App() {
    const [filterValue, setFilterValue] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [page, setPage] = useState(1);
    const [sortDescriptor, setSortDescriptor] = useState({ column: "name", direction: "ascending" });
    const [visibleColumns, setVisibleColumns] = useState(COLUMNS.map(c => c.uid)); // All visible by default

   
    const hasSearchFilter = Boolean(filterValue);

    const filteredItems = useMemo(() => {
        let filteredUsers = [...users];


        if (hasSearchFilter) {
            filteredUsers = filteredUsers.filter((user) =>
                user.name.toLowerCase().includes(filterValue.toLowerCase()) ||
                user.role.toLowerCase().includes(filterValue.toLowerCase()) ||
                user.email.toLowerCase().includes(filterValue.toLowerCase()),
            );
        }

      
        if (statusFilter !== "todos") {
            filteredUsers = filteredUsers.filter((user) => user.status === statusFilter);
        }

        return filteredUsers;
    }, [users, filterValue, statusFilter]);

    // Sorting
    const sortedItems = useMemo(() => {
        return [...filteredItems].sort((a, b) => {
            const first = a[sortDescriptor.column];
            const second = b[sortDescriptor.column];
            const cmp = first < second ? -1 : first > second ? 1 : 0;

            if (sortDescriptor.direction === "descending") {
                return -cmp;
            }

            return cmp;
        });
    }, [sortDescriptor, filteredItems]);

   
    const pages = Math.ceil(filteredItems.length / rowsPerPage);

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return sortedItems.slice(start, end);
    }, [page, sortedItems, rowsPerPage]);


    // --- Handlers ---
    const onSearchChange = useCallback((e) => {
        setFilterValue(e.target.value);
        setPage(1); // Reset to first page on search
    }, []);

    const onRowsPerPageChange = useCallback((e) => {
        setRowsPerPage(Number(e.target.value));
        setPage(1);
    }, []);

    const onSortChange = useCallback((columnKey) => {
        setSortDescriptor(prev => {
            if (prev.column === columnKey) {
                return {
                    column: columnKey,
                    direction: prev.direction === 'ascending' ? 'descending' : 'ascending',
                };
            }
            return { column: columnKey, direction: 'ascending' };
        });
    }, []);

    const onStatusFilterChange = useCallback((e) => {
        setStatusFilter(e.target.value);
        setPage(1);
    }, []);

    const TopContent = useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                
                <div className="flex justify-between gap-3 items-end">
                    {/* Search Input */}
                    <div className="w-full sm:max-w-md relative">
                        <div className="flex items-center h-10 px-3 rounded-lg border border-gray-300 focus-within:border-blue-500 transition-colors bg-white shadow-sm">
                            <Search size={16} className="text-gray-400" />
                            <input
                                placeholder="Search by name..."
                                value={filterValue}
                                onChange={onSearchChange}
                                className="w-full text-sm ml-2 bg-transparent focus:outline-none placeholder-gray-500"
                            />
                            {filterValue && (
                                <button onClick={() => onSearchChange({ target: { value: '' } })} className="text-gray-400 hover:text-gray-600 ml-2">
                                    <svg aria-hidden="true" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em"><path d="M12 2a10 10 0 1010 10A10.016 10.016 0 0012 2zm3.36 12.3a.754.754 0 010 1.06.748.748 0 01-1.06 0l-2.3-2.3-2.3 2.3a.748.748 0 01-1.06 0 .754.754 0 010-1.06l2.3-2.3-2.3-2.3A.75.75 0 019.7 8.64l2.3 2.3 2.3-2.3a.75.75 0 011.06 1.06l-2.3 2.3z" fill="currentColor"></path></svg>
                                </button>
                            )}
                        </div>
                    </div>
                    {/* Filters and Add New Button */}
                    <div className="flex gap-3">
                        {/* Status Filter */}
                        <div className="relative hidden sm:block">
                            <select
                                className="appearance-none block w-full bg-white border border-gray-300 text-gray-700 py-1.5 px-3 pr-8 rounded-lg leading-tight focus:outline-none focus:border-blue-500 text-sm h-10 cursor-pointer transition-colors"
                                value={statusFilter}
                                onChange={onStatusFilterChange}
                            >
                                <option value="all">Todas</option>
                                {STATUS_OPTIONS.map((status) => (
                                    <option key={status.uid} value={status.uid}>{status.name}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <ChevronDown size={16} />
                            </div>
                        </div>

                        {/* Column Visibility / Placeholder (Simplified) */}
                        <button className="hidden sm:flex items-center h-10 px-4 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 transition-colors">
                            Columns
                            <ChevronDown size={16} className="ml-2" />
                        </button>
                            <DialogFranquia/>
                        
                    </div>
                </div>

               
                <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">Total {filteredItems.length} users</span>
                    <label className="flex items-center text-gray-500 text-sm">
                        Rows per page:
                        <select
                            className="bg-transparent outline-none text-gray-500 text-sm ml-1 cursor-pointer"
                            onChange={onRowsPerPageChange}
                            value={rowsPerPage}
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                        </select>
                    </label>
                </div>
            </div>
        );
    }, [filterValue, onSearchChange, statusFilter, onStatusFilterChange, rowsPerPage, onRowsPerPageChange, filteredItems.length]);

    const BottomContent = useMemo(() => {
        return (
            <div className="flex justify-between items-center p-4">
                <div className="text-sm text-gray-500">
                    Page {page} of {pages}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setPage(p => Math.min(pages, p + 1))}
                        disabled={page === pages}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>
        );
    }, [page, pages]);


    return (
        <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                {TopContent}

                {/* Table Section */}
                <div className="overflow-x-auto mt-6 rounded-xl border border-gray-200 shadow-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {/* Checkbox Column */}
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                                    <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" />
                                </th>
                                {/* Data Columns */}
                                {COLUMNS.filter(c => visibleColumns.includes(c.uid)).map((column) => (
                                    <th
                                        key={column.uid}
                                        onClick={column.sortable ? () => onSortChange(column.uid) : undefined}
                                        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${column.sortable ? 'hover:text-gray-700 transition-colors' : ''}`}
                                    >
                                        <div className="flex items-center">
                                            {column.name}
                                            {column.sortable && column.uid === sortDescriptor.column && (
                                                <ChevronDown size={14} className={`ml-1 transition-transform ${sortDescriptor.direction === 'ascending' ? 'rotate-180' : 'rotate-0'}`} />
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {items.length > 0 ? (
                                items.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        {/* Checkbox Cell */}
                                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 w-12">
                                            <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" />
                                        </td>
                                        {/* Data Cells */}
                                        {COLUMNS.filter(c => visibleColumns.includes(c.uid)).map((column) => (
                                            <td key={column.uid} className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {renderCell(item, column.uid)}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={COLUMNS.length + 1} className="text-center py-10 text-gray-500 text-lg">
                                        No users found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {BottomContent}
            </div>
        </div>
    );
}
