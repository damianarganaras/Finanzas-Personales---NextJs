/*
  Script de migración: PiggyBank -> SavingGoal
  Uso: ejecutar con ts-node o compilar a JS.
*/
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando migración de PiggyBank a SavingGoal...');
  const piggies = await prisma.piggyBank.findMany();
  let migrated = 0;

  for (const p of piggies) {
    // Crear SavingGoal equivalente si no existe uno con mismo nombre/usuario
    const existing = await prisma.savingGoal.findFirst({ where: { userId: p.userId, name: p.name } });
    if (existing) continue;

    await prisma.savingGoal.create({
      data: {
        userId: p.userId,
        name: p.name,
        currency: 'ARS',
        targetAmount: p.targetAmount,
        currentAmount: p.currentAmount, // opcional: recalcular con contribuciones
        dueDate: p.targetDate,
      },
    });
    migrated++;
  }

  console.log(`Migración completa. Metas migradas: ${migrated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
