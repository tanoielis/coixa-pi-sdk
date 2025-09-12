export class InvalidMnemonicError extends Error {
  constructor(message = "The provided mnemonic is invalid.") {
    super(message);
    this.name = "InvalidMnemonicError";
  }
}

export class WalletDerivationError extends Error {
  constructor(message = "Failed to derive wallet from seed.") {
    super(message);
    this.name = "WalletDerivationError";
  }
}
