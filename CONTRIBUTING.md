# Contributing to RenVault

## Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/sanmipaul/RenVault
cd RenVault
```

2. **Install Clarinet**
```bash
npm install -g @hirosystems/clarinet
```

3. **Install dependencies**
```bash
npm install
cd frontend && npm install
```

4. **Run tests**
```bash
clarinet test
```

## Project Structure

```
RenVault/
├── contracts/          # Clarity smart contracts
├── frontend/          # React frontend application
├── scripts/           # Deployment and utility scripts
├── tests/            # Contract test suites
└── docs/             # Documentation
```

## Making Changes

### Smart Contracts

1. Edit contracts in `contracts/`
2. Run `clarinet check` to validate syntax
3. Add tests in `tests/`
4. Run `clarinet test` to verify functionality

### Frontend

1. Navigate to `frontend/`
2. Make changes to React components
3. Test locally with `npm start`
4. Build with `npm run build`

### Documentation

1. Update relevant `.md` files
2. Ensure examples are accurate
3. Test any code snippets

## Pull Request Process

1. **Create a branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**
- Follow existing code style
- Add tests for new functionality
- Update documentation

3. **Test thoroughly**
```bash
clarinet test
cd frontend && npm test
```

4. **Commit with clear messages**
```bash
git commit -m "feat: add new feature description"
```

5. **Push and create PR**
```bash
git push origin feature/your-feature-name
```

## Code Style

### Clarity Contracts
- Use descriptive function names
- Add comprehensive error handling
- Include inline comments for complex logic
- Follow Clarity naming conventions

### JavaScript/React
- Use ES6+ features
- Follow React best practices
- Add PropTypes or TypeScript types
- Use meaningful variable names

## Testing

### Contract Tests
- Test all public functions
- Include edge cases and error conditions
- Verify state changes
- Test access controls

### Frontend Tests
- Test component rendering
- Test user interactions
- Mock contract calls
- Test error handling

## Issue Reporting

When reporting issues:
1. Use the issue template
2. Include steps to reproduce
3. Provide error messages
4. Specify environment details

## Feature Requests

For new features:
1. Describe the use case
2. Explain the expected behavior
3. Consider implementation complexity
4. Discuss potential alternatives