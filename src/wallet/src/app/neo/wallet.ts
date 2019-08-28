import { wallet } from '@cityofzion/neon-core';
import { IClaim } from './DigitalME';
import { IDigitalMEAccountJSON, DigitalMEAccount } from './account';
import { DigitalMEError } from "./DigitalMEError";

/**
 * DigitalME wallet as JSON.
 * Wallet in this form can be saved to a file or exported and imported later.
 * All claims inside are encrypted.
 */
export interface IDigitalMEWalletJSON extends wallet.WalletJSON {
  accounts: IDigitalMEAccountJSON[];
  didMap: { [did: string]: number };
}

/**
 * Wallet to store private keys and claims according to NEP-2 and NEP-9 respectively.
 */
export class DigitalMEWallet extends wallet.Wallet {
  // Array of accounts in the wallet.
  public accounts: DigitalMEAccount[];

  // Map from did to account index.
  public didMap: { [did: string]: number };

  /**
   * Default constructor.
   * @param obj Partial importable wallet.
   */
  constructor(obj: Partial<IDigitalMEWalletJSON>) {
    const tmpAccounts = obj.accounts || [];
    obj.accounts = undefined;
    super(obj);
    this.accounts = [];
    this.didMap = {};

    for (const acc of tmpAccounts) {
      this.addAccount(acc);
    }
  }

  /**
   * Adds a new account to this wallet.
   * @param acct The account to be added.
   * @param didNetwork DID network for which this account is used according to NEO DID definition (e.g. 'test' or 'main').
   * @returns The index of added account in the wallet.
   */
  public addDIDAccount(acct: DigitalMEAccount | IDigitalMEAccountJSON, didNetwork: string): number {
    const index = this.accounts.length;
    if (!(acct instanceof DigitalMEAccount)) {
      acct = new DigitalMEAccount(acct, didNetwork);
    }

    this.accounts.push(acct);
    const did = this.getDID(index);

    if (did) {
      this.didMap[did] = index;
    }

    return index;
  }

  /**
   * Adds a new account to this wallet.
   * @param acct The account to be added.
   * @returns The index of added account in the wallet.
   */
  public addAccount(acct: DigitalMEAccount | IDigitalMEAccountJSON): number {
    if (!acct.extra || !acct.extra[DigitalMEAccount.DID_NETWORK]) {
      throw new DigitalMEError('DID network is not defined, please use addDIDAccount with specific DID network name');
    }

    return this.addDIDAccount(acct, acct.extra[DigitalMEAccount.DID_NETWORK]);
  }

  /**
   * Adds a claim to the wallet.
   * @param claim The claim to be added to the wallet.
   */
  public addClaim(claim: IClaim) {
    const acc = this.accounts[this.didMap[claim.ownerDID]];
    if (!acc) {
      throw new DigitalMEError(`DID account ${claim.ownerDID} is not a part of this wallet. Add account first.`);
    }

    acc.addClaim(claim);
  }

  /**
   * Returns a claim given a claim id.
   * @param claimId ID of the claim as given by the issuer.
   * @returns The claim if exists, undefined otherwise.
   */
  public getClaim(claimId: string): IClaim | undefined {
    for (const acc of this.accounts) {
      if (acc.getClaim(claimId)) {
        return acc.getClaim(claimId);
      }
    }
  }

  /**
   * Returns all the claims stored in this wallet for the given DID.
   * @param did The DID.
   * @returns An array of all the claims for given DID.
   */
  public getAllClaims(did: string): IClaim[] {
    const account = this.getAccountByDID(did);
    if (account) {
      return account.getAllClaims();
    }

    return [];
  }

  /**
   * Creates a new keyPair and associated DID.
   * @returns The generated DID string.
   */
  public createDID(network: string): string {
    const privKey = wallet.generatePrivateKey();
    const acct = new DigitalMEAccount(privKey, network);
    this.addAccount(acct);

    return acct.getDID();
  }

  /**
   * Returns the DID for a given account index in the wallet.
   * @param index Index of the account to retrieve DID for.
   * @returns DID string if account exists, undefined otherwise.
   */
  public getDID(index: number): string | undefined {
    if (this.accounts[index]) {
      return this.accounts[index].getDID();
    }
  }

  /**
   * Returns the account associated with the given DID.
   * @param did The DID of the account to retrieve.
   * @returns Account associated with the DID.
   */
  public getAccountByDID(did: string): DigitalMEAccount | undefined {
    const idx = this.didMap[did];

    if (idx !== undefined && this.accounts.length > idx) {
      return this.accounts[idx];
    }
  }

  /**
   * Returns an array of DIDs held in this wallet.
   * @returns An array of DIDs held in this wallet.
   */
  public getAllDIDs(): string[] {
    return Object.keys(this.didMap);
  }
}
