const { sources } = require('../config');
const { getJson } = require('../utils/http');

/**
 * Dólar oficial: se usa el valor de VENTA.
 * Respuesta esperada de dolarapi: { compra, venta, fechaActualizacion, ... }
 * Si cambiás de API, ajustá solo este archivo.
 */
async function getOfficialUsdRate() {
  const data = await getJson(sources.fxUrl);
  if (typeof data.venta !== 'number') throw new Error('Respuesta FX inválida');
  return {
    venta: data.venta,
    compra: data.compra ?? null,
    date: data.fechaActualizacion ?? null,
    source: 'dolarapi',
  };
}

module.exports = { getOfficialUsdRate };
