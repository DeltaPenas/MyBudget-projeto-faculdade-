const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const autenticarToken = require('../middlewares/auth');

// CREATE - cadastrar novo gasto
router.post('/', autenticarToken, async (req, res) => {
  const { descricao, valor, data, categoriaId } = req.body;

  if (!descricao || !valor) {
    return res.status(400).send('Descrição e valor são obrigatórios');
  }

  try {
    const novoGasto = await prisma.gasto.create({
      data: {
        descricao,
        valor: parseFloat(valor),
        data: data ? new Date(data) : new Date(),
        usuarioId: req.usuarioId,
        categoriaId: categoriaId ? parseInt(categoriaId) : null
      }
    });

    res.status(201).json(novoGasto);
  } catch (error) {
    console.error('Erro ao registrar gasto:', error);
    res.status(500).send('Erro ao registrar gasto');
  }
});

// READ - listar todos os gastos com usuário e categoria (uso internO)
router.get('/', autenticarToken, async (req, res) => {
  try {
    const gastos = await prisma.gasto.findMany({
      where: { usuarioId: req.usuarioId },
      include: {
        usuario: true,
        categoria: true
      }
    });
    res.json(gastos);
  } catch (error) {
    console.error('Erro ao buscar gastos:', error);
    res.status(500).send('Erro ao buscar gastos');
  }
});

// READ - listar gastos do usuário autenticado (frontend)
router.get('/usuario', autenticarToken, async (req, res) => {
  try {
    const gastos = await prisma.gasto.findMany({
      where: { usuarioId: req.usuarioId },
      include: {
        categoria: true
      },
      orderBy: {
        data: 'desc'
      }
    });

    res.json(gastos);
  } catch (error) {
    console.error('Erro ao buscar gastos do usuário:', error);
    res.status(500).send('Erro ao buscar gastos do usuário');
  }
});

// total de gastos do mês
router.get('/total-mensal', autenticarToken, async (req, res) => {
  try {
    const gastos = await prisma.gasto.findMany({
      where: {
        usuarioId: req.usuarioId
      }
    });

    const total = gastos.reduce((soma, gasto) => soma + gasto.valor, 0);
    res.json({ total });
  } catch (error) {
    console.error('Erro ao calcular total mensal:', error);
    res.status(500).json({ erro: 'Erro ao calcular total mensal' });
  }
});

module.exports = router;
