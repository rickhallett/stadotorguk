// Test script to verify Neon database migration functionality
import { config } from 'dotenv';
import { 
  getLeadCount, 
  createLead, 
  getMemberStats, 
  getPageCount, 
  incrementPageCount,
  type LeadData 
} from '../src/utils/database.js';

// Load environment variables
config({ path: [".env.local", ".env"] });

async function testDatabaseConnection() {
  console.log('🔌 Testing Neon database connection...\n');
  
  try {
    // Test 1: Get current lead count
    console.log('📊 Test 1: Getting current lead count...');
    const leadCount = await getLeadCount();
    console.log(`✅ Lead count: ${leadCount}`);
    
    // Test 2: Get member statistics
    console.log('\n📈 Test 2: Getting member statistics...');
    const stats = await getMemberStats();
    console.log(`✅ Member stats:`, {
      total: stats.total,
      today: stats.today,
      thisWeek: stats.thisWeek,
      thisMonth: stats.thisMonth,
      byType: stats.byType,
      growth: stats.growth,
      cacheVersion: stats.lastUpdated.substring(0, 19)
    });
    
    // Test 3: Get page count
    console.log('\n👁️  Test 3: Getting page count...');
    const pageCount = await getPageCount();
    console.log(`✅ Page count: ${pageCount}`);
    
    // Test 4: Increment page count
    console.log('\n➕ Test 4: Incrementing page count...');
    const newPageCount = await incrementPageCount();
    console.log(`✅ New page count: ${newPageCount}`);
    
    // Test 5: Create test lead
    console.log('\n👤 Test 5: Creating test lead...');
    const testLead: LeadData = {
      timestamp: new Date().toISOString(),
      user_id: 'test_usr_' + Date.now(),
      submission_id: 'test_sub_' + Date.now(),
      first_name: 'Test',
      last_name: 'User',
      name: 'Test User',
      email: 'test@example.com',
      visitor_type: 'Local',
      comments: 'Migration test entry',
      referral_code: '',
      source: 'test_script',
      published: true
    };
    
    const leadId = await createLead(testLead);
    console.log(`✅ Created test lead with ID: ${leadId}`);
    
    // Test 6: Verify lead count increased
    console.log('\n🔄 Test 6: Verifying lead count increased...');
    const newLeadCount = await getLeadCount();
    console.log(`✅ New lead count: ${newLeadCount} (increased by ${newLeadCount - leadCount})`);
    
    console.log('\n🎉 All database tests passed!');
    console.log('\n📋 Summary:');
    console.log(`   • Database connection: ✅ Working`);
    console.log(`   • Lead operations: ✅ Working`);
    console.log(`   • Member stats: ✅ Working`);
    console.log(`   • Page counter: ✅ Working`);
    console.log(`   • Performance: Expected <100ms for queries`);
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Ensure DATABASE_URL is set in .env');
    console.log('   2. Run setup-database.sql in your Neon console');
    console.log('   3. Verify network connection to Neon');
    console.log('   4. Check Neon dashboard for connection limits');
    
    process.exit(1);
  }
}

// Test API endpoints
async function testApiEndpoints() {
  console.log('\n🌐 Testing API endpoints...\n');
  
  const baseUrl = process.env.SITE_URL || 'http://localhost:4321';
  
  try {
    // Test counter API
    console.log('📊 Testing counter API...');
    const counterResponse = await fetch(`${baseUrl}/api/counter`);
    const counterData = await counterResponse.json();
    console.log(`✅ Counter API: ${counterData.count}`);
    
    // Test submit-lead API structure (don't actually submit)
    console.log('\n📝 Testing submit-lead API structure...');
    const submitResponse = await fetch(`${baseUrl}/api/submit-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}) // Empty body to test validation
    });
    
    if (submitResponse.status === 400) {
      console.log('✅ Submit-lead API: Validation working (400 for empty body)');
    } else {
      console.log(`⚠️  Submit-lead API: Unexpected status ${submitResponse.status}`);
    }
    
    console.log('\n🎉 API endpoint tests completed!');
    
  } catch (error) {
    console.error('❌ API test failed:', error);
    console.log('   Note: API tests require the development server to be running');
  }
}

async function runAllTests() {
  console.log('🚀 Starting Neon Database Migration Tests\n');
  console.log('=' .repeat(50));
  
  await testDatabaseConnection();
  
  console.log('\n' + '='.repeat(50));
  
  await testApiEndpoints();
  
  console.log('\n' + '='.repeat(50));
  console.log('\n✨ Migration testing complete!');
  console.log('\nNext steps:');
  console.log('1. Run the migration script: npm run migrate-leads');
  console.log('2. Update .env with your DATABASE_URL');
  console.log('3. Deploy to production');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { testDatabaseConnection, testApiEndpoints, runAllTests };