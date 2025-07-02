const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateAccountTypes() {
  try {
    console.log('🔄 Iniciando migración de tipos de cuenta...');
    
    // 1. Crear tipos de cuenta correctos en minúsculas
    const correctTypes = [
      { id: 'asset', type: 'asset', name: 'Activos' },
      { id: 'expense', type: 'expense', name: 'Gastos' }, 
      { id: 'revenue', type: 'revenue', name: 'Ingresos' },
      { id: 'liability', type: 'liability', name: 'Pasivos' }
    ];
    
    console.log('📝 Creando tipos de cuenta en minúsculas...');
    for (const typeData of correctTypes) {
      await prisma.accountType.upsert({
        where: { id: typeData.id },
        update: {},
        create: typeData
      });
      console.log(`✅ Creado/verificado tipo: ${typeData.type}`);
    }
    
    // 2. Migrar cuentas existentes
    console.log('\n🔀 Migrando cuentas existentes...');
    
    // Buscar cuentas con tipos en mayúsculas
    const accountsToMigrate = await prisma.account.findMany({
      include: {
        accountType: true
      },
      where: {
        accountType: {
          type: {
            in: ['ASSET', 'EXPENSE', 'REVENUE', 'LIABILITY']
          }
        }
      }
    });
    
    console.log(`📊 Encontradas ${accountsToMigrate.length} cuentas para migrar`);
    
    for (const account of accountsToMigrate) {
      const oldType = account.accountType.type;
      const newTypeId = oldType.toLowerCase();
      
      await prisma.account.update({
        where: { id: account.id },
        data: { accountTypeId: newTypeId }
      });
      
      console.log(`✅ Migrada cuenta "${account.name}" de ${oldType} a ${newTypeId}`);
    }
    
    // 3. Eliminar tipos obsoletos en mayúsculas
    console.log('\n🗑️ Eliminando tipos obsoletos...');
    
    const obsoleteTypes = await prisma.accountType.findMany({
      where: {
        type: {
          in: ['ASSET', 'EXPENSE', 'REVENUE', 'LIABILITY']
        }
      }
    });
    
    for (const type of obsoleteTypes) {
      // Verificar que no hay cuentas usando este tipo
      const accountCount = await prisma.account.count({
        where: { accountTypeId: type.id }
      });
      
      if (accountCount === 0) {
        await prisma.accountType.delete({
          where: { id: type.id }
        });
        console.log(`🗑️ Eliminado tipo obsoleto: ${type.type}`);
      } else {
        console.log(`⚠️ No se puede eliminar ${type.type}, aún tiene ${accountCount} cuentas`);
      }
    }
    
    // 4. Verificar resultado final
    console.log('\n📋 Estado final:');
    const finalAccounts = await prisma.account.findMany({
      include: { accountType: true }
    });
    
    finalAccounts.forEach(account => {
      console.log(`📄 ${account.name} -> ${account.accountType.type}`);
    });
    
    const finalTypes = await prisma.accountType.findMany();
    console.log('\n📋 Tipos disponibles:');
    finalTypes.forEach(type => {
      console.log(`🏷️ ${type.type}`);
    });
    
    console.log('\n✅ ¡Migración completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateAccountTypes();
