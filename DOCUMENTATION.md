# coixa-pi-sdk Documentation

A lightweight SDK for interacting with the Pi Network blockchain. Part of the [Coixa Wallet](https://coixa.xyz) project.

---

## Table of Contents
- [Introduction](#introduction)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
  - [PiWallet](#piwallet)
  - [PiApi](#piapi)
  - [WalletUtils](#walletutils)
  - [Errors](#errors)
- [Example Flows](#example-flows)
- [Links](#links)
- [License](#license)

---

## Introduction

`coixa-pi-sdk` is a TypeScript/JavaScript library for building Pi Network wallet applications. It provides tools for wallet generation, transaction management, and account operations, leveraging the Stellar SDK for Pi blockchain compatibility.

---

## Installation

```bash
npm install coixa-pi-sdk
```

---

## Getting Started

### Generate a New Wallet
```typescript
import { PiWallet } from 'coixa-pi-sdk';

const wallet = PiWallet.generate();
console.log('Mnemonic:', wallet.mnemonic);
console.log('Public Key:', wallet.publicKey);
```

### Load an Existing Wallet
```typescript
const wallet = PiWallet.fromMnemonic('your mnemonic here');
```

### Check Balance
```typescript
await wallet.loadAccount();
console.log('Balance:', wallet.balance);
```

### Send Pi
```typescript
await wallet.sendTransaction('DEST_PUBLIC_KEY', '1.5', 'Optional memo');
```

---

## API Reference

### PiWallet
The main wallet class. Extends `PiApi`.

#### Constructor
- `new PiWallet(mnemonic?: string, network?: PiNetwork)`
  - `mnemonic` (optional): BIP39 mnemonic phrase. If omitted, a new one is generated.
  - `network` (optional): `'mainnet'` or `'testnet'`. Default: `'testnet'`.

#### Static Methods
- `PiWallet.generate(): PiWallet` — Generate a new wallet with a random mnemonic.
- `PiWallet.fromMnemonic(mnemonic: string, network?: PiNetwork): PiWallet` — Load a wallet from a mnemonic.
- `PiWallet.fromSeed(seed: Uint8Array, network?: PiNetwork): PiWallet` — Load a wallet from a raw seed.

#### Instance Methods
- `async loadAccount()` — Loads account details and balance from the network.
- `async payments(limit?: number)` — Fetches recent payment operations (default: 10).
- `async sendTransaction(destPublicKey: string, amount: string, memo?: string)` — Sends Pi to another account.
- `async activateAccount(destPublicKey: string)` — Activates a new account (requires funding).

#### Properties
- `mnemonic: string` — Wallet mnemonic phrase.
- `publicKey: string` — Public key (address).
- `secretKey: string` — Secret key.
- `balance: number | undefined` — Account balance (after minimum Pi requirement).
- `IS_ACTIVATED: boolean` — Whether the account is activated.

---

### PiApi
Handles low-level Pi Network operations.

#### Constructor
- `new PiApi(network?: PiNetwork)`

#### Methods
- `async sendTransaction(sourceSecret: string, destPublicKey: string, amount: string, memo?: string)` — Send Pi from a source account.
- `async payments(publicKey: string, limit?: number)` — Fetch payment operations for an account.
- `async isAccountActivated(publicKey: string): Promise<boolean>` — Check if an account is activated.
- `async activateAccount(sourceSecret: string, publicKey: string, startingBalance?: number)` — Activate a new account with a starting balance (default: 1 Pi).

#### Properties
- `server: Horizon.Server` — Underlying Stellar server instance.
- `network: PiNetwork` — Network type.

---

### WalletUtils
Utility functions for mnemonic and seed management.

- `static generateMnemonic(strength?: 128 | 256): string` — Generate a BIP39 mnemonic.
- `static validateMnemonic(mnemonic: string): boolean` — Validate a mnemonic phrase.
- `static mnemonicToSeed(mnemonic: string): Buffer` — Convert mnemonic to seed.

---

### Errors
Custom error classes for wallet operations.

- `InvalidMnemonicError` — Thrown when a mnemonic is invalid.
- `WalletDerivationError` — Thrown when wallet derivation from seed fails.

---

## Example Flows

### 1. Create and Fund a New Wallet
```typescript
import { PiWallet } from 'coixa-pi-sdk';

// Generate a new wallet
const wallet = PiWallet.generate();
console.log('Public Key:', wallet.publicKey);

// Fund the wallet from another account (activation required)
// await wallet.activateAccount(wallet.publicKey); // Requires a source account with Pi
```

### 2. Send Pi to Another Account
```typescript
await wallet.sendTransaction('DEST_PUBLIC_KEY', '2.0', 'Payment for services');
```

### 3. Fetch Payment History
```typescript
const payments = await wallet.payments(5);
console.log(payments);
```

---

## Links
- [Coixa Wallet](https://coixa.xyz)

## License
MIT 