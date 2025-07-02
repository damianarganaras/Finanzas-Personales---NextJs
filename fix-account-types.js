const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAccountTypes() {
  try {
    console.log('🔄 Corrigiendo tipos de cuenta...');
    
    // 1. Buscar y actualizar el tipo existente
    const existingType = await prisma.accountType.findFirst({
      where: { type: 'ASSET' }
    });
    
    if (existingType) {
      console.log(`📝 Actualizando tipo ${existingType.type} a asset...`);
      await prisma.accountType.update({
        where: { id: existingType.id },
        data: { 
          type: 'asset',
          name: 'Activos'
        }
      });
      console.log('✅ Tipo ASSET actualizado a asset');
    }
    
    // 2. Crear los otros tipos que faltan
    const missingTypes = [
      { type: 'expense', name: 'Gastos' }, 
      { type: 'revenue', name: 'Ingresos' },
      { type: 'liability', name: 'Pasivos' }
    ];
    
    for (const typeData of missingTypes) {
      try {
        await prisma.accountType.create({
          data: typeData
        });
        console.log(`✅ Creado tipo: ${typeData.type}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`ℹ️ Tipo ${typeData.type} ya existe`);
        } else {
          throw error;
        }
      }
    }
    
    // 3. Verificar resultado final
    console.log('\n📋 Estado final:');
    const accounts = await prisma.account.findMany({
      include: { accountType: true }
    });
    
    accounts.forEach(account => {
      console.log(`📄 ${account.name} -> ${account.accountType.type}`);
    });
    
    const types = await prisma.accountType.findMany();
    console.log('\n📋 Tipos disponibles:');
    types.forEach(type => {
      console.log(`🏷️ ${type.type} (${type.name})`);
    });
    
    console.log('\n✅ ¡Corrección completada!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAccountTypes();
