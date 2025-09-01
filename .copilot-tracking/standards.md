# Copilot Implementation Standards

## 1. File Organization

### Directory Structure
```
.copilot-tracking/
  ├── changes/       # Implementation change tracking
  ├── details/       # Task implementation details
  ├── plan-template.md
  └── details-template.md
```

### File Naming Conventions
- Changes files: `YYYYMMDD-task-description-changes.md`
- Details files: `task-description-details.md`
- Plan files: `task-description-plan.md`

## 2. Implementation Process

### Pre-Implementation
1. Review entire plan file and checklists
2. Read complete changes file
3. Understand task details from details/ folder
4. Verify workspace context and patterns

### During Implementation
1. Follow workspace patterns and conventions
2. Implement complete, working functionality
3. Include proper error handling
4. Add necessary documentation
5. Validate against requirements

### Post-Implementation 
1. Mark task complete in plan [x]
2. Update changes file
3. Document any divergences
4. Verify success criteria

## 3. Code Quality Standards

### General
- Follow TypeScript best practices
- Use consistent naming conventions
- Implement proper error handling
- Add JSDoc documentation for public APIs

### Frontend
- Follow Next.js patterns
- Use Tailwind CSS correctly
- Follow component structure
- Implement proper accessibility

### Backend
- Follow NestJS patterns
- Use dependency injection
- Implement proper validation
- Follow REST API standards

## 4. Testing Requirements

### Unit Tests
- Test individual components
- Mock external dependencies
- Verify edge cases
- Follow AAA pattern

### Integration Tests
- Test component interaction
- Verify end-to-end flows
- Test error scenarios

## 5. Documentation

### Code Comments
- Document complex logic
- Explain non-obvious decisions
- Use JSDoc for public APIs

### Change Tracking
- Update plan file progress
- Document in changes file
- Note any divergences
- Include release summary
