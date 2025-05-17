const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const autenticarToken = require('../middlewares/auth'); // ajuste o caminho conforme necessário

// CREATE - cadastrar novo gasto (agora com autenticação)
router.post('/', autenticarToken, async (req, res) => {
  const { descricao, valor, data, categoriaId } = req.body;

  try {
    const novoGasto = await prisma.gasto.create({
      data: {
        descricao,
        valor: parseFloat(valor),
        data: data ? new Date(data) : new Date(),
        usuarioId: req.usuarioId, // pegando do token
        categoriaId: categoriaId ? parseInt(categoriaId) : null,
      }
    });

    res.status(201).json(novoGasto);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// READ - listar todos os gastos (ex: do usuário logado)
router.get('/', autenticarToken, async (req, res) => {
  try {
    const gastos = await prisma.gasto.findMany({
      where: { usuarioId: req.usuarioId }, // filtra só os gastos do usuário autenticado
      include: {
        usuario: true,
        categoria: true,
      }
    });
    res.json(gastos);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
