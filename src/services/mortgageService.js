const { loan, cacheTtlMs } = require('../config');
const { cached } = require('../utils/cache');
const { getUvaValue } = require('./uvaService');
const { getOfficialUsdRate } = require('./fxService');

const round2 = (n) => Math.round(n * 100) / 100;
const pct = (part, total) => (total > 0 ? round2(Math.min(100, (part / total) * 100)) : 0);

/**
 * Arma el resumen de totales para el front (feature 1).
 *
 * Reglas:
 *  - UVA:  % = UVA pagadas / UVA totales (total fijo).
 *  - ARS:  total actualizado = UVA totales × valor UVA hoy.
 *          pagado = pesos pagados (LOAN_PAID_ARS) o UVA pagadas × valor UVA hoy.
 *          % = pagado ARS / total ARS actualizado.
 *  - USD:  total = total ARS / dólar oficial venta; pagado = pagado ARS / dólar venta.
 *          % = pagado USD / total USD.
 */
async function getLoanSummary() {
  return cached('loan-summary', cacheTtlMs, buildSummary);
}

async function buildSummary() {
  // Llamadas independientes en paralelo.
  const [uva, fx] = await Promise.all([getUvaValue(), getOfficialUsdRate()]);

  const totalUva = loan.totalUva;
  const paidUva = loan.paidUva;
  const totalArs = loan.initialArs
  const totalUsd = loan.initialUsd


  return {
    updatedAt: new Date().toISOString(),
    sources: {
      uva,
      fx,
    },
    debt:
      {
        key: 'uva',
        label: 'Deuda en UVA',
        initial: round2(totalUva),
        totalUva: round2(totalUva - paidUva),
        totalArs: round2(totalArs),
        totalUsd: round2(totalUsd),
        paidUva: round2(paidUva),
        paidUvaPct: pct(paidUva, totalUva),
        remainingDebtUvaPct: round2(100 - pct(paidUva, totalUva))
      }

    ,
  };
}

module.exports = { getLoanSummary };
