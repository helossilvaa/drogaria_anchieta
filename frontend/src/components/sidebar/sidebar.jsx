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
  BadgeDollarSign
} from "lucide-react";
import Link from "next/link";

export default function Sidebar({ usuario }) {
    const [menuItems, setMenuItems] = useState([]);
  
    useEffect(() => {
      if (!usuario) return;
  
      const { departamento } = usuario;
  
      if (departamento === "Diretor Geral") {
        setMenuItems([
          { label: "Dashboard", icon: <ChartNoAxesCombined />, href: "/" },
          { label: "Filiais", icon: <Building2 />, href: "/filiais" },
          { label: "Relatórios", icon: <FileChartPie />, href: "/relatorios" },
          { label: "Funcionários", icon: <Users />, href: "/funcionarios" },
          { label: "Financeiro", icon: <BadgeDollarSign />, href: "/financeiro" },
          { label: "Estoque", icon: <PackageOpen />, href: "/estoque" },
          { label: "Produtos", icon: <PackageSearch />, href: "/produtos" },
        ]);
      } else if (departamento === "Diretor Administrativo") {
        setMenuItems([
          { label: "Dashboard", icon: <ChartNoAxesCombined />, href: "/" },
          { label: "Produtos", icon: <Box />, href: "/produtos" },
          { label: "Financeiro", icon: <CircleDollarSign />, href: "/financeiro" },
          { label: "Estoque", icon: <PackageOpen />, href: "/estoque" },
          { label: "Funcionários", icon: <Users />, href: "/funcionarios" },
        ]);
      } else {
        setMenuItems([
          { label: "Dashboard", icon: <ChartNoAxesCombined />, href: "/" },
          { label: "Nova venda", icon: <ShoppingBag />, href: "/venda" },
          { label: "Produtos", icon: <PackageSearch />, href: "/produtos" },
          { label: "Programa de fidelidade", icon: <Handshake />, href: "/fidelidade" },
        ]);
      }
    }, [usuario]);
  
    if (!usuario || menuItems.length === 0) return null;
  
    return (
      <aside className="w-55 h-screen p-2 flex flex-col">
        <Link href="/matriz">
          <div className="logo flex items-center gap-1 mb-10 mt-2">
            <img src="/icon.png" width={50} height={50} alt="" />
            <div className="flex flex-col justify-center">
              <p className="italic leading-[0.3] text-teal-800 text-xs">Drogaria</p>
              <h5 className="font-bold text-3xl text-teal-800">NCHIETA</h5>
            </div>
          </div>
        </Link>
  
        <nav className="flex flex-col gap-2 w-full">
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex gap-3 p-2 rounded transition group relative duration-300 w-40 justify-start"
            >
              <div className="w-6 flex justify-center">{item.icon}</div>
              <p className="text-left">{item.label}</p>
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-teal-300 to-red-300 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>
      </aside>
    );
  }

