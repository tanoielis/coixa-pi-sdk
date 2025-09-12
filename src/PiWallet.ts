import * as ed25519 from "micro-key-producer/slip10.js";
import { Horizon, Keypair } from "@stellar/stellar-sdk";
import { WalletUtils } from "./WalletUtils";
import { InvalidMnemonicError, WalletDerivationError } from "./errors";
import { PiApi, type PiNetwork, type PiTx } from "./PiApi";

const DERIVATION_PATH = "m/44'/314159'/0'";

export class PiWallet extends PiApi {
  public mnemonic: string | undefined;
  public seed: Uint8Array<ArrayBufferLike> | undefined;
  public publicKey: string;
  public secretKey: string;
  public balance: number | undefined;
  public account: Horizon.AccountResponse | null = null;
  public IS_ACTIVATED = true;

  private constructor(
    publicKey: string,
    secretKey: string,
    network?: PiNetwork,
    mnemonic?: string,
    seed?: Uint8Array<ArrayBufferLike>
  ) {
    super(network);
    this.publicKey = publicKey;
    this.secretKey = secretKey;
    this.mnemonic = mnemonic;
    this.seed = seed;
  }
  /**
   *
   * @param mnemonic The secret passphrase
   * @returns new PiWallet instance
   */
  static fromMnemonic(mnemonic: string, network?: PiNetwork): PiWallet {
    if (!WalletUtils.validateMnemonic(mnemonic)) {
      throw new InvalidMnemonicError();
    }
    const seed = WalletUtils.mnemonicToSeed(mnemonic);
    const hdKey = ed25519.HDKey.fromMasterSeed(seed).derive(DERIVATION_PATH);

    if (!hdKey?.privateKey) throw new WalletDerivationError();

    const keypair = Keypair.fromRawEd25519Seed(Buffer.from(hdKey.privateKey));

    return new PiWallet(
      keypair.publicKey(),
      keypair.secret(),
      network,
      mnemonic,
      seed
    );
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

    if (!hdKey?.privateKey) throw new WalletDerivationError();

    const keypair = Keypair.fromRawEd25519Seed(Buffer.from(hdKey.privateKey));

    return new PiWallet(
      keypair.publicKey(),
      keypair.secret(),
      network,
      undefined,
      seed
    );
  }

  /**
   * Create a PiWallet from an existing secret key (S...)
   * @param secretKey The Stellar/Pi secret key
   * @param network Pi network type
   */
  static fromSecret(secretKey: string, network?: PiNetwork): PiWallet {
    try {
      const keypair = Keypair.fromSecret(secretKey);
      return new PiWallet(keypair.publicKey(), keypair.secret(), network);
    } catch (err: any) {
      throw new Error(`Invalid secret key: ${err.message || err}`);
    }
  }

  /**
   * Generate a new Pi network compatible wallet
   * @returns new PiWallet instance
   */
  static generate(network?: PiNetwork): PiWallet {
    const mnemonic = WalletUtils.generateMnemonic();
    return PiWallet.fromMnemonic(mnemonic, network);
  }

  public async loadAccount() {
    try {
      const account = await this.server.loadAccount(this.publicKey);
      this.account = account;
      this.balance =
        parseFloat(
          account.balances.find((b) => b.asset_type === "native")?.balance ??
            "0"
        ) - 1; // Adjust for minimum balance requirement
      return account;
    } catch (err: any) {
      if (err.response?.status == 404) {
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
