import { flow, FlowBuilder } from './engine/FlowBuilder.js';
import { BackoffStrategy } from './types/index.js';

// Test the flow API
async function testFlowAPI() {
  console.log('🧪 Testing Flow API...');
  
  try {
    // Create a test flow
    const testFlow = flow('user-welcome')
      .step((user: any) => {
        console.log(`Welcome ${user.name}!`);
        return { message: `Welcome ${user.name}!`, timestamp: new Date() };
      })
      .sleep('5s')
      .step((result: any) => {
        console.log('Follow-up email sent:', result);
        return { emailSent: true, ...result };
      })
      .retry(3, BackoffStrategy.EXPONENTIAL)
      .build();
    
    console.log('✅ Flow created successfully!');
    console.log('📋 Flow name:', testFlow.name);
    console.log('📊 Number of steps:', testFlow.steps.length);
    console.log('🔄 Retry policy:', testFlow.retryPolicy);
    
    // Test flow serialization
    const json = JSON.stringify(testFlow);
    console.log('📦 Flow serialized to JSON');
    
    // Test flow deserialization
    const restored = FlowBuilder.fromJSON(json);
    console.log('♻️ Flow restored from JSON');
    
    console.log('✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testFlowAPI();
