const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// CREATE - Nova categoria
router.post('/', async (req, res) => {
  const { titulo } = req.body;
  try {
    const categoria = await prisma.categoria.create({
      data: { titulo },
    });
    res.status(201).json(categoria);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// READ - Listar todas as categorias
router.get('/', async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany();
    res.json(categorias);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
