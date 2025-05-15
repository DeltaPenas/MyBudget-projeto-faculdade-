const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// CREATE - Novo gasto
router.post('/', async (req, res) => {
  const { descricao, valor, data, usuarioId, categoriaId } = req.body;
  try {
    const novoGasto = await prisma.gasto.create({
      data: {
        descricao,
        valor: parseFloat(valor),
        data: new Date(data),
        usuarioId: parseInt(usuarioId),
        categoriaId: categoriaId ? parseInt(categoriaId) : null,
      },
    });
    res.status(201).json(novoGasto);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// READ - Listar todos os gastos
router.get('/', async (req, res) => {
  try {
    const gastos = await prisma.gasto.findMany({
      include: {
        usuario: true,
        categoria: true,
      },
    });
    res.json(gastos);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
