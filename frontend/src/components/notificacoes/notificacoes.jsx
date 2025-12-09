"use client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import * as Icons from "lucide-react";
import { CardNotificacao } from "../CardNotificacao/CardNotificacao.jsx";
import { Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const ICON_MAP = {
  1: Icons.Plus,
  2: Icons.Truck,
  3: Icons.TriangleAlert,
  4: Icons.DollarSign,
  5: Icons.Trash,
  6: Icons.Pencil
};

// ---- Formatar data para agrupamento ----
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
    "janeiro","fevereiro","março","abril","maio","junho",
    "julho","agosto","setembro","outubro","novembro","dezembro",
  ];
  return `${dt.getDate()} de ${meses[dt.getMonth()]} de ${dt.getFullYear()}`;
}

// ---- Agrupar por data ----
function agruparPorDataReal(notificacoes) {
  const grupos = {};
  notificacoes.forEach(n => {
    const dataCriacao = new Date(n.criada_em);
    const titulo = formatarTituloData(dataCriacao);
    if (!grupos[titulo]) grupos[titulo] = [];
    grupos[titulo].push(n);
  });
  return grupos;
}

// ---- Função para pegar ícone seguro ----
function getIconByName(iconName) {
  if (!iconName) return Icons.AlertTriangle; // fallback
  // Normaliza para PascalCase (Plus, Truck, etc)
  const pascalCaseName = iconName
    .toLowerCase()
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => letter.toUpperCase())
    .replace(/[-_ ]+/g, '');
  return Icons[pascalCaseName] || Icons.AlertTriangle;
}

export function PopoverNotificacoes() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [hasNew, setHasNew] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [usuarioId, setUsuarioId] = useState(null);

  const API_URL = "http://localhost:8080";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("usuario");
    if (!stored) return;
    const usuarioObj = JSON.parse(stored);
    if (usuarioObj?.id) setUsuarioId(usuarioObj.id);
  }, []);

  useEffect(() => {
    if (!usuarioId) return;

    const fetchNotificacoes = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/notificacoes/usuario/${usuarioId}`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`${res.status} - ${res.statusText}`);
        const data = await res.json();
        setNotificacoes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao carregar notificações:", error);
      }
    };

    fetchNotificacoes();
  }, [usuarioId]);

  useEffect(() => {
    setHasNew(notificacoes.some(n => !n.lida));
  }, [notificacoes]);

  const handleVerMais = () => setVisibleCount(prev => prev + 10);

  function getIconByTipoId(tipoId) {
  return ICON_MAP[tipoId] || Icons.AlertTriangle;
}

function renderNotification(n) {
  const Icon = getIconByTipoId(n.tipo_id);
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

      // 👉 Aqui adicionamos a ação ao clicar no botão da notificação
      acaoOnClick={() => {
        // salva o ID da solicitação no localStorage para a página de estoque usar
        localStorage.setItem("solicitacao_estoque_id", n.id);

        // redireciona para a página de estoque da matriz
        window.location.href = "/estoque";
      }}
    />
  );
}


  const grupos = agruparPorDataReal(notificacoes);

  const [activeTab, setActiveTab] = useState("Inbox");
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const tabsRef = useRef({});
  const tabs = ["Inbox"];

  useEffect(() => {
    const el = tabsRef.current[activeTab];
    if (el) {
      setIndicatorStyle({ width: el.offsetWidth + "px", left: el.offsetLeft + "px" });
    }
  }, [activeTab]);

  return (
    <Popover
      onOpenChange={async (open) => {
        if (open) {
          setHasNew(false);
          const token = localStorage.getItem("token");
          await fetch(`${API_URL}/notificacoes/usuario/${usuarioId}/lidas`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          });
          setNotificacoes(prev => prev.map(n => ({ ...n, lida: 1 })));
        }
      }}
    >
      <PopoverTrigger className="relative">
        <div className="w-9 h-9 shadow-sm flex items-center justify-center rounded-full hover:bg-gray-200 relative">
          <Bell className="w-5 h-5 text-gray-700" />
          {hasNew && <span className="absolute top-0 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="w-[95vw] sm:w-80 md:w-96 p-0 rounded-lg max-h-[80vh] h-[80vh] flex flex-col"
      >
        <div className="p-3 sm:p-4 pb-0 flex-shrink-0">
          <h1 className="text-xl sm:text-2xl font-bold mb-2">Notificações</h1>
          <div className="relative flex items-center gap-4 border-b border-gray-300 pb-2 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab}
                ref={el => (tabsRef.current[tab] = el)}
                onClick={() => setActiveTab(tab)}
                className={`font-medium transition-colors whitespace-nowrap ${activeTab === tab ? "text-pink-500" : "text-gray-500 hover:text-gray-700"}`}
              >
                {tab}
              </button>
            ))}
            <span className="absolute bottom-0 h-[2px] bg-pink-500 transition-all duration-300" style={indicatorStyle} />
          </div>
        </div>

        <div className="px-3 sm:px-4 py-2 space-y-4 overflow-y-auto flex-grow" style={{ WebkitOverflowScrolling: "touch" }}>
          {Object.entries(grupos).map(([titulo, items]) => (
            <div key={titulo}>
              <p className="px-1 py-1 bg-gray-50 text-gray-400 font-medium text-sm">{titulo}</p>
              {items.slice(0, visibleCount).map(renderNotification)}
            </div>
          ))}

          <div className="flex justify-center mt-3">
            <button
              onClick={handleVerMais}
              disabled={visibleCount >= notificacoes.length}
              className={`w-full sm:w-auto px-4 py-1 rounded-full text-sm shadow-sm text-white bg-[#f6339a] transition-all ${visibleCount >= notificacoes.length ? "opacity-40 cursor-not-allowed" : "hover:opacity-90"}`}
            >
              Ver mais
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}