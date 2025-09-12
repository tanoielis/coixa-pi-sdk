import {
  TransactionBuilder,
  Operation,
  Keypair,
  Asset,
  Horizon,
  Memo,
} from "@stellar/stellar-sdk";

export const PiNetwork = {
  MAINNET: "mainnet",
  TESTNET: "testnet",
} as const;
export type PiNetwork = (typeof PiNetwork)[keyof typeof PiNetwork];

const HORIZON_ENDPOINTS = {
  [PiNetwork.MAINNET]: "https://api.mainnet.minepi.com",
  [PiNetwork.TESTNET]: "https://api.testnet.minepi.com",
};

const NETWORK_PASSPHRASES = {
  [PiNetwork.MAINNET]: "Pi Network",
  [PiNetwork.TESTNET]: "Pi Testnet",
};

export type PiTx =
  | Horizon.ServerApi.CreateAccountOperationRecord
  | Horizon.ServerApi.PaymentOperationRecord
  | Horizon.ServerApi.PathPaymentOperationRecord
  | Horizon.ServerApi.AccountMergeOperationRecord
  | Horizon.ServerApi.PathPaymentStrictSendOperationRecord
  | Horizon.ServerApi.InvokeHostFunctionOperationRecord;

export class PiApi {
  private horizonUrl: string;
  private networkPassphrase: string;
  public server: Horizon.Server;
  public network: PiNetwork;

  constructor(network: PiNetwork = PiNetwork.TESTNET) {
    // this.network = network;
    this.networkPassphrase = NETWORK_PASSPHRASES[network];
    this.horizonUrl = HORIZON_ENDPOINTS[network];
    this.server = new Horizon.Server(this.horizonUrl);
    this.network = network;
  }

  /**
   *
   * @param sourceSecret
   * @param destPublicKey
   * @param amount
   * @param memo
   * @returns
   */
  public async sendTransaction(
    sourceSecret: string,
    destPublicKey: string,
    amount: string,
    memo?: string
  ) {
    const sourceKeypair = Keypair.fromSecret(sourceSecret);
    const sourcePublicKey = sourceKeypair.publicKey();

    try {
      const account = await this.server.loadAccount(sourcePublicKey);
      const fee = await this.server.fetchBaseFee();
      console.log(account, fee);
      const _memo = memo ? Memo.text(memo) : undefined;

      const transaction = new TransactionBuilder(account, {
        networkPassphrase: this.networkPassphrase,
        fee: fee.toString(),
        memo: _memo,
      })
        .addOperation(
          Operation.payment({
            destination: destPublicKey,
            asset: Asset.native(),
            amount,
          })
        )
        .setTimeout(40)
        .build();
      transaction.sign(sourceKeypair);
      const response = await this.server.submitTransaction(transaction);
      console.log(response);
      return response;
    } catch (error: any) {
      console.log(error);
      if (error.response && error.response.status === 400) {
        throw new Error(`Transaction failed: ${error.response.data.details}`);
      }
      throw new Error(`Failed to send transaction: ${error.message}`);
    }
  }

  public async payments(publicKey: string, limit: number = 10) {
    return this.server
      .payments()
      .forAccount(publicKey)
      .limit(limit)
      .order("desc")
      .call();
  }

  public async isAccountActivated(publicKey: string): Promise<boolean> {
    try {
      await this.server.loadAccount(publicKey);
      // If the account exists, it is activated
      return true;
    } catch (err: any) {
      // If the account does not exist, it is not activated
      if (err.response && err.response.status === 404) {
        return false;
      }
      // For other errors, we can assume the account is not activated
      console.error("Error checking account activation:", err);
      throw new Error(`Failed to check account activation: ${err.message}`);
    }
  }
  /**
   * Activate a new wallet by creating an account with a starting balance
   * @param sourceSecret The secret key of the source account that will fund the new wallet
   * @param publicKey The public key of the new wallet to be activated
   * @param startingBalance The initial balance to set for the new wallet, default is 1 Pi
   * @throws Will throw an error if the activation fails
   * @returns The response from the server after submitting the transaction
   */
  public async activateAccount(
    sourceSecret: string,
    publicKey: string,
    startingBalance: number = 1
  ) {
    const sourceKeypair = Keypair.fromSecret(sourceSecret);
    const sourcePublicKey = sourceKeypair.publicKey();
    const isActivated = await this.isAccountActivated(publicKey);
    if (isActivated) {
      throw new Error("Account is already activated");
    }
    try {
      const account = await this.server.loadAccount(sourcePublicKey);
      const fee = await this.server.fetchBaseFee();
      const transaction = new TransactionBuilder(account, {
        networkPassphrase: this.networkPassphrase,
        fee: fee.toString(),
      })
        .addOperation(
          Operation.createAccount({
            destination: publicKey,
            startingBalance: startingBalance.toString(),
          })
        )
        .setTimeout(40)
        .build();
      transaction.sign(sourceKeypair);
      const response = await this.server.submitTransaction(transaction);
      console.log("Activation response:", response);
      return response;
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.status === 400) {
        throw new Error(`Activation failed: ${err.response.data.details}`);
      }
      throw new Error(`Failed to activate wallet: ${err.message}`);
    }
  }
}
