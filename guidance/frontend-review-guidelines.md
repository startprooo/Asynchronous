# Frontend Code Review Guidelines

## Architecture
- Follow Next.js 14+ App Router conventions
- Keep components properly separated by concern
- Maintain clear UI component hierarchy
- Use proper state management patterns

## Component Structure
- Components use TypeScript props interfaces
- UI components are in `components/ui/`
- Page components follow App Router structure
- Proper use of client/server components

## State Management
- WebSocket connections properly managed
- Real-time updates correctly propagated
- Form state properly controlled
- Loading states handled appropriately

## Styling
- Follow Tailwind CSS class ordering:
  1. Layout
  2. Spacing
  3. Typography
  4. Visual
- Use proper responsive design patterns
- Maintain consistent color scheme
- Follow accessibility guidelines

## Performance
- Images properly optimized
- Components properly memoized
- Route handlers implemented efficiently
- Client-side caching utilized

## Real-time Features
- WebSocket reconnection logic implemented
- Message queue handling for offline state
- Proper error state management
- Loading states for real-time updates

## Testing
- Components have unit tests
- Integration tests for data flow
- E2E tests for critical paths
- Proper mocking of WebSocket/API

## Accessibility
- ARIA labels properly implemented
- Keyboard navigation supported
- Color contrast requirements met
- Screen reader compatibility

## Code Quality
- Props properly typed
- Event handlers properly typed
- Avoid prop drilling
- Follow React hooks best practices
