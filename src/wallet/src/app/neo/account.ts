import { wallet } from '@cityofzion/neon-core/';
import { enc } from 'crypto-js';
import AES from 'crypto-js/aes';
import { DigitalMEError } from "./DigitalMEError";
import { IClaim } from "./interfaces/IClaim";

/**
 * Seraph ID account as JSON.
 * Accounts with their claims inside in this form are encrypted.
 */
export interface IDigitalMEAccountJSON extends wallet.AccountJSON {
  claims: string | undefined;
}

/**
 * Single DID account storing all claims issued for this DID.
 */
export class DigitalMEAccount extends wallet.Account {
  // DID Network key in extra's map.
  public static readonly DID_NETWORK = 'DIDnetwork';

  // The claims in this account.
  public claims: { [key: string]: IClaim };

  // The claims in encrypted form.
  private encryptedClaims?: string;

  // Indicates if the account is locked (true) or decrypted (false).
  private isLocked: boolean;

  /**
   * Default constructor.
   * @param str The account.
   * @param didNetwork DID network for which this account is used according to NEO DID definition (e.g. 'test' or 'main').
   */
  constructor(str: string | Partial<IDigitalMEAccountJSON> = '', didNetwork: string) {
    super(str);
    this.claims = {};
    this.isLocked = false;
    this.extra[DigitalMEAccount.DID_NETWORK] = didNetwork;

    if (typeof str === 'object' && !!str) {
      this.encryptedClaims = str.claims;
      this.isLocked = !!str.key;
    }
  }

  /**
   * Returns a DID of this account.
   * @returns DID of this account.
   */
  public getDID(): string {
    return `did:neoid:${this.extra[DigitalMEAccount.DID_NETWORK]}:${this.address}`;
  }

  /**
   * Adds a given claim to this account.
   * @param claim The claim to be added to this account.
   */
  public addClaim(claim: IClaim) {
    if (this.isLocked) {
      throw new DigitalMEError('Decrypt account before adding claims.');
    }
    if (!claim || !claim.id) {
      throw new DigitalMEError('This claim is invalid');
    }

    if (this.claims[claim.id]) {
      throw new DigitalMEError(`Claim with id ${claim.id} already exists`);
    }
    this.claims[claim.id] = claim;
  }

  /**
   * Returns a claim of specified ID that is stored in this account.
   * @param claimId The claim ID as given by the issuer.
   */
  public getClaim(claimId: string): IClaim | undefined {
    if (this.isLocked) {
      throw new DigitalMEError('Decrypt account first');
    }

    return this.claims[claimId];
  }

  /**
   * Returns all claims stored in this account.
   * @returns All claims stored in this account or empty array.
   */
  public getAllClaims(): IClaim[] {
    if (this.isLocked) {
      throw new DigitalMEError('Decrypt account first');
    }

    return Object.values(this.claims) || [];
  }

  /**
   * Exports the account.
   * Account must be encrypted upfront or it will fail.
   * @returns Exported account.
   */
  public export(): IDigitalMEAccountJSON {
    if (!this.encryptedClaims) {
      throw new DigitalMEError('Encrypt account before exporting it.');
    }

    const acc = super.export() as IDigitalMEAccountJSON;
    acc.claims = this.encryptedClaims;

    return acc;
  }

  /**
   * Encrypts the contents of this account.
   * @param keyphrase Encryption password.
   * @param scryptParams Script parameters.
   * @return This account with encrypted claims.
   */
  public async encrypt(keyphrase: string, scryptParams?: wallet.ScryptParams | undefined): Promise<this> {
    const acc = await super.encrypt(keyphrase, scryptParams);

    acc.encryptedClaims = AES.encrypt(JSON.stringify(this.claims), keyphrase).toString();

    return acc;
  }

  /**
   * Decrypts the claims in this account.
   * @param keyphrase Decryption password.
   * @param scryptParams Script parameters.
   * @returns This account with decrypted claims.
   */
  public async decrypt(keyphrase: string, scryptParams?: wallet.ScryptParams | undefined): Promise<this> {
    const acc = await super.decrypt(keyphrase, scryptParams);
    if (this.encryptedClaims) {
      const decryptedClaims = AES.decrypt(this.encryptedClaims, keyphrase).toString(enc.Utf8);
      acc.claims = JSON.parse(decryptedClaims, this.dateReviver);
    } else {
      acc.claims = {};
    }

    this.isLocked = false;

    return acc;
  }

  /**
   * Revives the given JSON string back into a date format.
   * @param key  Attribute key.
   * @param value Attribute value.
   */
  private dateReviver(key: string, value: any) {
    if (typeof value === 'string') {
      const a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
      if (a) {
        return new Date(value.toString());
      }
    }

    return value;
  }
}
