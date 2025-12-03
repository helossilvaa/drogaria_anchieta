const cores = {
  pink: "bg-pink-500 hover:bg-pink-600",
  blue: "bg-blue-500 hover:bg-blue-600",
  green: "bg-green-500 hover:bg-green-600",
  yellow: "bg-yellow-500 hover:bg-yellow-600",
  red: "bg-red-500 hover:bg-red-600",
};

function formatarTempo(dataISO) {
  const agora = new Date();
  const data = new Date(dataISO);
  const diff = (agora - data) / 1000;

  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h atrás`;

  return `${Math.floor(diff / 86400)} d atrás`;
}

export function CardNotificacao({
  icon,
  titulo,
  mensagem,
  acaoTexto,
  acaoOnClick,
  extraInfo,
  cor = "pink",
  criada_em
}) {
  const tempo = formatarTempo(criada_em);

  return (
    <div className="flex gap-3 py-4 border-b">
      {/* Ícone */}
      <div className="text-gray-700">{icon}</div>

      <div className="flex-1">

        {/* Título */}
        <span className="font-semibold">{titulo}</span>

        {/* Mensagem */}
        <p className="text-gray-600 text-sm leading-tight">{mensagem}</p>

        {/* Extra Info */}
        {extraInfo && (
          <div className="bg-gray-100 px-2 py-1 rounded mt-2 text-xs text-gray-600">
            {extraInfo}
          </div>
        )}

        {/* Botão de Ação */}
        {acaoTexto && (
          <button
            onClick={acaoOnClick}
            className={`mt-3 text-white px-3 py-1 rounded text-sm ${cores[cor]}`}
          >
            {acaoTexto}
          </button>
        )}
      </div>

      {/* Tempo */}
      <div className="text-xs text-gray-400 whitespace-nowrap">{tempo}</div>
    </div>
  );
}