# Asynchronous Multi-Agent System

A sophisticated multi-agent system that combines browser automation, Model Context Protocol (MCP) integration, and real-time communication capabilities.

## Features

- **Multi-Agent System**: Support for multiple AI agents with different capabilities
- **Browser Automation**: Automated web browsing using Playwright
- **MCP Integration**: Model Context Protocol servers for extended functionality
- **Real-time Communication**: WebSocket support for live interactions
- **Session Management**: Persistent conversation sessions with Redis

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure Redis:
Make sure Redis is running locally or set the REDIS_URL environment variable.

3. Build the project:
```bash
npm run build
```

4. Start the server:
```bash
npm start
```

## Architecture

The system consists of several key components:

- **AgentManager**: Handles agent registration, task assignment, and coordination
- **BrowserAutomation**: Manages browser automation tasks using Playwright
- **MCPServer**: Implements the Model Context Protocol for model interactions
- **WebSocket Server**: Enables real-time communication with clients
- **Redis Integration**: Provides persistent session storage and caching

## Development

To start the development server with hot reload:

```bash
npm run dev
```

## Testing

Run the test suite:

```bash
npm test
```

## Environment Variables

- `REDIS_URL`: Redis connection URL (default: redis://localhost:6379)
- `WS_PORT`: WebSocket server port (default: 8080)

## License

MIT