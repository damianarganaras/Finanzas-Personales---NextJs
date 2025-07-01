// Script para probar la creación de cuentas
async function testCreateAccount() {
  // Datos de prueba para crear una cuenta
  const testAccount = {
    name: "Mi Cuenta Corriente",
    accountTypeId: "ASSET", // Usar el tipo en mayúsculas como aparece en la DB
    virtualBalance: 1000.50,
    iban: "",
    active: true,
    // currencyId se omite para usar ARS por defecto
  };

  try {
    console.log('Enviando datos:', JSON.stringify(testAccount, null, 2));
    
    const response = await fetch('http://localhost:3000/api/accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testAccount)
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Cuenta creada exitosamente!');
    } else {
      console.log('❌ Error al crear cuenta:', data.message);
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
}

// Ejecutar la prueba
testCreateAccount();
