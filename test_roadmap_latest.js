// Test script to verify latest roadmap functionality
const roadmapService = require('./src/services/roadmapService.js')

async function testLatestRoadmap() {
  console.log('🧪 Testing Latest Roadmap Functionality...\n')

  try {
    // Test getting latest roadmap
    console.log('1. Testing getLatestRoadmap...')
    const latestRoadmap = await roadmapService.getLatestRoadmap()
    
    if (latestRoadmap) {
      console.log('✅ Latest Roadmap Found:')
      console.log('   - Goal:', latestRoadmap.goal)
      console.log('   - Domain:', latestRoadmap.domain)
      console.log('   - Created:', latestRoadmap.created_at)
      console.log('   - Steps:', latestRoadmap.steps?.length || 0)
      
      // Test conversion to roadmap data
      console.log('\n2. Testing convertToRoadmapData...')
      const convertedData = roadmapService.convertToRoadmapData(latestRoadmap)
      console.log('✅ Converted Data:')
      console.log('   - Root nodes:', convertedData.length)
      if (convertedData.length > 0) {
        console.log('   - Root title:', convertedData[0].title)
        console.log('   - Steps:', convertedData[0].children?.length || 0)
      }
    } else {
      console.log('ℹ️  No roadmaps found in database')
    }

    // Test getting all roadmaps to see what's available
    console.log('\n3. Testing getAvailableDomains...')
    const domains = await roadmapService.getAvailableDomains()
    console.log('✅ Available domains:', domains.domains?.length || 0)

    console.log('\n🎉 Latest roadmap test completed successfully!')
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Stack:', error.stack)
  }
}

// Run the test
testLatestRoadmap()
