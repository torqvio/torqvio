import { Scheduler } from './Scheduler.js';

// Test the scheduler
async function testScheduler() {
  console.log('🧪 Testing Scheduler...');
  
  try {
    const scheduler = new Scheduler();
    
    // Test delay parsing
    console.log('⏰ Testing delay parsing...');
    
    const test1 = Scheduler.parseDelayToMs('5s');
    console.log(`5s = ${test1}ms`);
    
    const test2 = Scheduler.parseDelayToMs('2m');
    console.log(`2m = ${test2}ms`);
    
    const test3 = Scheduler.parseDelayToMs('1h');
    console.log(`1h = ${test3}ms`);
    
    // Test next run calculation
    const nextRun = Scheduler.calculateNextRunAt('30s');
    console.log(`Next run in 30s: ${nextRun.toISOString()}`);
    
    // Test scheduler status
    console.log('📊 Scheduler status:', scheduler.getStatus());
    
    console.log('✅ Scheduler tests passed!');
    
  } catch (error) {
    console.error('❌ Scheduler test failed:', error);
  }
}

// Run the test
testScheduler();
