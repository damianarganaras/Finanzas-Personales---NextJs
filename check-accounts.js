const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAccounts() {
  try {
    // Verificar todas las cuentas y sus tipos
    const accounts = await prisma.account.findMany({
      include: {
        accountType: true
      }
    });
    
    console.log('=== CUENTAS ACTUALES ===');
    accounts.forEach(account => {
      console.log(`Cuenta: ${account.name} - Tipo: ${account.accountType.type}`);
    });
    
    // Verificar tipos de cuenta disponibles
    const types = await prisma.accountType.findMany();
    console.log('\n=== TIPOS DE CUENTA DISPONIBLES ===');
    types.forEach(type => {
      console.log(`ID: ${type.id} - Tipo: ${type.type}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAccounts();
