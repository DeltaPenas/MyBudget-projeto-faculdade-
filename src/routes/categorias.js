const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const autenticarToken = require('../middlewares/auth');

// GET /categorias - retorna todas as categorias
router.get('/', autenticarToken, async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { titulo: 'asc' } //ordena por nome
    });
    res.json(categorias);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    res.status(500).send("Erro ao buscar categorias");
  }
});

module.exports = router;