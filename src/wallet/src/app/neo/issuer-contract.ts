import { tx } from '@cityofzion/neon-core';
import { rpc, sc } from '@cityofzion/neon-js';
import { DigitalMEError } from "./DigitalMEError";
import { DIDNetwork } from "./DIDNetwork";
import { IssuerOperation } from "./IssuerOperation";
import { ISchema } from "./interfaces/ISchema";
import { DigitalMEContractBase } from './contract-base';

/**
 * Direct communication interface with Seraph ID smart contract of the Issuer.
 */
export class DigitalMEIssuerContract extends DigitalMEContractBase {
  /**
   * Default constructor.
   * @param scriptHash Script hash of issuer's smart contract.
   * @param networkRpcUrl URL to NEO RPC.
   * @param neoscanUrl URL to NEOSCAN API
   * @param network Network identifier used for DID
   */
  constructor(
    protected readonly scriptHash: string,
    protected readonly networkRpcUrl: string,
    protected readonly neoscanUrl: string,
    protected readonly network: DIDNetwork,
  ) {
    super(networkRpcUrl, neoscanUrl, network);
  }

  /**
   * Returns official name of the Issuer.
   * @returns Issuer's name.
   */
  public async getIssuerName(): Promise<string> {
    return this.getStringFromOperation(this.scriptHash, IssuerOperation.Name);
  }

  /**
   * Retruns DID of the issuer.
   * @returns Issuer's DID.
   */
  public getIssuerDID(): string {
    return `did:neoid:${this.network}:${this.scriptHash}`;
  }

  /**
   * Returns public key of the issuer required to validate claim's signature.
   * @returns Issuer's public key.
   */
  public async getIssuerPublicKey(): Promise<string> {
    return this.getStringFromOperation(this.scriptHash, IssuerOperation.PublicKey);
  }

  /**
   * Returns the schema for specified name.
   * @param schemaName Name of the schema.
   * @returns Detailed meta data structure of the given schema.
   */
  public async getSchemaDetails(schemaName: string): Promise<ISchema> {
    const paramSchemaName = sc.ContractParam.string(schemaName);

    const res: any = await rpc.Query.invokeFunction(
      this.scriptHash,
      IssuerOperation.GetSchemaDetails,
      paramSchemaName,
    ).execute(this.networkRpcUrl);
    const seraphResult = this.extractResult(res);

    if (!seraphResult.success) {
      throw new DigitalMEError(seraphResult.error, res.result);
    }

    const schema: ISchema = JSON.parse(rpc.StringParser(seraphResult.result));
    return schema;
  }

  /**
   * Checks if claim with the given ID is valid.
   * That is: if it was issued by this issuer and was not yet revoked.
   * Claim's optional validity dates (from-to) are not a part of this check.
   * @param claimId ID of the claim.
   * @returns True if claim is valid, false otherwise.
   */
  public async isValidClaim(claimId: string): Promise<boolean> {
    const paramClaimId = sc.ContractParam.string(claimId);
    const res: any = await rpc.Query.invokeFunction(
      this.scriptHash,
      IssuerOperation.IsValidClaim,
      paramClaimId,
    ).execute(this.networkRpcUrl);

    let result = false;
    if (res.result.stack != null && res.result.stack.length === 1) {
      result = res.result.stack[0].value;
    } else {
      const seraphResult = this.extractResult(res);
      if (!seraphResult.success) {
        throw new DigitalMEError(seraphResult.error, res.result);
      }

      result = rpc.IntegerParser(seraphResult.result) !== 0;
    }

    return result;
  }

  /**
   * Registers a new schema in Issuer's smart contract.
   * @param schema Schema to register.
   * @param issuerPrivateKey Private key of the issuer to sign the transaction.
   * @param gas Additional gas to be sent with invocation transaction.
   * @param intents Intents to be included in invocation transaction.
   * @returns Transaction hash.
   */
  public async registerSchema(
    schema: ISchema,
    issuerPrivateKey: string,
    gas?: number,
    intents?: tx.TransactionOutput[],
  ): Promise<string> {
    const paramName = sc.ContractParam.string(schema.name);
    const paramDefinition = sc.ContractParam.string(JSON.stringify(schema));
    const paramRevokable = sc.ContractParam.boolean(schema.revokable);

    const sb = new sc.ScriptBuilder();
    sb.emitAppCall(
      this.scriptHash,
      IssuerOperation.RegisterSchema,
      [paramName, paramDefinition, paramRevokable],
      false,
    );

    return this.sendSignedTransaction(sb.str, issuerPrivateKey, gas, intents);
  }

