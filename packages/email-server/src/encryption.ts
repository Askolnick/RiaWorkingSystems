import * as openpgp from 'openpgp';
import type { EmailEncryption } from './types';

export class OpenPGPEncryption implements EmailEncryption {
  async generateKeyPair(
    name: string,
    email: string,
    passphrase?: string
  ): Promise<{ publicKey: string; privateKey: string }> {
    try {
      const { privateKey, publicKey } = await openpgp.generateKey({
        type: 'ecc',
        curve: 'curve25519',
        userIDs: [{ name, email }],
        passphrase,
        format: 'armored',
      });

      return {
        publicKey: publicKey as string,
        privateKey: privateKey as string,
      };
    } catch (error) {
      throw new Error(`Failed to generate key pair: ${error}`);
    }
  }

  async encrypt(message: string, publicKeys: string[]): Promise<string> {
    try {
      const publicKeyObjects = await Promise.all(
        publicKeys.map(key => openpgp.readKey({ armoredKey: key }))
      );

      const encrypted = await openpgp.encrypt({
        message: await openpgp.createMessage({ text: message }),
        encryptionKeys: publicKeyObjects,
        format: 'armored',
      });

      return encrypted as string;
    } catch (error) {
      throw new Error(`Failed to encrypt message: ${error}`);
    }
  }

  async decrypt(
    encryptedMessage: string,
    privateKey: string,
    passphrase?: string
  ): Promise<string> {
    try {
      const privateKeyObject = await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({ armoredKey: privateKey }),
        passphrase,
      });

      const message = await openpgp.readMessage({
        armoredMessage: encryptedMessage,
      });

      const { data: decrypted } = await openpgp.decrypt({
        message,
        decryptionKeys: privateKeyObject,
        format: 'utf8',
      });

