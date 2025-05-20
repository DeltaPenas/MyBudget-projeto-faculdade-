const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categorias = [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Lazer',
    'Outros'
  ];

  for (const titulo of categorias) {
    await prisma.categoria.upsert({
      where: { titulo },
      update: {},
      create: { titulo },
    });
  }

  console.log("Categorias inseridas com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });