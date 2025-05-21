const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const autenticarToken = require('../middlewares/auth');
const PDFDocument = require('pdfkit');


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

//relatorio PDF


router.get('/relatorio', autenticarToken, async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuarioId }
    });

    const gastos = await prisma.gasto.findMany({
      where: { usuarioId: req.usuarioId },
      include: { categoria: true },
      orderBy: { data: 'desc' }
    });

    const totalGastos = gastos.reduce((acc, gasto) => acc + gasto.valor, 0);

    const gastosPorCategoria = gastos.reduce((acc, gasto) => {
      const categoria = gasto.categoria?.titulo || 'Sem categoria';
      acc[categoria] = (acc[categoria] || 0) + gasto.valor;
      return acc;
    }, {});

    const porcentagens = Object.entries(gastosPorCategoria).map(([categoria, valor]) => ({
      categoria,
      valor,
      percentual: totalGastos ? ((valor / totalGastos) * 100).toFixed(2) : '0.00'
    }));

    const doc = new PDFDocument();
    const nomeArquivo = `relatorio-${usuario.nome || usuario.login}.pdf`;

    res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo}"`);
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    // Cabeçalho
    doc.fontSize(20).text(`Relatório de Gastos`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Usuário: ${usuario.nome || usuario.login}`);

    // Data no formato básico, ex: 05/20/2025
    const dataGeracao = new Date().toLocaleDateString();
    doc.text(`Data de Geração: ${dataGeracao}`);
    doc.moveDown();

    // Gastos detalhados
    if (gastos.length === 0) {
      doc.text('Nenhum gasto encontrado.');
    } else {
      gastos.forEach(gasto => {
        doc.text(`- ${gasto.descricao}`);
        doc.text(`  Valor: R$ ${gasto.valor.toFixed(2)}`);

        // Data do gasto também no formato básico
        const dataGasto = new Date(gasto.data).toLocaleDateString();
        doc.text(`  Data: ${dataGasto}`);

        doc.text(`  Categoria: ${gasto.categoria?.titulo || 'Sem categoria'}`);
        doc.moveDown(0.5);
      });
    }

    //resumo das categorias no fim do relatorio
    doc.moveDown();
    doc.fontSize(16).text('Resumo por Categoria:');
    porcentagens.forEach(({ categoria, valor, percentual }) => {
      doc.fontSize(12).text(`- ${categoria}: R$ ${valor.toFixed(2)} (${percentual}%)`);
    });

    doc.end();

  } catch (err) {
    console.error("Erro ao gerar relatório:", err);
    res.status(500).send("Erro ao gerar relatório");
  }
});

// GET /gastos/por-categoria - retorna total de gastos agrupados por categoria
router.get('/por-categoria', autenticarToken, async (req, res) => {
  try {
    const resultado = await prisma.gasto.groupBy({
      by: ['categoriaId'],
      where: { usuarioId: req.usuarioId },
      _sum: { valor: true },
    });

    const categorias = await prisma.categoria.findMany();

    const dados = resultado.map(r => {
      const categoria = categorias.find(c => c.id === r.categoriaId);
      return {
        categoria: categoria?.titulo || 'Sem categoria',
        total: r._sum.valor
      };
    });

    res.json(dados);
  } catch (error) {
    console.error('Erro ao agrupar gastos por categoria:', error);
    res.status(500).send('Erro ao gerar dados do gráfico');
  }
});

module.exports = router;

