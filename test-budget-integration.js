// Quick integration test for budget functionality
const { exec } = require('child_process');

async function testBudgetEndpoints() {
  console.log('🧪 Testing Budget Integration...\n');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test GET /api/budgets
    console.log('📊 Testing GET /api/budgets...');
    const response = await fetch(`${baseUrl}/api/budgets`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ GET /api/budgets - Success');
      console.log('📋 Response structure:', {
        budgets: Array.isArray(data.budgets),
        count: data.budgets?.length || 0,
        pagination: data.pagination ? 'present' : 'missing'
      });
    } else {
      console.log('❌ GET /api/budgets - Failed:', response.status, response.statusText);
    }

    // Test GET /api/budgets/progress
    console.log('\n📈 Testing GET /api/budgets/progress...');
    const progressResponse = await fetch(`${baseUrl}/api/budgets/progress`);
    
    if (progressResponse.ok) {
      const progressData = await progressResponse.json();
      console.log('✅ GET /api/budgets/progress - Success');
      console.log('📋 Response structure:', {
        progress: Array.isArray(progressData.progress),
        count: progressData.progress?.length || 0
      });
    } else {
      console.log('❌ GET /api/budgets/progress - Failed:', progressResponse.status, progressResponse.statusText);
    }

    console.log('\n🎉 Budget integration test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('fetch') || error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Make sure the development server is running with: npm run dev');
    }
  }
}

// Run the test
testBudgetEndpoints();
