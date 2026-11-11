require('dotenv').config();

const num = (v, def = 0) => (v === undefined || v === '' ? def : Number(v));
const optNum = (v) => (v === undefined || v === '' ? null : Number(v));

module.exports = {
  port: num(process.env.PORT, 4000),

  // ← MODIFICAR: datos del crédito (ver .env.example)
  loan: {
    totalUva: num(process.env.LOAN_TOTAL_UVA),
    paidUva: num(process.env.LOAN_PAID_UVA),
    initialArs: num(process.env.LOAN_INITIAL_ARS),
    initialUsd: optNum(process.env.LOAN_INITIAL_USD),
    paidArs: optNum(process.env.LOAN_PAID_ARS),
  },

  // ← MODIFICAR: URLs / IDs de las APIs externas
  sources: {
    bcraBaseUrl: 'https://api.bcra.gob.ar/estadisticas/v3.0/Monetarias',
    bcraUvaSeriesId: process.env.BCRA_UVA_SERIES_ID || '31',
    // Fallback si el BCRA no responde (historial de UVA).
    uvaFallbackUrl: 'https://api.argentinadatos.com/v1/finanzas/indices/uva',
    fxUrl: process.env.FX_URL || 'https://dolarapi.com/v1/dolares/oficial',
    timeoutMs: 8000,
  },

  // ← MODIFICAR: minutos de cache
  cacheTtlMs: num(process.env.CACHE_TTL_MINUTES, 60) * 60 * 1000,
};