  /**
   * Injects an issued claim of specified ID into Issuer's smart contract.
   * @param claimId ID of issued claim.
   * @param issuerPrivateKey Private key of the issuer to sign the transaction.
   * @param gas Additional gas to be sent with invocation transaction.
   * @param intents Intents to be included in invocation transaction.
   * @returns Transaction hash.
   */
  public async injectClaim(
    claimId: string,
    issuerPrivateKey: string,
    gas?: number,
    intents?: tx.TransactionOutput[],
  ): Promise<string> {
    const paramClaimId = sc.ContractParam.string(claimId);

    const sb = new sc.ScriptBuilder();
    sb.emitAppCall(this.scriptHash, IssuerOperation.InjectClaim, [paramClaimId], false);

    return this.sendSignedTransaction(sb.str, issuerPrivateKey, gas, intents);
  }

  /**
   * Revokes previously issued claim of specified ID.
   * @param gas Id ID of issued claim.
   * @param issuerPrivateKey Private key of the issuer to sign the transaction.
   * @param gas Additional gas to be sent with invocation transaction.
   * @param intents Intents to be included in invocation transaction.
   * @returns Transaction hash.
   */
  public async revokeClaim(
    claimId: string,
    issuerPrivateKey: string,
    gas?: number,
    intents?: tx.TransactionOutput[],
  ): Promise<string> {
    const paramClaimId = sc.ContractParam.string(claimId);

    const sb = new sc.ScriptBuilder();
    sb.emitAppCall(this.scriptHash, IssuerOperation.RevokeClaim, [paramClaimId], false);

    return this.sendSignedTransaction(sb.str, issuerPrivateKey, gas, intents);
  }

  /**
   * Invokes schema registration operation without sending a transaction.
   * @param schema The schema to be registered.
   */
  public async registerSchemaTest(schema: ISchema): Promise<void> {
    const paramName = sc.ContractParam.string(schema.name);
    const paramDefinition = sc.ContractParam.string(JSON.stringify(schema));
    const paramRevokable = sc.ContractParam.boolean(schema.revokable);

    const res: any = await rpc.Query.invokeFunction(
      this.scriptHash,
      IssuerOperation.RegisterSchema,
      paramName,
      paramDefinition,
      paramRevokable,
    ).execute(this.networkRpcUrl);
    const seraphResult = this.extractResult(res);

    if (!seraphResult.success) {
      throw new DigitalMEError(seraphResult.error, res.result);
    }
  }

  /**
   * Invokes claim injection operation without sending a transaction.
   * @param claimId ID of the issued claim.
   */
  public async injectClaimTest(claimId: string): Promise<void> {
    const paramClaimId = sc.ContractParam.string(claimId);

    const res: any = await rpc.Query.invokeFunction(this.scriptHash, IssuerOperation.InjectClaim, paramClaimId).execute(
      this.networkRpcUrl,
    );
    const seraphResult = this.extractResult(res);

    if (!seraphResult.success) {
      throw new DigitalMEError(seraphResult.error, res.result);
    }
  }

  /**
   * Invokes claim revocation operation without sending a transaction.
   * @param claimId ID of the claim to be revoked.
   */
  public async revokeClaimTest(claimId: string): Promise<void> {
    const paramClaimId = sc.ContractParam.string(claimId);

    const res: any = await rpc.Query.invokeFunction(this.scriptHash, IssuerOperation.RevokeClaim, paramClaimId).execute(
      this.networkRpcUrl,
    );
    const seraphResult = this.extractResult(res);

    if (!seraphResult.success) {
      throw new DigitalMEError(seraphResult.error, res.result);
    }
  }
}
