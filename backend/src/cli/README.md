# Torqvio CLI

The official command-line interface for Torqvio - the durable long-running workflow engine.

## Installation

### npm (Recommended)
```bash
npm install -g torqvio-cli
```

### yarn
```bash
yarn global add torqvio-cli
```

### Direct Download
```bash
# macOS
curl -L https://github.com/torqvio/cli/releases/latest/download/torqvio-macos -o torqvio
chmod +x torqvio
sudo mv torqvio /usr/local/bin/

# Linux
curl -L https://github.com/torqvio/cli/releases/latest/download/torqvio-linux -o torqvio
chmod +x torqvio
sudo mv torqvio /usr/local/bin/

# Windows
curl -L https://github.com/torqvio/cli/releases/latest/download/torqvio-windows.exe -o torqvio.exe
.\torqvio.exe install
```

## Quick Start

1. **Initialize a project**
```bash
torqvio init
```

2. **Authenticate**
```bash
torqvio auth login --api-key your_api_key_here
```

3. **Deploy a template**
```bash
torqvio deploy payment-recovery
```

4. **List workflows**
```bash
torqvio workflows list
```

## Commands

### Authentication
```bash
# Login with API key
torqvio auth login --api-key your_key

# OAuth authentication
torqvio auth login --oauth

# Check status
torqvio auth status

# Logout
torqvio auth logout
```

### Workflows
```bash
# List workflows
torqvio workflows list

# Get workflow details
torqvio workflows get <workflow-id>

# Create workflow
torqvio workflows create --name "My Workflow" --file workflow.json

# Run workflow
torqvio workflows run <workflow-id> --data '{"input": "value"}'

# Delete workflow
torqvio workflows delete <workflow-id>
```

### Executions
```bash
# List executions
torqvio executions list

# Get execution details
torqvio executions get <execution-id>

# Watch execution in real-time
torqvio executions watch <execution-id>

# Cancel execution
torqvio executions cancel <execution-id>
```

### Templates
```bash
# List templates
torqvio templates list

# Use template
torqvio templates use approval-workflow --name "My Approval"

# Show template details
torqvio templates show approval-workflow
```

### Configuration
```bash
# Set API URL
torqvio config set api_url https://api.torqvio.com

# View configuration
torqvio config list

# Reset configuration
torqvio config reset
```

### Bulk Operations
```bash
# Bulk execute workflows
torqvio bulk run --workflow-id <id> --inputs-file inputs.json

# Export workflows
torqvio bulk export --format json --output workflows.json

# Import workflows
torqvio bulk import --file workflows.json
```

### Environment Management
```bash
# List environments
torqvio env list

# Switch environment
torqvio env use production

# Set environment variable
torqvio env set DATABASE_URL postgres://localhost/db
```

### Monitoring
```bash
# System status
torqvio monitoring status

# View metrics
torqvio monitoring metrics

# View logs
torqvio monitoring logs
```

### Utilities
```bash
# Show version
torqvio utils version

# Generate completion script
torqvio utils completion bash

# Run diagnostics
torqvio utils doctor

# Clean cache
torqvio utils clean --cache
```

## Global Options

```bash
# Enable debug mode
torqvio --debug <command>

# Verbose output
torqvio --verbose <command>

# Specify configuration file
torqvio --config ~/.torqvio.yaml <command>

# Specify API URL
torqvio --api-url https://api.torqvio.com <command>

# Specify workspace
torqvio --workspace my-workspace <command>
```

## Configuration

Create a `.torqvio` configuration file in your project root:

```yaml
# .torqvio
api_url: https://api.torqvio.com
workspace: my-workspace
default_environment: development

environments:
  development:
    api_url: http://localhost:8459
  production:
    api_url: https://api.torqvio.com

workflows:
  auto_discover: true
  paths:
    - ./workflows
    - ./src/workflows
```

## Shell Completions

### Bash
```bash
# Add to ~/.bashrc
eval "$(torqvio completion bash)"
```

### Zsh
```bash
# Add to ~/.zshrc
eval "$(torqvio completion zsh)"
```

### Fish
```bash
# Add to ~/.config/fish/config.fish
torqvio completion fish | source
```

## Examples

### Payment Recovery Workflow
```bash
# Deploy payment recovery template
torqvio deploy payment-recovery

# Monitor execution
torqvio executions watch --follow

# Check status
torqvio monitoring status
```

### Custom Workflow
```bash
# Create from file
torqvio workflows create --file my-workflow.json

# Run with data
torqvio workflows run wf_001 --data '{"amount": 99.99, "currency": "USD"}'

# Watch execution
torqvio executions watch exec_123 --logs
```

### Bulk Operations
```bash
# Export all workflows
torqvio bulk export --format json --output backup.json

# Import to new workspace
torqvio bulk import --file backup.json --workspace new-project
```

## Troubleshooting

### "API key not found"
```bash
# Check if API key is set
torqvio config list

# Set API key
torqvio auth login --api-key your_key
```

### "Connection timeout"
```bash
# Check API URL
torqvio config get api_url

# Set custom timeout
torqvio config set timeout 30
```

### "Permission denied"
```bash
# Check file permissions
ls -la $(which torqvio)

# Reinstall with proper permissions
npm uninstall -g torqvio-cli
sudo npm install -g torqvio-cli
```

## Development

### Building from Source
```bash
git clone https://github.com/torqvio/cli.git
cd cli
npm install
npm run build
npm link
```

### Running Tests
```bash
npm test
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT © [Torqvio Team](https://torqvio.com)

## Support

- **Documentation**: [https://docs.torqvio.com](https://docs.torqvio.com)
- **Issues**: [GitHub Issues](https://github.com/torqvio/cli/issues)
- **Discord**: [Join our Discord](https://discord.gg/torqvio)
- **Email**: [support@torqvio.com](mailto:support@torqvio.com)

---

Built with durability in mind. 🚀