      return decrypted as string;
    } catch (error) {
      throw new Error(`Failed to decrypt message: ${error}`);
    }
  }

  async sign(
    message: string,
    privateKey: string,
    passphrase?: string
  ): Promise<string> {
    try {
      const privateKeyObject = await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({ armoredKey: privateKey }),
        passphrase,
      });

      const signed = await openpgp.sign({
        message: await openpgp.createMessage({ text: message }),
        signingKeys: privateKeyObject,
        format: 'armored',
      });

      return signed as string;
    } catch (error) {
      throw new Error(`Failed to sign message: ${error}`);
    }
  }

  async verify(
    signedMessage: string,
    publicKey: string
  ): Promise<{ valid: boolean; message: string }> {
    try {
      const publicKeyObject = await openpgp.readKey({ armoredKey: publicKey });

      const message = await openpgp.readMessage({
        armoredMessage: signedMessage,
      });

      const verificationResult = await openpgp.verify({
        message,
        verificationKeys: publicKeyObject,
        format: 'utf8',
      });

      const { verified } = verificationResult.signatures[0];
      const valid = await verified;

      return {
        valid: !!valid,
        message: verificationResult.data as string,
      };
    } catch (error) {
      throw new Error(`Failed to verify message: ${error}`);
    }
  }

  // Helper methods for email-specific encryption
  async encryptEmail(
    content: { text?: string; html?: string },
    recipientKeys: string[]
  ): Promise<{ text?: string; html?: string }> {
    const result: { text?: string; html?: string } = {};

    if (content.text) {
      result.text = await this.encrypt(content.text, recipientKeys);
    }

    if (content.html) {
      result.html = await this.encrypt(content.html, recipientKeys);
    }

    return result;
  }

  async decryptEmail(
    encryptedContent: { text?: string; html?: string },
    privateKey: string,
    passphrase?: string
  ): Promise<{ text?: string; html?: string }> {
    const result: { text?: string; html?: string } = {};

    if (encryptedContent.text) {
      try {
        result.text = await this.decrypt(encryptedContent.text, privateKey, passphrase);
      } catch (error) {
        console.warn('Failed to decrypt text content:', error);
      }
    }

    if (encryptedContent.html) {
      try {
        result.html = await this.decrypt(encryptedContent.html, privateKey, passphrase);
      } catch (error) {
        console.warn('Failed to decrypt HTML content:', error);
      }
    }

    return result;
  }

  async signEmail(
    content: { text?: string; html?: string },
    privateKey: string,
    passphrase?: string
  ): Promise<{ text?: string; html?: string }> {
    const result: { text?: string; html?: string } = {};

    if (content.text) {
      result.text = await this.sign(content.text, privateKey, passphrase);
    }

    if (content.html) {
      result.html = await this.sign(content.html, privateKey, passphrase);
    }

    return result;
  }

  async verifyEmail(
    signedContent: { text?: string; html?: string },
    publicKey: string
  ): Promise<{ 
    text?: { valid: boolean; message: string };
    html?: { valid: boolean; message: string };
  }> {
    const result: {
      text?: { valid: boolean; message: string };
      html?: { valid: boolean; message: string };
    } = {};

    if (signedContent.text) {
      try {
        result.text = await this.verify(signedContent.text, publicKey);
      } catch (error) {
        result.text = { valid: false, message: signedContent.text };
        console.warn('Failed to verify text content:', error);
      }
    }

    if (signedContent.html) {
      try {
        result.html = await this.verify(signedContent.html, publicKey);
      } catch (error) {
        result.html = { valid: false, message: signedContent.html };
        console.warn('Failed to verify HTML content:', error);
      }
    }

    return result;
  }

  // Key management helpers
  async extractPublicKey(privateKey: string): Promise<string> {
    try {
      const privateKeyObject = await openpgp.readPrivateKey({ armoredKey: privateKey });
      const publicKey = privateKeyObject.toPublic();
      return publicKey.armor();
    } catch (error) {
      throw new Error(`Failed to extract public key: ${error}`);
    }
  }

  async getKeyInfo(key: string): Promise<{
    keyId: string;
    fingerprint: string;
    userIds: Array<{ name?: string; email?: string }>;
    algorithm: string;
    created: Date;
    expires?: Date;
  }> {
    try {
      const keyObject = await openpgp.readKey({ armoredKey: key });
      const primaryUser = await keyObject.getPrimaryUser();

      return {
        keyId: keyObject.getKeyID().toHex(),
        fingerprint: keyObject.getFingerprint(),
        userIds: keyObject.getUserIDs().map(userId => {
          const match = userId.match(/^(.*?)\s*<(.+?)>$/);
          if (match) {
            return { name: match[1].trim(), email: match[2] };
          }
          return { email: userId };
        }),
        algorithm: keyObject.getAlgorithmInfo().algorithm,
        created: keyObject.getCreationTime(),
        expires: keyObject.getExpirationTime(),
      };
    } catch (error) {
      throw new Error(`Failed to get key info: ${error}`);
    }
  }

  async isKeyExpired(key: string): Promise<boolean> {
    try {
      const keyInfo = await this.getKeyInfo(key);
      if (!keyInfo.expires) return false;
      return keyInfo.expires < new Date();
    } catch (error) {
      return true; // Treat invalid keys as expired
    }
  }

  async validateKeyPair(publicKey: string, privateKey: string, passphrase?: string): Promise<boolean> {
    try {
      // Test by signing with private key and verifying with public key
      const testMessage = 'test message for key validation';
      const signed = await this.sign(testMessage, privateKey, passphrase);
      const verified = await this.verify(signed, publicKey);
      return verified.valid && verified.message === testMessage;
    } catch (error) {
      return false;
    }
  }
}

// Sanitization utilities for email content
export function sanitizeHTML(html: string): string {
  // Basic HTML sanitization - in production, use DOMPurify
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>.*?<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

export function extractPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

// Factory function
export function createEncryption(): EmailEncryption {
  return new OpenPGPEncryption();
}