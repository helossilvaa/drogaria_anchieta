import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "../ui/dropdown-menu";

export default function DropdownCidades({ estadoSigla, value, onChange }) {
  const [distritos, setDistritos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!estadoSigla) return;

    setLoading(true);
    fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoSigla}/distritos`
    )
      .then((response) => response.json())
      .then((data) => {
        const ordenados = data.sort((a, b) =>
          a.nome.localeCompare(b.nome)
        );
        setDistritos(ordenados);
      })
      .catch((error) => console.error("Erro ao buscar distritos:", error))
      .finally(() => setLoading(false));
  }, [estadoSigla]);

  const cidadeSelecionada = distritos.find(
    (d) => d.nome.toLowerCase() === (value ? value.toLowerCase() : "")
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={!estadoSigla || loading}
          className="w-full text-left border border-input bg-background rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
        >
          {!estadoSigla
            ? "Escolha primeiro o estado"
            : loading
            ? "Carregando..."
            : cidadeSelecionada
            ? cidadeSelecionada.nome
            : "Escolha uma cidade"}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-full max-h-64 overflow-y-auto">
        {distritos.map((distrito) => (
          <DropdownMenuItem
            key={distrito.id}
            onClick={() => onChange?.(distrito.nome)}
          >
            {distrito.nome}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
