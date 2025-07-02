// Script para probar la API de cuentas con autenticación
async function testAccountsAPI() {
  try {
    console.log('Testing accounts API...');
    
    // Simplemente intentar hacer la consulta directa a accounts
    console.log('Fetching accounts...');
    const accountsResponse = await fetch('http://localhost:3000/api/accounts', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test', // Solo para ver que pasa
      }
    });
    
    console.log('Accounts response status:', accountsResponse.status);
    
    if (accountsResponse.ok) {
      const accountsData = await accountsResponse.json();
      console.log('Accounts data:', JSON.stringify(accountsData, null, 2));
      console.log('Number of accounts:', accountsData.length);
    } else {
      const errorText = await accountsResponse.text();
      console.error('Error response:', errorText);
    }
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testAccountsAPI();
