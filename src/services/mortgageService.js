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

  const totalArs = totalUva * uva.value;
  const paidArs = loan.paidArs ?? paidUva * uva.value;

  const totalUsd = totalArs / fx.venta;
  const paidUsd = paidArs / fx.venta;

  return {
    updatedAt: new Date().toISOString(),
    sources: {
      uva,
      fx,
    },
    items: [
      {
        key: 'uva',
        label: 'Deuda en UVA',
        unit: 'UVA',
        initial: null,
        total: round2(totalUva),
        paid: round2(paidUva),
        pct: pct(paidUva, totalUva),
      },
      {
        key: 'ars',
        label: 'Deuda en pesos (actualizada)',
        unit: 'ARS',
        initial: loan.initialArs, // ← valor inicial del crédito en pesos (.env)
        total: round2(totalArs),
        paid: round2(paidArs),
        pct: pct(paidArs, totalArs),
      },
      {
        key: 'usd',
        label: 'Deuda en dólares (oficial venta)',
        unit: 'USD',
        initial: loan.initialUsd, // ← valor inicial en dólares (.env, opcional)
        total: round2(totalUsd),
        paid: round2(paidUsd),
        pct: pct(paidUsd, totalUsd),
      },
    ],
  };
}

module.exports = { getLoanSummary };
