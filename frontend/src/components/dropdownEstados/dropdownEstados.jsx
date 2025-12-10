import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem
} from "../ui/dropdown-menu";

export default function DropdownEstados({ value, onChange }) {
  const [estados, setEstados] = useState([]);

  useEffect(() => {
    //puxando via API os estados do Brasil
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
      .then((response) => response.json())
      .then((data) => {
        const ordenados = data.sort((a, b) =>
          a.nome.localeCompare(b.nome)
        );
        setEstados(ordenados);
      })
      .catch((error) => console.error("Erro ao buscar estados:", error));
  }, []);

  const estadoSelecionado = estados.find(
    (e) => e.sigla?.toLowerCase() === (value ? value.toLowerCase() : "")
  );

  return (
    <DropdownMenu>
      {/* dropdown com os estados */}
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="w-full text-left border border-input bg-background rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          {estadoSelecionado
            ? `${estadoSelecionado.nome} (${estadoSelecionado.sigla})`
            : "Escolha um estado"}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full max-h-64 overflow-y-auto">
        {estados.map((estado) => (
          <DropdownMenuItem
            key={estado.id}
            onClick={() => onChange?.(estado.sigla)}
          >
            {estado.nome} ({estado.sigla})
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
