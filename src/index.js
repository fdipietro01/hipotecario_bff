const express = require('express');
const cors = require('cors');
const { port } = require('./config');
const loanRoutes = require('./routes/loan');

const app = express();
app.use(cors()); // ← MODIFICAR en producción: restringir origen
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/loan', loanRoutes);

app.listen(port, () => console.log(`BFF escuchando en http://localhost:${port}`));
