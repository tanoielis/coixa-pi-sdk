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

### Load an Existing Wallet from Mnemonic
```typescript
const wallet = PiWallet.fromMnemonic('your mnemonic here');
```

### Load a Wallet from a Raw Seed
```typescript
// const wallet = PiWallet.fromSeed(yourSeedUint8Array);
```

### Load a Wallet from a Secret Key
```typescript
const wallet = PiWallet.fromSecret('SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
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
The main wallet class. **Use static methods to create instances.**

#### Static Methods
- `PiWallet.generate(network?: PiNetwork): PiWallet` — Generate a new wallet with a random mnemonic.
- `PiWallet.fromMnemonic(mnemonic: string, network?: PiNetwork): PiWallet` — Load a wallet from a mnemonic.
- `PiWallet.fromSeed(seed: Uint8Array, network?: PiNetwork): PiWallet` — Load a wallet from a raw seed.
- `PiWallet.fromSecret(secretKey: string, network?: PiNetwork): PiWallet` — Load a wallet from a Stellar/Pi secret key.

#### Instance Methods
- `async loadAccount()` — Loads account details and balance from the network.
- `async payments(limit?: number)` — Fetches recent payment operations (default: 10).
- `sendTransaction(destPublicKey: string, amount: string, memo?: string)` — Sends Pi to another account.
- `async activateAccount(destPublicKey: string)` — Activates a new account (TESTNET only; requires funding).

#### Properties
- `mnemonic?: string` — Wallet mnemonic phrase (undefined if created from secret)
- `seed?: Uint8Array` — Wallet seed (undefined if created from secret)
- `publicKey: string` — Public key (address)
- `secretKey: string` — Secret key
- `balance: number | undefined` — Account balance (after minimum Pi requirement)
- `IS_ACTIVATED: boolean` — Whether the account is activated

---

### PiApi
Handles low-level Pi Network operations.

#### Constructor
- `new PiApi(network?: PiNetwork)`

#### Methods
- `async sendTransaction(sourceSecret: string, destPublicKey: string, amount: string, memo?: string)` — Send Pi from a source account.
- `async payments(publicKey: string, limit?: number)` — Fetch payment operations for an account.
- `async isAccountActivated(publicKey: string): Promise<boolean>` — Check if an account is activated.
- `async activateAccount(sourceSecret: string, publicKey: string, startingBalance?: number)` — Activate a new account with a starting balance (default: 1 Pi; TESTNET only).

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

### 1. Create and Fund a New Wallet (TESTNET only)
```typescript
import { PiWallet } from 'coixa-pi-sdk';

// Generate a new wallet
const wallet = PiWallet.generate();
console.log('Public Key:', wallet.publicKey);

// Fund the wallet from another account (activation required, TESTNET only)
// await wallet.activateAccount(wallet.publicKey); // Requires a source account with Pi
```

### 2. Load a Wallet from a Secret Key
```typescript
const wallet = PiWallet.fromSecret('SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
```

### 3. Send Pi to Another Account
```typescript
await wallet.sendTransaction('DEST_PUBLIC_KEY', '2.0', 'Payment for services');
```

### 4. Fetch Payment History
```typescript
const payments = await wallet.payments(5);
console.log(payments);
```

---

## Links
- [Coixa Wallet](https://coixa.xyz)

## License
MIT 