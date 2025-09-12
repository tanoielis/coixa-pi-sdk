export interface AccountDetails {
  account_id: string; // Unique identifier for the account
  sequence: string; // Sequence number for the account (important for tx signing)
  balance: string; // Current balance (Pi in this case, under 'native' asset type)
  signers: AccountSigner[]; // List of public keys associated with the account
}

export interface AccountSigner {
  weight: number; // Weight associated with the signer (used for multi-signatures)
  key: string; // Public key of the signer (ed25519 public key)
  type: "ed25519_public_key"; // Signer type (currently ed25519 public key for Pi)
}

// Example Account response:
export interface AccountResponse {
  id: string;
  account_id: string;
  sequence: string;
  balances: AccountBalance[];
  signers: AccountSigner[];
  flags: AccountFlags;
}

export interface AccountBalance {
  balance: string;
  asset_type: "native"; // You can extend it with other assets if needed in the future
}

export interface AccountFlags {
  auth_required: boolean;
  auth_revocable: boolean;
  auth_immutable: boolean;
  auth_clawback_enabled: boolean;
}

// Example of how you'd structure the Account data:

export type AccountInfo = Pick<
  AccountResponse,
  "account_id" | "sequence" | "balances" | "signers"
> & {
  balance: string;
};

export interface PiWallet {
  mnemonic: string;
  publicKey: string;
  secretKey: string;
  balance: number;
}
