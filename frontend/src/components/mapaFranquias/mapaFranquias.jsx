"use client";
import React, { useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography
} from "react-simple-maps";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import brTopoJson from "../../data/br-topo.json"

const geographyStyle = {
  default: { outline: "none", cursor: "pointer" },
  hover: { outline: "none", cursor: "pointer", fill: "#a0aec0" },
  pressed: { outline: "none", cursor: "pointer", fill: "#718096" },
};

export default function MapaBrasil() {
  const [unidades, setUnidades] = useState([]);
  const [estadoSelecionado, setEstadoSelecionado] = useState(null);

  const API_URL = "http://localhost:8080";

  useEffect(() => {
    const fetchUnidades = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/unidade`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erro ao carregar unidades");
        const data = await res.json();
        setUnidades(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUnidades();
  }, []);

  // Agrupar unidades por estado (garantindo maiúsculas e sem espaços)
  const unidadesPorEstado = unidades.reduce((acc, u) => {
    const uf = u.estado?.trim().toUpperCase();
    if (!acc[uf]) acc[uf] = [];
    acc[uf].push(u);
    return acc;
  }, {});

  const corEstado = (estado) => {
    const count = unidadesPorEstado[estado]?.length || 0;
    if (count === 0) return "#cececeff"; // cinza
    if (count === 1) return "#f873c5ff"; // azul claro
    if (count <= 3) return "#179282ff"; // azul médio
    return "#e20000ff"; // azul escuro
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Franquias pelo Brasil</CardTitle>
            <CardDescription>Clique no estado e veja as franquias</CardDescription>
        </CardHeader>
        <CardContent>
    <div style={{ position: "relative", display:"flex", gap: 5}}>
        
       {estadoSelecionado && (
  <div style={{ marginTop: 12 }}>
    <strong>Unidades em {estadoSelecionado}:</strong>
    <ul style={{ paddingLeft: 16, margin: 0, textDecoration: "none"  }}>
      {unidadesPorEstado[estadoSelecionado]?.length > 0 ? (
        unidadesPorEstado[estadoSelecionado].map((u) => (
          <li key={u.id} style={{ whiteSpace: "nowrap"}}>
            {u.nome}
          </li>
        ))
      ) : (
        <li style={{ whiteSpace: "nowrap" }}>Nenhuma unidade</li>
      )}
    </ul>
  </div>
)}


      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 820, center: [-54, -15] }}
        width={800}
        height={600}
      >
        <Geographies geography={brTopoJson}>
          {({ geographies }) =>
            geographies.map((geo) => {
             
              const sigla = geo.properties.sigla?.trim().toUpperCase() || geo.properties.id?.trim().toUpperCase();

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: { ...geographyStyle.default, fill: corEstado(sigla), stroke: "#333" },
                    hover: { ...geographyStyle.hover },
                    pressed: { ...geographyStyle.pressed },
                  }}
                  onClick={() => setEstadoSelecionado(sigla)}
                />
              );
            })
          }
        </Geographies>

       
      </ComposableMap>

      
    </div></CardContent>
    </Card>
  );
}
