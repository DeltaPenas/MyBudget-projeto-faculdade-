require('dotenv').config(); // Carrega o .env
const express = require('express');
const path = require('path');
const app = express();

// MIDDLEWARES 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//  Arquivos estáticos
app.use(express.static(path.join(__dirname, '..', 'public')));

//  Rotas
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const usuariosRoutes = require('./routes/usuarios');
app.use('/usuarios', usuariosRoutes);

// Porta do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor do teste rodando em: ${PORT}`);
});

