
# RenVault

### A Clarity 4–Powered Micro-Savings & Reputation Protocol on Stacks

RenVault is a decentralized micro-savings vault built on the Stacks blockchain using Clarity 4. It enables users to securely deposit STX, earn commitment points, and withdraw funds at any time—while the protocol collects charges small fees. RenVault is built to be easy to interact with.

---

# Features

### Secure STX Vault

Users can deposit STX into a personal vault stored inside the smart contract.

### Commitment Points System

Every deposit increments a user’s “commitment score” using Clarity 4’s new arithmetic primitives.

### Protocol Fees

A small portion of each deposit goes to the contract owner.
This ensures on-chain fee activity, required for leaderboard recognition.

### Clarity 4 Functionality (Challenge Requirement)

RenVault uses multiple Clarity 4 enhancements:

* increment & decrement
* Typed maps (`(map (principal) uint)`)
* Safer asserts! & err handling
* Optional types in function returns
* Function-level type annotations
* Modern trait handling

### Public & Open Source

The repo is structured to maximize activity:

* /contracts
* /scripts
* /tests
* /docs
* Issues enabled
* PR templates

---

# Core Smart Contract Design

RenVault includes these core functions (all Clarity 4):

| Function              | Type      | Description                                                                               |
| --------------------- | --------- | ----------------------------------------------------------------------------------------- |
| deposit             | Public    | User deposits STX → vault balance increases → commitment score increments → fee collected |
| withdraw            | Public    | User withdraws their saved balance                                                        |
| get-balance         | Read-only | Returns user’s vault balance                                                              |
| get-points          | Read-only | Returns user’s commitment points                                                          |
| owner-withdraw-fees | Public    | Contract owner claims accumulated protocol fees                                           |
| get-fees-collected  | Read-only | Returns total protocol fees stored                                                        |

### Internal Logic

* 1% fee on deposit
* 99% saved to user vault
* Points recorded per user
* Fees locked until owner withdrawal

---

# Technical Architecture

### Smart Contract

* Built in Clarity 4
* Uses:

  * Typed data structures
  * Optional return values
  * Asset-transfer logic
  * Strict input validation

### Developer Tooling

* Clarinet for development & testing
* Husky hooks for formatting
* GitHub Actions for CI

---

# Project Structure

RenVault/
│
├── contracts/
│   └── ren-vault.clar
│
├── tests/
│   └── renvault_test.ts
│
├── scripts/
│   ├── deploy.js
│   └── interact.js
│
├── docs/
│   ├── architecture.md
│   └── contract-flow.md
│
├── .github/
│   ├── ISSUE_TEMPLATE.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
│       └── test.yml
│
└── README.md

---

# Installation & Setup

### 1. Install Clarinet

npm install -g @hirosystems/clarinet

### 2. Clone the Repository

git clone https://github.com/<your-username>/RenVault
cd RenVault

### 3. Run Tests

clarinet test

### 4. Start Clarinet Console

clarinet console

---

# Testing

Tests are written using Clarinet’s built-in testing system.

### Run All Tests

clarinet test

Tests cover:

* Deposits
* Fee calculation
* Withdrawals
* Commitment score increments
* Error cases
* Owner-only actions

---

---

# How Users Interact

1. Connect wallet
2. Deposit STX → vault updates
3. Commitment points increase
4. Check balance
5. Withdraw at any time
6. Owner withdraws fees

---

# Contributing

RenVault is fully open-source.

You can contribute by:

* Opening Issues
* Writing Documentation
* Adding UI Components
* Writing Tests
* Submitting PRs
* Proposing new features (e.g., NFT badges for point milestones)

PR and issue templates guide contributors through the process.

---

# Future Enhancements

Planned Roadmap:

* Web UI dashboard
* Leaderboard based on commitment points
* NFT reward tiers
* Social recovery vault access
* DAO treasury version
* Multi-chain support via sBTC

---

# License

MIT License — free to use, share, and modify.

---
