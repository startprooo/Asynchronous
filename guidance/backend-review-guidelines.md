# Backend Code Review Guidelines

## Architecture
- Verify dependency injection pattern is followed using `@Injectable()`
- Check that services extend `EventEmitter` when they emit events
- Ensure Redis state management follows repository pattern
- Validate MCP handlers are properly registered

## API Design
- Controllers use proper decorators (`@Controller`, `@Post`, `@Get`, etc.)
- Routes follow RESTful conventions
- SSE/WebSocket endpoints properly handle subscriptions
- Error responses use standard HTTP status codes

## Agent System
- New agent capabilities are registered in `AgentManager`
- Agent state persistence uses Redis client
- Memory management follows short-term/working memory pattern
- Task distribution logic is properly implemented

## MCP Integration
- Model handlers implement required protocol methods
- Stream responses use async iterators
- Model loading follows lazy initialization pattern
- Error handling includes proper model fallbacks

## State Management
- Redis operations are wrapped in try/catch blocks
- State mutations occur only through designated services
- WebSocket state updates follow event-driven pattern
- Proper cleanup on connection termination

## Testing Requirements
- Unit tests for services and controllers
- Integration tests for Redis operations
- E2E tests for critical flows
- Mock external services (OpenAI, browser automation)

## Security
- Environment variables properly configured
- API endpoints properly authenticated
- WebSocket connections validated
- Redis access properly scoped

## Performance
- Async operations properly handled
- Memory leaks prevented in long-running processes
- Browser automation resources cleaned up
- Redis connections pooled appropriately
