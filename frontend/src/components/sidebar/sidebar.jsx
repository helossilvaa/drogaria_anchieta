"use client";

import React, { useEffect, useState } from "react";
import {
  ChartNoAxesCombined,
  Box,
  CircleDollarSign,
  PackageOpen,
  Users,
  Handshake,
  PackageSearch,
  ShoppingBag,
  Building2,
  FileChartPie,
  BadgeDollarSign,
  Menu,
  X,
  UserStar,
  Truck
} from "lucide-react"; // Importa ícones da biblioteca lucide-react
import Link from "next/link"; // Importa componente de navegação do Next.js
import { motion, AnimatePresence } from "framer-motion"; // Importa animações
import { ComboboxDemo } from "../combobox/combobox"; // Importa componente de busca
import { useAuthUser } from "@/hooks/useAuthUser"; // Hook customizado para pegar usuário autenticado

export default function Sidebar() {
  const usuario = useAuthUser(); // Pega dados do usuário logado
  const [menuItems, setMenuItems] = useState([]); // Lista de itens do menu
  const [isOpen, setIsOpen] = useState(false); // Estado para abrir/fechar menu mobile

  useEffect(() => {
    if (!usuario) return; // Se não houver usuário, não faz nada

    const departamento = usuario?.departamento?.toLowerCase(); // Pega departamento em minúsculo

    // Menu para "Diretor Geral"
    if (departamento === "diretor geral") {
      setMenuItems([
        { label: "Dashboard", icon: <ChartNoAxesCombined />, href: "/matriz" },
        { label: "Filiais", icon: <Building2 />, href: "/matriz/franquias" },
        { label: "Relatórios", icon: <FileChartPie />, href: "/matriz/relatorios" },
        { label: "Funcionários", icon: <Users />, href: "/matriz/funcionarios" },
        { label: "Financeiro", icon: <BadgeDollarSign />, href: "/matriz/financeiro" },
        { label: "Estoque", icon: <PackageOpen />, href: "/matriz/estoque" },
        { label: "Produtos", icon: <PackageSearch />, href: "/matriz/produtos" },
        { label: "Filiados", icon: <UserStar />, href: "/matriz/filiados" },
        { label: "Parcerias e Descontos", icon: <Handshake />, href: "/matriz/parceriasdescontos" },
        { label: "Fornecedores", icon: <Truck />, href: "/matriz/fornecedores" },
      ]);
    } 
    // Menu para "Diretor Administrativo"
    else if (departamento === "diretor administrativo") {
      setMenuItems([
        { label: "Dashboard", icon: <ChartNoAxesCombined />, href: "/filial" },
        { label: "Produtos", icon: <Box />, href: "/filial/produtos" },
        { label: "Financeiro", icon: <CircleDollarSign />, href: "/filial/financeiro" },
        { label: "Estoque", icon: <PackageOpen />, href: "/filial/estoque" },
        { label: "Funcionários", icon: <Users />, href: "/filial/funcionarios" },
        { label: "Filiados", icon: <UserStar />, href: "/filial/filiados" },
      ]);
    } 
    // Menu para "Caixa" ou "Gerente"
    else if (departamento === "caixa" || departamento === "gerente") {
      setMenuItems([
        { label: "Dashboard", icon: <ChartNoAxesCombined />, href: "/pdv" },
        { label: "Nova venda", icon: <ShoppingBag />, href: "/pdv/novaVenda" },
        { label: "Produtos", icon: <PackageSearch />, href: "/pdv/produtos" },
        { label: "Programa de fidelidade", icon: <Handshake />, href: "/pdv/filiados" },
      ]);
    }
  }, [usuario]); // Executa quando o usuário muda

  if (!usuario || menuItems.length === 0) return null; // Não renderiza nada se usuário ou menu vazio

  return (
    <>
      {/* Botão do menu mobile */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-teal-700 p-2 rounded text-white shadow-md"
        onClick={() => setIsOpen(true)}
      >
        <Menu size={24} /> {/* Ícone do menu */}
      </button>

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-60 h-screen p-4 bg-white">
        <Link href="/matriz">
          <div className="flex items-center gap-1 mb-10 mt-2">
            <img src="/icon.png" width={50} height={50} alt="" />
            <div className="flex flex-col justify-center">
              <p className="italic leading-[0.3] text-teal-800 text-xs">Drogaria</p>
              <h5 className="font-bold text-3xl text-teal-800">NCHIETA</h5>
            </div>
          </div>
        </Link>

        {/* Lista de links do menu */}
        <nav className="flex flex-col gap-2 w-full">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex gap-3 p-2 rounded transition group relative duration-300 w-full justify-start hover:bg-teal-50"
            >
              <div className="w-6 flex justify-center text-teal-700">
                {item.icon} {/* Ícone do item */}
              </div>
              <p className="text-left text-gray-800">{item.label}</p>
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-teal-300 to-red-300 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>
      </aside>

      {/* Sidebar mobile animada */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Fundo semi-transparente */}
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            {/* Painel lateral */}
            <motion.aside
              className="fixed z-50 bg-white w-65 h-full p-4 flex flex-col lg:hidden rounded"
              initial={{ x: -250 }}
              animate={{ x: 0 }}
              exit={{ x: -250 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}>
              <div className="flex items-center justify-between mb-10">
                <Link href="/matriz" onClick={() => setIsOpen(false)}>
                  <div className="flex items-center gap-1">
                    <img src="/icon.png" width={50} height={50} alt="" />
                    <div className="flex flex-col justify-center">
                      <p className="italic leading-[0.3] text-teal-800 text-xs">Drogaria</p>
                      <h5 className="font-bold text-3xl text-teal-800">NCHIETA</h5>
                    </div>
                  </div>
                </Link>

                {/* Botão fechar */}
                <button className="text-gray-700" onClick={() => setIsOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              {/* Lista de links do menu */}
              <nav className="flex flex-col gap-2 w-full h-full">
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex gap-3 p-2 rounded transition group relative duration-300 w-full justify-start hover:bg-teal-50"
                  >
                    <div className="w-6 flex justify-center text-teal-700">
                      {item.icon}
                    </div>
                    <p className="text-left text-gray-800">{item.label}</p>
                    <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-teal-300 to-red-300 transition-all duration-300 group-hover:w-full" />
                  </Link>
                ))}

                {/* Combobox de busca na parte inferior */}
                <div className="mt-auto pt-6 pb-4">
                  <ComboboxDemo usuario={usuario} />
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
