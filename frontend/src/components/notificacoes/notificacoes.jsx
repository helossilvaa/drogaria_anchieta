"use client";

import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover";
import * as Icons from "lucide-react";
import { CardNotificacao } from "../CardNotificacao/CardNotificacao.jsx";
import { Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";

function formatarTempo(dataISO) {
  const agora = new Date();
  const data = new Date(dataISO);
  const diff = (agora - data) / 1000;

  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h atrás`;

  return `${Math.floor(diff / 86400)} d atrás`;
}

export function PopoverNotificacoes() {

  const [notificacoes, setNotificacoes] = useState([]);

  // --- FUNÇÃO PARA RENDERIZAR UM CARD ---
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
    <Popover>
      <PopoverTrigger className="relative">
        <div className="w-9 h-9 shadow-sm flex items-center justify-center rounded-full hover:bg-gray-200 relative">
          <Bell className="w-5 h-5 text-gray-700" />

          <span className="absolute top-[0] right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-0">
        <div className="flex flex-col">

          {/* --- TÍTULO --- */}
          <div className="p-4 pb-0 relative">
            <h1 className="text-2xl font-bold mb-2">Notificações</h1>

            {/* --- ABAS --- */}
            <div className="relative flex items-center gap-4 border-b border-gray-300 pb-2">
              {tabs.map((tab) => (
                <div key={tab} className="flex items-center gap-4">
                  <button
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
                </div>
              ))}

              <span
                className="absolute bottom-0 h-[2px] bg-pink-500 transition-all duration-300"
                style={indicatorStyle}
              ></span>
            </div>
          </div>

          {/* --- SEÇÃO HOJE --- */}
          <p className="px-4 py-2 bg-gray-50 text-gray-400">HOJE</p>

          {/* --- LISTA DE NOTIFICAÇÕES --- */}
          <div className="px-4 py-2">
            {notificacoes.map(renderNotification)}
          </div>

        </div>
      </PopoverContent>
    </Popover>
  );
}