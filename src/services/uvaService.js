const { sources } = require('../config');
const { getJson } = require('../utils/http');

/**
 * Obtiene el valor de la UVA más reciente.
 * 1) BCRA (Estadísticas v3.0). 2) Fallback: argentinadatos.com
 * Devuelve: { value, date, source }
 */
async function getUvaValue() {
  try {
    return await fromBcra();
  } catch (err) {
    console.warn('[UVA] BCRA falló, uso fallback:', err.message);
    return await fromArgentinaDatos();
  }
}

async function fromBcra() {
  // Pedimos los últimos 30 días para asegurar que haya datos (fines de semana / feriados).
  const hasta = new Date();
  const desde = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const fmt = (d) => d.toISOString().slice(0, 10);
  const url = `${sources.bcraBaseUrl}/${sources.bcraUvaSeriesId}?desde=${fmt(desde)}&hasta=${fmt(hasta)}&limit=1000`;

  const json = await getJson(url);
  // La respuesta puede venir como results[].detalle[] o results[] directo.
  const first = json?.results?.[0];
  const detalle = Array.isArray(first?.detalle) ? first.detalle : json?.results;
  const last = [...(detalle || [])].sort((a, b) => (a.fecha < b.fecha ? -1 : 1)).pop();
  if (!last || typeof last.valor !== 'number') throw new Error('Sin datos de UVA en BCRA');

  return { value: last.valor, date: last.fecha, source: 'BCRA' };
}

async function fromArgentinaDatos() {
  const data = await getJson(sources.uvaFallbackUrl);
  const last = data[data.length - 1];
  if (!last) throw new Error('Sin datos de UVA en fallback');
  return { value: last.valor, date: last.fecha, source: 'argentinadatos' };
}

module.exports = { getUvaValue };
