const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const autenticarToken = require('../middlewares/auth');

// CREATE - novo usuário
router.post('/', async (req, res) => {
  const { login, email, senha, status, hash, valorMensal } = req.body;
  try {
    await prisma.usuario.create({
      data: {
        login,
        email,
        senha,
        status,
        hash,
        valorMensal: parseFloat(valorMensal),
      }
    });
    res.status(201).send('Usuário criado com sucesso');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// READ - listar todos os usuários
router.get('/', async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany();
    res.json(usuarios);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// UPDATE - atualizar usuário
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { login, email, senha, status, hash, valorMensal } = req.body;
  try {
    await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: {
        login,
        email,
        senha,
        status,
        hash,
        valorMensal: parseFloat(valorMensal),
      }
    });
    res.send('Usuário atualizado com sucesso');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// DELETE - remover usuário
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.usuario.delete({
      where: { id: parseInt(id) }
    });
    res.send('Usuário removido com sucesso');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// ENVIAR EMAIL
router.post('/confirmar', async (req, res) => {
  const { email, codigo } = req.body;

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario) {
      return res.status(404).send('Usuário não encontrado');
    }

    if (usuario.hash !== codigo) {
      return res.status(400).send('Código inválido');
    }

    await prisma.usuario.update({
      where: { email },
      data: {
        status: true,
        hash: null,
      },
    });

    res.send('Conta ativada com sucesso!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao confirmar cadastro');
  }
});

// GET /me - usuário logado
router.get('/me', autenticarToken, async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuarioId },
      select: {
        id: true,
        login: true,
        email: true,
        valorMensal: true,
        status: true
      }
    });

    if (!usuario) return res.status(404).send("Usuário não encontrado");

    res.json(usuario);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//PUT /usuario/saldo - atualiza saldo do usuário autenticado
router.put('/usuario/saldo', autenticarToken, async (req, res) => {
  const { valor } = req.body;

  if (!valor || isNaN(valor) || valor <= 0) {
    return res.status(400).json({ erro: 'Valor inválido para depósito' });
  }

  try {
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: req.usuarioId },
      data: {
        valorMensal: {
          increment: parseFloat(valor)
        }
      }
    });

    res.json({
      sucesso: true,
      mensagem: 'Depósito realizado com sucesso',
      valorMensal: usuarioAtualizado.valorMensal
    });
  } catch (error) {
    console.error('Erro ao realizar depósito:', error);
    res.status(500).json({ erro: 'Erro ao realizar depósito' });
  }
});

//GET /usuario/saldo - retorna saldo e total gasto
router.get('/usuario/saldo', autenticarToken, async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuarioId },
      include: { gastos: true },
    });

    const totalGasto = usuario.gastos.reduce((soma, gasto) => soma + gasto.valor, 0);
    const saldoRestante = (usuario.valorMensal || 0) - totalGasto;

    res.json({
      valorMensal: usuario.valorMensal || 0,
      totalGasto,
      saldoRestante,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao obter saldo do usuário' });
  }
});

module.exports = router;

