import crypto from 'crypto';
import { config } from '../config.js';

export class CryptoVault {
    /**
     * Signs a payload using HMAC SHA-256 with the MASTER_KEY.
     */
    static signData(payload: string): string {
        if (!config.masterKey) {
            console.warn('[CryptoVault] WARNING: MASTER_KEY is not set. Cryptographic signing is bypassed.');
            return '';
        }
        const hmac = crypto.createHmac('sha256', config.masterKey);
        hmac.update(payload);
        return hmac.digest('hex');
    }

    /**
     * Verifies the cryptographic signature of a payload.
     * Uses timingSafeEqual to prevent timing attacks.
     */
    static verifySignature(payload: string, signature: string | null): boolean {
        if (!config.masterKey) return true; // Bypass if master key is empty
        if (!signature) return false; // Requires signature if master key is set

        const expected = this.signData(payload);
        try {
            return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
        } catch (error) {
            return false; // Length mismatch or invalid hex
        }
    }
}
