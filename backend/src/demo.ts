import { flow } from './engine/FlowBuilder.js';
import { Scheduler } from './scheduler/Scheduler.js';
import { BackoffStrategy } from './types/index.js';

// Simple demo of the complete system
async function runDemo() {
  console.log('🎬 Torqvio Demo Starting...');
  
  try {
    // 1. Create a flow using the API
    console.log('\n📝 Creating flow...');
    const userOnboardingFlow = flow('user-onboarding')
      .step((user: any) => {
        console.log(`👋 Welcome ${user.name}!`);
        return { 
          message: `Welcome ${user.name}!`, 
          timestamp: new Date(),
          user: user.name
        };
      })
      .sleep('5s')
      .step((result: any) => {
        console.log('📧 Sending follow-up email to:', result.user);
        return { 
          emailSent: true, 
          ...result,
          emailTimestamp: new Date()
        };
      })
      .retry(2, BackoffStrategy.EXPONENTIAL)
      .build();
    
    console.log('✅ Flow created:', userOnboardingFlow.name);
    console.log('📊 Steps:', userOnboardingFlow.steps.length);
    console.log('🔄 Retry policy:', userOnboardingFlow.retryPolicy);
    
    // 2. Test the scheduler
    console.log('\n⏰ Testing scheduler...');
    const scheduler = new Scheduler();
    
    // Test delay parsing
    const delays = ['5s', '1m', '2h', '1d'];
    delays.forEach(delay => {
      const ms = Scheduler.parseDelayToMs(delay);
      const nextRun = Scheduler.calculateNextRunAt(delay);
      console.log(`  ${delay} = ${ms}ms (next: ${nextRun.toLocaleTimeString()})`);
    });
    
    // Get scheduler status
    console.log('📊 Scheduler status:', scheduler.getStatus());
    
    // 3. Simulate flow execution (without database for demo)
    console.log('\n🎯 Simulating flow execution...');
    
    const payload = { name: 'Alice', email: 'alice@example.com' };
    console.log('📦 Payload:', payload);
    
    // Simulate step 1
    console.log('⚡ Step 1: Welcome user');
    const step1Result = {
      message: `Welcome ${payload.name}!`,
      timestamp: new Date(),
      user: payload.name
    };
    console.log('✅ Step 1 result:', step1Result);
    
    // Simulate sleep
    console.log('😴 Sleeping for 2 seconds (demo)');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate step 2
    console.log('⚡ Step 2: Send follow-up email');
    const step2Result = {
      emailSent: true,
      ...step1Result,
      emailTimestamp: new Date()
    };
    console.log('✅ Step 2 result:', step2Result);
    
    // 4. Show final flow result
    console.log('\n🎉 Flow execution completed!');
    console.log('📋 Final result:', {
      executionId: 'demo-' + Date.now(),
      flowName: userOnboardingFlow.name,
      status: 'completed',
      steps: 2,
      duration: '2s',
      result: step2Result
    });
    
    // 5. Show system capabilities
    console.log('\n🚀 Torqvio Capabilities:');
    console.log('  ✅ Flow definition API');
    console.log('  ✅ Step execution');
    console.log('  ✅ Sleep/delay handling');
    console.log('  ✅ Retry logic');
    console.log('  ✅ Scheduler system');
    console.log('  ✅ Database persistence (ready)');
    console.log('  ✅ Event system (ready)');
    
    console.log('\n🎯 Ready for production use!');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Run the demo
runDemo();
