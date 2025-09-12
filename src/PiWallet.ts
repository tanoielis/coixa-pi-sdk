import * as ed25519 from "micro-key-producer/slip10.js";
import { Horizon, Keypair } from "@stellar/stellar-sdk";
import { WalletUtils } from "./WalletUtils";
import { InvalidMnemonicError, WalletDerivationError } from "./errors";
import { PiApi, type PiNetwork, type PiTx } from "./PiApi";

const DERIVATION_PATH = "m/44'/314159'/0'";

export class PiWallet extends PiApi {
  public mnemonic: string;
  public publicKey: string;
  public secretKey: string;
  public balance: number | undefined;
  public account: Horizon.AccountResponse | null;
  public IS_ACTIVATED = true;

  constructor(mnemonic?: string, network?: PiNetwork) {
    super(network);
    if (mnemonic) {
      if (!WalletUtils.validateMnemonic(mnemonic)) {
        throw new InvalidMnemonicError();
      }
      this.mnemonic = mnemonic;
    } else {
      this.mnemonic = WalletUtils.generateMnemonic();
    }

    const seed = WalletUtils.mnemonicToSeed(this.mnemonic);
    const hdKey = ed25519.HDKey.fromMasterSeed(seed).derive(DERIVATION_PATH);

    if (!hdKey || !hdKey.privateKey) {
      throw new WalletDerivationError();
    }

    const keypair = Keypair.fromRawEd25519Seed(Buffer.from(hdKey.privateKey));

    this.publicKey = keypair.publicKey();
    this.secretKey = keypair.secret();
    let account = null;
    let balance;
    this.loadAccount().then((res) => {
      this.account = res;
      balance = parseFloat(
        this.account?.balances.find((b) => b.asset_type === "native")
          ?.balance ?? ""
      );
      /**
       * Pi network requires a minimum balance of 1 Pi.
       * This is a placeholder to ensure the balance is at least 1 Pi.
       */
      balance -= 1;
    });
    this.account = account;
    this.balance = balance;
  }
  /**
   *
   * @param mnemonic The secret passphrase
   * @returns new PiWallet instance
   */
  static fromMnemonic(mnemonic: string, network?: PiNetwork): PiWallet {
    return new PiWallet(mnemonic, network);
  }

  /**
   * Create a PiWallet from a raw seed (Buffer or Uint8Array)
   * @param seed The raw seed bytes
   * @param network Pi network type
   */
  static fromSeed(
    seed: Uint8Array<ArrayBufferLike>,
    network?: PiNetwork
  ): PiWallet {
    const hdKey = ed25519.HDKey.fromMasterSeed(seed).derive(DERIVATION_PATH);

    if (!hdKey || !hdKey.privateKey) {
      throw new WalletDerivationError();
    }

    const keypair = Keypair.fromRawEd25519Seed(Buffer.from(hdKey.privateKey));

    const wallet = new PiWallet(undefined, network);
    wallet.mnemonic = ""; // no mnemonic available
    wallet.publicKey = keypair.publicKey();
    wallet.secretKey = keypair.secret();

    return wallet;
  }

  /**
   * Generate a new Pi network compatible wallet
   * @returns new PiWallet instance
   */
  static generate(): PiWallet {
    return new PiWallet();
  }

  public async loadAccount() {
    try {
      let account = await this.server.loadAccount(this.publicKey);
      this.balance = parseFloat(
        account.balances.find((b) => b.asset_type === "native")?.balance ?? ""
      );
      this.balance -= 1; // Adjust for minimum balance requirement
      return this.account;
    } catch (err: any) {
      console.log(err.response);
      if (err.response?.status == 404) {
        // Account does not exist, create a new one
        this.IS_ACTIVATED = false;
      }
      throw new Error(
        `Failed to load account: ${err.message || "Unknown error"}`
      );
    }
  }

  public async payments(): Promise<Horizon.ServerApi.CollectionPage<PiTx>>;
  public async payments(
    limit?: number
  ): Promise<Horizon.ServerApi.CollectionPage<PiTx>>;
  public async payments(limit: number = 10) {
    return super.payments(this.publicKey, limit);
  }

  public async requestAirdrop() {
    // return this.server.
  }
  /**
   * sendTransaction
   */
  public sendTransaction(destPublickey: string, amount: string, memo?: string) {
    return super.sendTransaction(this.secretKey, destPublickey, amount, memo);
  }

  public async activateAccount(destPublicKey: string) {
    return super.activateAccount(this.secretKey, destPublicKey);
  }
}
