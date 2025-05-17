const form = document.getElementById('form-gasto');
const listaGastos = document.getElementById('lista-gastos');
const token = localStorage.getItem('token');
const categoriaSelect = document.getElementById('categoria');

// Lista fixa de categorias
const categoriasFixas = ['Alimentação', 'Transporte', 'Saúde', 'Lazer', 'Educação', 'Outros'];

document.addEventListener('DOMContentLoaded', async () => {
  if (!token) {
    alert("Você precisa estar logado!");
    window.location.href = "/login.html";
    return;
  }

  // Preenche as opções do select
  categoriasFixas.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoriaSelect.appendChild(option);
  });

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
    alerta.textContent = saldo < 0 ? '⚠ Você ultrapassou seu limite de gastos!' : '';
  } catch (err) {
    console.error('Erro ao carregar dados do usuário:', err);
  }

  carregarGastos(); // Carrega ao abrir a página
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const descricao = document.getElementById('descricao').value;
  const valor = document.getElementById('valor').value;
  const data = document.getElementById('data').value;
  const categoria = categoriaSelect.value;

  try {
    const response = await fetch('http://localhost:3000/gastos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ descricao, valor, data, categoria })
    });

    if (!response.ok) throw new Error(await response.text());

    alert("Gasto adicionado!");
    form.reset();
    carregarGastos(); // Atualiza a lista
  } catch (err) {
    alert("Erro: " + err.message);
  }
});

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
      item.textContent = `${g.descricao} - R$ ${g.valor} - ${new Date(g.data).toLocaleDateString()} - ${g.categoria?.titulo || 'Sem categoria'}`;
      listaGastos.appendChild(item);
    });
  } catch (err) {
    alert("Erro ao carregar gastos");
  }
}
