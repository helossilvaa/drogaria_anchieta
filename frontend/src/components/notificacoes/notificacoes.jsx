"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import * as Icons from "lucide-react";
import { CardNotificacao } from "../CardNotificacao/CardNotificacao.jsx";
import { Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// ---- FORMATAR DATA PARA AGRUPAMENTO ----
function formatarTituloData(dt) {
  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);

  const dtLimpa = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  const hojeLimpa = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const ontemLimpa = new Date(ontem.getFullYear(), ontem.getMonth(), ontem.getDate());

  if (dtLimpa.getTime() === hojeLimpa.getTime()) return "Hoje";
  if (dtLimpa.getTime() === ontemLimpa.getTime()) return "Ontem";

  const meses = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ];

  return `${dt.getDate()} de ${meses[dt.getMonth()]} de ${dt.getFullYear()}`;
}

// ---- AGRUPAR POR DATA REAL ----
function agruparPorDataReal(notificacoes) {
  const grupos = {};

  notificacoes.forEach((n) => {
    const dataCriacao = new Date(n.criada_em);
    const titulo = formatarTituloData(dataCriacao);

    if (!grupos[titulo]) grupos[titulo] = [];
    grupos[titulo].push(n);
  });

  // Ordenar datas: Hoje, Ontem, e depois datas reais mais recentes primeiro
  const ordenarDatas = (a, b) => {
    const ordemEspecial = { "Hoje": 1, "Ontem": 2 };

    if (ordemEspecial[a] && ordemEspecial[b]) return ordemEspecial[a] - ordemEspecial[b];
    if (ordemEspecial[a]) return -1;
    if (ordemEspecial[b]) return 1;

    const [diaA, mesA, anoA] = a.split(" de ");
    const [diaB, mesB, anoB] = b.split(" de ");

    const meses = {
      janeiro: 0, fevereiro: 1, março: 2, abril: 3, maio: 4, junho: 5,
      julho: 6, agosto: 7, setembro: 8, outubro: 9, novembro: 10, dezembro: 11
    };

    const dataA = new Date(anoA, meses[mesA], diaA);
    const dataB = new Date(anoB, meses[mesB], diaB);

    return dataB - dataA; // mais recente primeiro
  };

  const ordenado = Object.keys(grupos).sort(ordenarDatas);

  const resultado = {};
  ordenado.forEach((key) => {
    resultado[key] = grupos[key];
  });

  return resultado;
}

export function PopoverNotificacoes() {
  const [notificacoes, setNotificacoes] = useState([]);

  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    if (notificacoes.length > 0) setHasNew(true);
  }, [notificacoes]);

  const [visibleCount, setVisibleCount] = useState(10);

  const handleVerMais = () => {
    setVisibleCount((prev) => prev + 10);
  };

  function renderNotification(n) {
    const Icon = Icons[n.tipo_icone] || Icons.AlertTriangle;

    return (
      <CardNotificacao
        key={n.id}
        icon={<Icon className="w-6 h-6" />}
        titulo={n.titulo}
        mensagem={n.mensagem}
        extraInfo={n.extra_info}
        acaoTexto={n.acao_texto}
        cor={n.cor || "pink"}
        criada_em={n.criada_em}
      />
    );
  }

  // AGRUPAMENTO REAL
  const grupos = agruparPorDataReal(notificacoes);

  const [activeTab, setActiveTab] = useState("Inbox");
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const tabsRef = useRef({});
  const tabs = ["Inbox"];

  useEffect(() => {
    const el = tabsRef.current[activeTab];
    if (el) {
      setIndicatorStyle({
        width: el.offsetWidth + "px",
        left: el.offsetLeft + "px",
      });
    }
  }, [activeTab]);

  return (
    <Popover
      onOpenChange={(open) => {
        if (open) setHasNew(false);
      }}
    >
      <PopoverTrigger className="relative">
        <div className="w-9 h-9 shadow-sm flex items-center justify-center rounded-full hover:bg-gray-200 relative">
          <Bell className="w-5 h-5 text-gray-700" />

          {hasNew && (
            <span className="absolute top-[0] right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-0">
        <div className="flex flex-col">

          <div className="p-4 pb-0 relative">
            <h1 className="text-2xl font-bold mb-2">Notificações</h1>

            <div className="relative flex items-center gap-4 border-b border-gray-300 pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  ref={(el) => (tabsRef.current[tab] = el)}
                  onClick={() => setActiveTab(tab)}
                  className={`font-medium transition-colors ${
                    activeTab === tab
                      ? "text-pink-500"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}

              <span
                className="absolute bottom-0 h-[2px] bg-pink-500 transition-all duration-300"
                style={indicatorStyle}
              ></span>
            </div>
          </div>

          <div className="px-4 py-2 space-y-4">

            {Object.entries(grupos).map(([titulo, items]) => {
              if (items.length === 0) return null;

              return (
                <div key={titulo}>
                  <p className="px-1 py-1 bg-gray-50 text-gray-400 font-medium text-sm">
                    {titulo}
                  </p>

                  {items.slice(0, visibleCount).map(renderNotification)}
                </div>
              );
            })}

            {visibleCount < notificacoes.length && (
              <div className="flex justify-center mt-3">
                <button
                  onClick={handleVerMais}
                  className="px-4 py-1 bg-[#0F4F4F] text-white rounded-full text-sm shadow-sm hover:opacity-90"
                >
                  Ver mais
                </button>
              </div>
            )}

          </div>

        </div>
      </PopoverContent>
    </Popover>
  );
}