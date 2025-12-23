# RenVault Test Suite

Comprehensive testing for the RenVault Clarity 4 protocol.

## Test Files

### Core Tests
- **ren-vault_test.ts** - Basic functionality tests
- **integration_test.ts** - Multi-user scenarios
- **edge_cases_test.ts** - Boundary condition testing

### Advanced Tests
- **performance_test.ts** - Batch operations and performance
- **security_test.ts** - Security vulnerability prevention
- **mock_data.ts** - Test constants and mock data

## Running Tests

```bash
# Run all tests
clarinet test

# Run specific test file
clarinet test --filter integration

# Run with coverage
clarinet test --coverage
```

## Test Categories

### Functionality Tests
- Deposit and withdrawal operations
- Fee calculation and collection
- Commitment points tracking
- Owner access controls

### Security Tests
- Reentrancy protection
- Access control validation
- Integer overflow prevention
- Balance manipulation checks

### Performance Tests
- Batch transaction processing
- Sequential operation handling
- Large amount processing

### Edge Cases
- Maximum/minimum values
- Boundary conditions
- Error scenarios

## Coverage Goals

- **Functions**: 100%
- **Branches**: 95%
- **Lines**: 98%