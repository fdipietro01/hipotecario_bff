const express = require('express');
const { getLoanSummary } = require('../services/mortgageService');

const router = express.Router();

// GET /api/loan/summary → totales y % cubierto en UVA, ARS y USD
router.get('/summary', async (req, res) => {
  try {
    const loanData = await getLoanSummary()
    res.json(loanData);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'No se pudieron obtener los datos externos', detail: err.message });
  }
});

module.exports = router;
