import { generateMnemonic, validateMnemonic, mnemonicToSeed } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";

export class WalletUtils {
  static generateMnemonic(strength: 128 | 256 = 256): string {
    return generateMnemonic(wordlist, strength);
  }

  static validateMnemonic(mnemonic: string): boolean {
    return validateMnemonic(mnemonic, wordlist);
  }

  static async mnemonicToSeed(mnemonic: string): Promise<Uint8Array> {
    return await mnemonicToSeed(mnemonic); // returns Uint8Array (Edge-safe)
  }
}
