// Test script to verify dashboard data fetching
const dashboardService = require('./src/services/dashboardService.js')

async function testDashboardData() {
  console.log('🧪 Testing Dashboard Data Fetching...\n')

  try {
    // Test dashboard stats
    console.log('1. Testing Dashboard Stats...')
    const stats = await dashboardService.getDashboardStats()
    console.log('✅ Dashboard Stats:', stats)

    // Test recent activity
    console.log('\n2. Testing Recent Activity...')
    const activity = await dashboardService.getRecentActivity()
    console.log('✅ Recent Activity:', activity)

    // Test system status
    console.log('\n3. Testing System Status...')
    const status = await dashboardService.getSystemStatus()
    console.log('✅ System Status:', status)

    // Test roadmap domains
    console.log('\n4. Testing Roadmap Domains...')
    const domains = await dashboardService.getRoadmapDomains()
    console.log('✅ Roadmap Domains:', domains)

    console.log('\n🎉 All tests completed successfully!')
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testDashboardData()


