// utils/geocodeUnidadesExistentes.js
import fetch from "node-fetch";
import { readAll, update } from "../config/database.js";

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";

async function geocodeEndereco(endereco) {
  const url = `${NOMINATIM_BASE_URL}?q=${encodeURIComponent(
    endereco
  )}&format=json&limit=1`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "DrogariaApp/1.0" },
    });
    const data = await res.json();

    if (data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
  } catch (error) {
    console.error("Erro no geocoding:", error);
  }

  return null;
}

async function atualizarCoordenadasExistentes() {
  try {
    const unidades = await readAll("unidade"); // pega todas as unidades

    for (const unidade of unidades) {
      const endereco = `${unidade.logradouro}, ${unidade.cidade}, ${unidade.estado}, Brasil`;
      console.log("Geocodificando:", endereco);

      const coords = await geocodeEndereco(endereco);

      if (coords) {
        await update(
          "unidade",
          { latitude: coords.latitude, longitude: coords.longitude },
          `id = ${unidade.id}`
        );
        console.log(
          `Atualizado: ${unidade.nome} => [${coords.latitude}, ${coords.longitude}]`
        );
      } else {
        console.log(`Não foi possível geocodificar: ${unidade.nome}`);
      }

      // ⚠️ Limite de requisições: 1 request/segundo recomendado pelo Nominatim
      await new Promise((r) => setTimeout(r, 1000));
    }

    console.log("Atualização de coordenadas finalizada!");
  } catch (error) {
    console.error("Erro ao atualizar coordenadas:", error);
  }
}

// Executar
atualizarCoordenadasExistentes();
