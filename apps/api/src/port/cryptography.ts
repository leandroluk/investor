// port/cryptography.ts
export abstract class Cryptography {
  /**
   * Encrypts the plainText using a default or provided IV.
   * @param plainText The string to be encrypted.
   * @param iv Optional Initialization Vector.
   */
  abstract encrypt(plainText: string, iv?: string): Promise<string>;

  /**
   * Decrypts the cipherText.
   * @param cipherText The string to be decrypted.
   */
  abstract decrypt(cipherText: string): Promise<string>;
}
