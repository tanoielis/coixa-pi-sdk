# coixa-pi-sdk

A lightweight TypeScript/JavaScript SDK for interacting with the Pi Network blockchain, designed for wallet management and transaction operations. Part of the [Coixa Wallet](https://coixa.xyz) project.

## Features
- Generate and manage Pi wallets (mnemonic, public/secret keys)
- Send and receive Pi transactions
- Check account balances and activation status
- Activate new accounts (TESTNET only)
- Utility functions for mnemonic/seed management
- Custom error handling for wallet operations

## Installation

```bash
npm install coixa-pi-sdk
```

## Quick Start

```typescript
import { PiWallet } from 'coixa-pi-sdk';

// Generate a new wallet
const wallet = PiWallet.generate();
console.log('Mnemonic:', wallet.mnemonic);
console.log('Public Key:', wallet.publicKey);

// Load an existing wallet from mnemonic
const existingWallet = PiWallet.fromMnemonic('your mnemonic here');

// Check balance
await existingWallet.loadAccount();
console.log('Balance:', existingWallet.balance);

// Send Pi
await existingWallet.sendTransaction('DEST_PUBLIC_KEY', '1.5', 'Optional memo');
```

## API Overview

### PiWallet
- `constructor(mnemonic?: string, network?: PiNetwork)`
- `static generate(): PiWallet`
- `static fromMnemonic(mnemonic: string, network?: PiNetwork): PiWallet`
- `static fromSeed(seed: Uint8Array, network?: PiNetwork): PiWallet`
- `public async loadAccount()`
- `public async payments(limit?: number)`
- `public async sendTransaction(destPublicKey: string, amount: string, memo?: string)`
- `public async activateAccount(destPublicKey: string)`

### PiApi
- `public async sendTransaction(sourceSecret: string, destPublicKey: string, amount: string, memo?: string)`
- `public async payments(publicKey: string, limit?: number)`
- `public async isAccountActivated(publicKey: string)`
- `public async activateAccount(sourceSecret: string, publicKey: string, startingBalance?: number)`

### WalletUtils
- `static generateMnemonic(strength?: 128 | 256): string`
- `static validateMnemonic(mnemonic: string): boolean`
- `static mnemonicToSeed(mnemonic: string): Buffer`

### Errors
- `InvalidMnemonicError`
- `WalletDerivationError`

## Links
- [Coixa Wallet](https://coixa.xyz)

## License
MIT
