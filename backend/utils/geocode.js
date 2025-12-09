// utils/geocode.js
import fetch from "node-fetch";

/**
 * Consulta o endereço no Nominatim (OpenStreetMap) e retorna latitude e longitude
 * @param {string} endereco - Endereço completo (logradouro, cidade, estado, Brasil)
 * @returns {Promise<{latitude: number, longitude: number} | null>}
 */
export async function geocodeEndereco(endereco) {
  const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";
  const url = `${NOMINATIM_BASE_URL}?q=${encodeURIComponent(
    endereco
  )}&format=json&limit=1`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "DrogariaApp/1.0" }, // obrigatório pelo Nominatim
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

/**
 * Atualiza as coordenadas de uma lista de unidades no banco de dados
 * @param {Array} unidades - array de objetos com { id, logradouro, cidade, estado }
 * @param {function} updateFunc - função para atualizar unidade no banco: (id, { latitude, longitude }) => Promise
 */
export async function atualizarCoordenadasUnidades(unidades, updateFunc) {
  for (const unidade of unidades) {
    const endereco = `${unidade.logradouro}, ${unidade.cidade}, ${unidade.estado}, Brasil`;
    console.log("Geocodificando:", endereco);

    const coords = await geocodeEndereco(endereco);

    if (coords) {
      await updateFunc(unidade.id, {
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      console.log(
        `Atualizado: ${unidade.nome} => [${coords.latitude}, ${coords.longitude}]`
      );
    } else {
      console.log(`Não foi possível geocodificar: ${unidade.nome}`);
    }

    // ⚠️ Limite de requisições do Nominatim: 1 request/seg
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log("Geocodificação finalizada!");
}
