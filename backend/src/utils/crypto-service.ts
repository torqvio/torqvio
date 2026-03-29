import crypto from 'crypto';
import { Logger } from './logger';

export class CryptoService {
  private logger: Logger;
  private algorithm: string = 'aes-256-gcm';
  private keyLength: number = 32;
  private ivLength: number = 16;
  private tagLength: number = 16;
  private secretKey: Buffer;

  constructor() {
    this.logger = new Logger('CryptoService');
    this.secretKey = this.getOrCreateSecretKey();
  }

  // Encryption
  encrypt(text: string): string {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipher(this.algorithm, this.secretKey);
      cipher.setAAD(Buffer.from('torqvio-integration', 'utf8'));
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      // Combine iv, encrypted data, and tag
      const combined = iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
      
      return combined;
    } catch (error) {
      this.logger.error('Encryption failed', { error });
      throw new Error('Encryption failed');
    }
  }

  decrypt(encryptedText: string): string {
    try {
      const parts = encryptedText.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const tag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const decipher = crypto.createDecipher(this.algorithm, this.secretKey);
      decipher.setAAD(Buffer.from('torqvio-integration', 'utf8'));
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      this.logger.error('Decryption failed', { error });
      throw new Error('Decryption failed');
    }
  }

  // Hashing
  hash(text: string, salt?: string): string {
    try {
      const actualSalt = salt || crypto.randomBytes(16).toString('hex');
      const hash = crypto.pbkdf2Sync(text, actualSalt, 10000, 64, 'sha512');
      return actualSalt + ':' + hash.toString('hex');
    } catch (error) {
      this.logger.error('Hashing failed', { error });
      throw new Error('Hashing failed');
    }
  }

  verifyHash(text: string, hashedText: string): boolean {
    try {
      const [salt, hash] = hashedText.split(':');
      const verifyHash = crypto.pbkdf2Sync(text, salt, 10000, 64, 'sha512');
      return hash === verifyHash.toString('hex');
    } catch (error) {
      this.logger.error('Hash verification failed', { error });
      return false;
    }
  }

  // Token Generation
  generateSecureToken(length: number = 32): string {
    try {
      return crypto.randomBytes(length).toString('hex');
    } catch (error) {
      this.logger.error('Token generation failed', { error });
      throw new Error('Token generation failed');
    }
  }

  generateApiKey(): { key: string; keyId: string } {
    try {
      const keyId = this.generateSecureToken(8);
      const keySecret = this.generateSecureToken(32);
      const combined = `tv_${keyId}_${keySecret}`;
      
      return {
        key: combined,
        keyId
      };
    } catch (error) {
      this.logger.error('API key generation failed', { error });
      throw new Error('API key generation failed');
    }
  }

  validateApiKey(apiKey: string): boolean {
    try {
      const pattern = /^tv_[a-f0-9]{16}_[a-f0-9]{64}$/;
      return pattern.test(apiKey);
    } catch (error) {
      this.logger.error('API key validation failed', { error });
      return false;
    }
  }

  // JWT Token Handling (simplified implementation)
  generateJWT(payload: any, expiresIn: string = '1h'): string {
    try {
      const header = {
        alg: 'HS256',
        typ: 'JWT'
      };

      const now = Math.floor(Date.now() / 1000);
      const exp = now + this.parseExpiration(expiresIn);
      
      const tokenPayload = {
        ...payload,
        iat: now,
        exp
      };

      const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
      const encodedPayload = this.base64UrlEncode(JSON.stringify(tokenPayload));
      
      const signature = crypto
        .createHmac('sha256', this.secretKey)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64url');

      return `${encodedHeader}.${encodedPayload}.${signature}`;
    } catch (error) {
      this.logger.error('JWT generation failed', { error });
      throw new Error('JWT generation failed');
    }
  }

  verifyJWT(token: string): any {
    try {
      const [header, payload, signature] = token.split('.');
      
      if (!header || !payload || !signature) {
        throw new Error('Invalid JWT format');
      }

      // Verify signature
      const expectedSignature = crypto
        .createHmac('sha256', this.secretKey)
        .update(`${header}.${payload}`)
        .digest('base64url');

      if (signature !== expectedSignature) {
        throw new Error('Invalid JWT signature');
      }

      // Decode payload
      const decodedPayload = JSON.parse(this.base64UrlDecode(payload));
      
      // Check expiration
      if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('JWT expired');
      }

      return decodedPayload;
    } catch (error) {
      this.logger.error('JWT verification failed', { error });
      throw new Error('JWT verification failed');
    }
  }

  // Webhook Signature Verification
  generateWebhookSignature(payload: string, secret: string): string {
    try {
      return crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
    } catch (error) {
      this.logger.error('Webhook signature generation failed', { error });
      throw new Error('Webhook signature generation failed');
    }
  }

  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    try {
      const expectedSignature = this.generateWebhookSignature(payload, secret);
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      this.logger.error('Webhook signature verification failed', { error });
      return false;
    }
  }

  // Data Masking
  maskSensitiveData(data: string, visibleChars: number = 4): string {
    try {
      if (data.length <= visibleChars) {
        return '*'.repeat(data.length);
      }
      
      const visible = data.substring(0, visibleChars);
      const masked = '*'.repeat(data.length - visibleChars);
      return visible + masked;
    } catch (error) {
      this.logger.error('Data masking failed', { error });
      return '*'.repeat(data.length);
    }
  }

  maskEmail(email: string): string {
    try {
      const [username, domain] = email.split('@');
      if (username.length <= 2) {
        return `${username[0]}*@${domain}`;
      }
      
      const visible = username.substring(0, 2);
      const masked = '*'.repeat(username.length - 2);
      return `${visible}${masked}@${domain}`;
    } catch (error) {
      this.logger.error('Email masking failed', { error });
      return '***@***.***';
    }
  }

  maskCreditCard(cardNumber: string): string {
    try {
      const cleaned = cardNumber.replace(/\s/g, '');
      if (cleaned.length < 4) {
        return '*'.repeat(cleaned.length);
      }
      
      const lastFour = cleaned.substring(cleaned.length - 4);
      const masked = '*'.repeat(cleaned.length - 4);
      return masked + lastFour;
    } catch (error) {
      this.logger.error('Credit card masking failed', { error });
      return '****';
    }
  }

  // Key Management
  rotateKey(): void {
    try {
      this.secretKey = crypto.randomBytes(this.keyLength);
      this.logger.info('Encryption key rotated');
    } catch (error) {
      this.logger.error('Key rotation failed', { error });
      throw new Error('Key rotation failed');
    }
  }

  // Utility Methods
  private getOrCreateSecretKey(): Buffer {
    try {
      // In production, this should come from a secure key management system
      const envKey = process.env.ENCRYPTION_KEY;
      
      if (envKey) {
        return Buffer.from(envKey, 'hex');
      }
      
      // Generate a new key for development/testing
      this.logger.warn('No encryption key found in environment, generating temporary key');
      return crypto.randomBytes(this.keyLength);
    } catch (error) {
      this.logger.error('Failed to get or create secret key', { error });
      throw new Error('Key initialization failed');
    }
  }

  private parseExpiration(expiresIn: string): number {
    const units: { [key: string]: number } = {
      's': 1,
      'm': 60,
      'h': 3600,
      'd': 86400,
      'w': 604800
    };

    const match = expiresIn.match(/^(\d+)([smhdw])$/);
    if (!match) {
      throw new Error('Invalid expiration format');
    }

    const [, amount, unit] = match;
    return parseInt(amount) * units[unit];
  }

  private base64UrlEncode(str: string): string {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private base64UrlDecode(str: string): string {
    str += '='.repeat((4 - str.length % 4) % 4);
    return Buffer.from(str.replace(/\-/g, '+').replace(/_/g, '/'), 'base64').toString();
  }

  // Security Utilities
  generatePassword(length: number = 16): string {
    try {
      const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
      let password = '';
      
      for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, charset.length);
        password += charset[randomIndex];
      }
      
      return password;
    } catch (error) {
      this.logger.error('Password generation failed', { error });
      throw new Error('Password generation failed');
    }
  }

  assessPasswordStrength(password: string): {
    score: number;
    feedback: string[];
    isStrong: boolean;
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Password should be at least 8 characters long');
    }

    if (password.length >= 12) {
      score += 1;
    }

    // Character variety checks
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include lowercase letters');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include uppercase letters');
    }

    if (/[0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include numbers');
    }

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include special characters');
    }

    // Common patterns
    if (!/(.)\1{2,}/.test(password)) {
      score += 1;
    } else {
      feedback.push('Avoid repeating characters');
    }

    const isStrong = score >= 6;

    return {
      score: Math.min(score, 7),
      feedback,
      isStrong
    };
  }

  // Rate Limiting Token Bucket
  createRateLimitTokenBucket(capacity: number, refillRate: number): {
    consume: (tokens: number) => boolean;
    available: () => number;
    reset: () => void;
  } {
    let tokens = capacity;
    let lastRefill = Date.now();

    const refill = () => {
      const now = Date.now();
      const timePassed = (now - lastRefill) / 1000;
      const tokensToAdd = timePassed * refillRate;
      
      tokens = Math.min(capacity, tokens + tokensToAdd);
      lastRefill = now;
    };

    return {
      consume: (tokensToConsume: number) => {
        refill();
        
        if (tokens >= tokensToConsume) {
          tokens -= tokensToConsume;
          return true;
        }
        
        return false;
      },
      
      available: () => {
        refill();
        return tokens;
      },
      
      reset: () => {
        tokens = capacity;
        lastRefill = Date.now();
      }
    };
  }

  // IP-based Security
  hashIP(ip: string): string {
    try {
      return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
    } catch (error) {
      this.logger.error('IP hashing failed', { error });
      return 'unknown';
    }
  }

  validateIP(ip: string): boolean {
    try {
      // Basic IPv4 validation
      const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      
      // Basic IPv6 validation (simplified)
      const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
      
      return ipv4Regex.test(ip) || ipv6Regex.test(ip);
    } catch (error) {
      this.logger.error('IP validation failed', { error });
      return false;
    }
  }

  // Secure Random Number Generation
  secureRandom(min: number, max: number): number {
    try {
      const range = max - min + 1;
      const bytes = crypto.randomBytes(4);
      const randomValue = bytes.readUInt32BE(0);
      return min + (randomValue % range);
    } catch (error) {
      this.logger.error('Secure random generation failed', { error });
      // Fallback to Math.random (less secure)
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }

  // Certificate utilities
  generateCertificateFingerprint(certificate: string): string {
    try {
      const cert = crypto.createCertificate(certificate);
      return cert.fingerprint256;
    } catch (error) {
      this.logger.error('Certificate fingerprint generation failed', { error });
      throw new Error('Certificate fingerprint generation failed');
    }
  }

  verifyCertificateChain(certificate: string, caCertificates: string[]): boolean {
    try {
      // This is a simplified implementation
      // In production, use proper certificate validation libraries
      const cert = crypto.createCertificate(certificate);
      
      // Basic validation checks
      if (!cert.subject || !cert.issuer) {
        return false;
      }

      // Check if certificate is expired
      const now = new Date();
      if (cert.validFrom && cert.validTo) {
        const validFrom = new Date(cert.validFrom);
        const validTo = new Date(cert.validTo);
        
        if (now < validFrom || now > validTo) {
          return false;
        }
      }

      return true;
    } catch (error) {
      this.logger.error('Certificate verification failed', { error });
      return false;
    }
  }
}
