require('dotenv').config(); // Carrega o .env
const express = require('express');
const path = require('path');
const app = express();
// MIDDLEWARES 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Arquivos estáticos 
app.use(express.static(path.join(__dirname, '..', 'public')));
// ROTAS
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const gastosRoutes = require('./routes/gastos');
const categoriaRoutes = require('./routes/categorias'); 
//
app.use('/auth', authRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/gastos', gastosRoutes);
app.use('/categorias', categoriaRoutes); 
// Porta do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});