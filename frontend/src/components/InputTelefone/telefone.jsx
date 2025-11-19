"use client";

import React, { useEffect, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import Image from "next/image";
import { PatternFormat } from "react-number-format";

export default function InputTelefoneComPais({ value, onChange }) {
  const [paises, setPaises] = useState([]);
  const [paisSelecionado, setPaisSelecionado] = useState(null);

 
  const fallbackFlags = {
    "Afeganistão": "https://flagcdn.com/w320/af.png",
  "Honduras": "https://flagcdn.com/w320/hn.png",
  "Ascensão": "https://pt.wikipedia.org/wiki/Ficheiro:Flag_of_Ascension_Island.svg",
  "Reino Unido": "https://flagcdn.com/w320/gb.png",
  "Síria": "https://flagcdn.com/w320/sy.png",
  "Vaticano": "https://flagcdn.com/w320/va.png",
  "São Tomé e Príncipe": "https://flagcdn.com/w320/st.png"
  };

 
  const corrigirImagem = (pais) => {
    
    if (fallbackFlags[pais.pais]) {
      return fallbackFlags[pais.pais];
    }

    // Corrige URLs com "https:////"
    if (pais.img?.includes("https:////")) {
      return pais.img.replace("https:////", "https://");
    }

    // Se estiver tudo ok, retorna normal
    return pais.img;
  };

  useEffect(() => {
    fetch("https://api-paises.pages.dev/paises.json")
      .then((res) => res.json())
      .then((data) => {
        const arrayPaises = Object.values(data);
        const ordenados = arrayPaises.sort((a, b) =>
          a.pais.localeCompare(b.pais)
        );
        setPaises(ordenados);
      })
      .catch((err) => console.error("Erro ao buscar países:", err));
  }, []);

  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium">Telefone</label>
      <div className="flex gap-2">
        {/* SELECT DE PAÍS */}
        <Select
          value={paisSelecionado?.ddi}
          onValueChange={(ddi) => {
            const pais = paises.find((p) => p.ddi === ddi);
            setPaisSelecionado(pais);
          }}
        >
          <SelectTrigger className="w-[90px]">
            <SelectValue placeholder="País">
              {paisSelecionado ? (
                <div className="flex items-center gap-2">
                  <Image
                    src={corrigirImagem(paisSelecionado)}
                    alt={paisSelecionado.pais}
                    width={20}
                    height={14}
                    className="rounded-sm"
                  />
                  + {paisSelecionado.ddi}
                </div>
              ) : (
                "País"
              )}
            </SelectValue>
          </SelectTrigger>

          <SelectContent className="max-h-64">
            <SelectGroup>
              {paises.map((pais) => (
                <SelectItem key={`${pais.ddi}-${pais.pais}`} value={pais.ddi}>
                  <div className="flex items-center gap-2">
                    <Image
                      src={corrigirImagem(pais)}
                      alt={pais.pais}
                      width={20}
                      height={14}
                      className="rounded-sm"
                    />
                    {pais.nome} (+{pais.ddi})
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* INPUT COM MÁSCARA */}
        <PatternFormat
          customInput={Input}
          format="(##) ####-####"
          mask="_"
          value={value}
          onValueChange={(values) => onChange(values.value)}
          placeholder="(00) 0000-0000"
          className="flex-1"
        />
      </div>
    </div>
  );
}
