import { createDemoApiServer } from './api/demo-server.js';

async function main() {
  console.log('🚀 Starting Torqvio API Demo Server...');
  
  try {
    // Create and start demo API server
    const { app, PORT } = createDemoApiServer();
    
    app.listen(PORT, () => {
      console.log(`🌐 Torqvio API Demo Server running on port ${PORT}`);
      console.log('');
      console.log('📚 Available endpoints:');
      console.log('  GET  /health                    - Health check');
      console.log('  GET  /api/v1                    - API information');
      console.log('  GET  /api/v1/demo/flows         - List demo flows');
      console.log('  GET  /api/v1/demo/executions    - List demo executions');
      console.log('  POST /api/v1/demo/flows/:id/execute - Execute demo flow');
      console.log('');
      console.log('🎯 Try these commands:');
      console.log(`  curl http://localhost:${PORT}/health`);
      console.log(`  curl http://localhost:${PORT}/api/v1`);
      console.log(`  curl http://localhost:${PORT}/api/v1/demo/flows`);
      console.log(`  curl http://localhost:${PORT}/api/v1/demo/executions`);
      console.log('');
      console.log('📝 Note: This is a demo mode without database connectivity');
      console.log('🎯 Torqvio API Demo is ready!');
    });
    
  } catch (error) {
    console.error('❌ Failed to start Torqvio Demo:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start the application
main();
