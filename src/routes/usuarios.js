const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

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
        hash: null, // limpa o código
      },
    });

    res.send('Conta ativada com sucesso!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao confirmar cadastro');
  }
});

module.exports = router;

