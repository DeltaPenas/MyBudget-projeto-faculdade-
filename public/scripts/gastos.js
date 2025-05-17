const form = document.getElementById('form-gasto');
const lista = document.getElementById('lista-gastos');
const token = localStorage.getItem('token'); // Assumindo que foi salvo após login

if (!token) {
  alert("Você precisa estar logado!");
  window.location.href = "/login.html";
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const descricao = document.getElementById('descricao').value;
  const valor = document.getElementById('valor').value;
  const data = document.getElementById('data').value;

  try {
    const response = await fetch('http://localhost:3000/gastos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ descricao, valor, data })
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
    lista.innerHTML = '';
    gastos.forEach(g => {
      const item = document.createElement('li');
      item.textContent = `${g.descricao} - R$ ${g.valor} - ${new Date(g.data).toLocaleDateString()}`;
      lista.appendChild(item);
    });
  } catch (err) {
    alert("Erro ao carregar gastos");
  }
}

carregarGastos(); // Carrega ao abrir a página
