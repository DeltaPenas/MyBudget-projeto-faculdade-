const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const multer = multer();
const upload = multer();
require('dotenv').config();

// rotas
const routes = require('src/index.js');
const authRoutes = require('./src/routes/auth');

// Função para gerar PDF
const { gerarPDF } = require('./src/controllers/gerarPDF');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // Adicionado para formulário HTML
app.use(express.static('public')); // Servir form.html

// rotas existentes
app.use(routes);
app.use('/auth', authRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
