const form = document.getElementById('form-gasto');
const listaGastos = document.getElementById('lista-gastos');
const token = localStorage.getItem('token');
const categoriaSelect = document.getElementById('categoria');
const formDeposito = document.getElementById('form-deposito');
const valorDepositoInput = document.getElementById('valor-deposito');

document.addEventListener('DOMContentLoaded', async () => {
  if (!token) {
    alert("Você precisa estar logado!");
    window.location.href = "/login.html";
    return;
  }

  // Carrega categorias
  try {
    const resCategorias = await fetch('http://localhost:3000/categorias', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const categorias = await resCategorias.json();
    categoriaSelect.innerHTML = '<option value="">Selecione a categoria</option>';

    categorias.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.titulo;
      categoriaSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Erro ao carregar categorias:", err);
  }

  await atualizarSaldos();
  carregarGastos();
});

// FORMULÁRIO DE DEPÓSITO
formDeposito.addEventListener('submit', async (e) => {
  e.preventDefault();

  const valor = parseFloat(valorDepositoInput.value);
  if (isNaN(valor) || valor <= 0) {
    alert("Insira um valor válido para o depósito.");
    return;
  }

  if (!token) {
    alert("Usuário não autenticado.");
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/usuarios/usuario/saldo', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ valor })
    });

    if (!res.ok) {
      const erroTexto = await res.text();
      throw new Error(erroTexto);
    }

    const dados = await res.json();
    alert("Depósito adicionado com sucesso! Novo saldo: R$ " + dados.valorMensal);
    valorDepositoInput.value = "";
    await atualizarSaldos(); // <- ESSENCIAL: atualiza os valores na interface

  } catch (err) {
    alert("Erro ao fazer depósito: " + err.message);
  }
});

// FORMULÁRIO DE GASTO
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const descricao = document.getElementById('descricao').value;
  const valor = document.getElementById('valor').value;
  const data = document.getElementById('data').value;
  const categoriaId = categoriaSelect.value;

  if (!categoriaId) {
    alert("Selecione uma categoria válida.");
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/gastos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ descricao, valor, data, categoriaId })
    });

    if (!response.ok) throw new Error(await response.text());

    alert("Gasto adicionado!");
    form.reset();
    await atualizarSaldos();
    carregarGastos();
    location.reload();
  } catch (err) {
    alert("Erro ao adicionar gasto: " + err.message);
  }
});

// CARREGAR SALDO
async function atualizarSaldos() {
  try {
    const [usuarioRes, gastoRes] = await Promise.all([
      fetch('http://localhost:3000/usuarios/me', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch('http://localhost:3000/gastos/total-mensal', {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);

    const usuario = await usuarioRes.json();
    const total = await gastoRes.json();

    const valorMensal = usuario.valorMensal || 0;
    const totalGasto = total.total || 0;
    const saldo = (valorMensal - totalGasto).toFixed(2);

    document.getElementById('valor-mensal').textContent = valorMensal.toFixed(2);
    document.getElementById('total-gasto').textContent = totalGasto.toFixed(2);
    document.getElementById('saldo-restante').textContent = saldo;

    const alerta = document.getElementById('alerta');
    alerta.textContent = saldo < 0 ? 'SALDO NEGATIVO!!!' : '';
  } catch (err) {
    console.error('Erro ao carregar dados do usuário:', err);
  }
}

// CARREGAR GASTOS
async function carregarGastos() {
  try {
    const response = await fetch('http://localhost:3000/gastos/usuario', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const gastos = await response.json();
    listaGastos.innerHTML = '';

    gastos.forEach(g => {
      const item = document.createElement('li');
      item.textContent = `${g.descricao} - R$ ${parseFloat(g.valor).toFixed(2)} - ${new Date(g.data).toLocaleDateString()} - ${g.categoria?.titulo || 'Sem categoria'}`;
      listaGastos.appendChild(item);
    });
  } catch (err) {
    alert("Erro ao carregar gastos: " + err.message);
  }
  
  document.getElementById('btn-relatorio').addEventListener('click', () => {
  if (!token) {
    alert("Você precisa estar logado!");
    return;
  }

  fetch('http://localhost:3000/gastos/relatorio', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(res => {
    if (!res.ok) throw new Error("Erro ao gerar relatório.");

    return res.blob();
  })
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio-gastos.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  })
  .catch(err => {
    alert("Erro ao baixar relatório: " + err.message);
  });
});



}

