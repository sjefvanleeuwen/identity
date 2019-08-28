import { tx } from '@cityofzion/neon-core';
import { rpc, sc } from '@cityofzion/neon-js';
import { DigitalMEError } from "./DigitalMEError";
import { DIDNetwork } from "./DIDNetwork";
import { RootOfTrustOperation } from "./RootOfTrustOperation";
import { DigitalMEContractBase } from './contract-base';

/**
 * Direct communication interface with Root's of Trust Seraph ID smart contract.
 */
export class DigitalMERootOfTrust extends DigitalMEContractBase {
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
   * Returns official name of the Root of Trust.
   * @returns Root of Trust name.
   */
  public async getName(): Promise<string> {
    return this.getStringFromOperation(this.scriptHash, RootOfTrustOperation.Name);
  }

  /**
   * Retruns DID of the issuer.
   * @returns Root of Trust DID.
   */
  public getDID(): string {
    return `did:neoid:${this.network}:${this.scriptHash}` 
  }

  /**
   * Checks if the given issuer with the schema name are trusted by this RoT.
   * @param issuerDID DID of the Issuer.
   * @param schemaName Name of the schema.
   * @returns True if issuer and their schema is trusted by RoT.
   */
  public async isTrusted(issuerDID: string, schemaName: string): Promise<boolean> {
    const paramIssuerDID = sc.ContractParam.string(issuerDID);
    const paramSchemaName = sc.ContractParam.string(schemaName);
    const res: any = await rpc.Query.invokeFunction(
      this.scriptHash,
      RootOfTrustOperation.IsTrusted,
      paramIssuerDID,
      paramSchemaName,
    ).execute(this.networkRpcUrl);
    const seraphResult = this.extractResult(res);
    if (!seraphResult.success) {
      throw new DigitalMEError(seraphResult.error, res.result);
    }

    return seraphResult.result.value;
  }

  /**
   * Registers the given issuer and specified schema as trusted by this RoT.
   * @param issuerDID DID of the Issuer.
   * @param schemaName Name of the schema.
   * @param rotPrivateKey Private key of the RoT to sign the transaction.
   * @param gas Additional gas to be sent with invocation transaction.
   * @param intents Intents to be included in invocation transaction.
   * @returns Transaction hash.
   */
  public async registerIssuer(
    issuerDID: string,
    schemaName: string,
    rotPrivateKey: string,
    gas?: number,
    intents?: tx.TransactionOutput[],
  ): Promise<string> {
    const paramIssuerDID = sc.ContractParam.string(issuerDID);
    const paramSchemaName = sc.ContractParam.string(schemaName);

    const sb = new sc.ScriptBuilder();
    sb.emitAppCall(this.scriptHash, RootOfTrustOperation.RegisterIssuer, [paramIssuerDID, paramSchemaName], false);

    return this.sendSignedTransaction(sb.str, rotPrivateKey, gas, intents);
  }

  /**
   * Deactivates the given issuer and specified schema as trusted trusted by this RoT.
   * @param issuerDID DID of the Issuer.
   * @param schemaName Name of the schema.
   * @param rotPrivateKey Private key of the RoT to sign the transaction.
   * @param gas Additional gas to be sent with invocation transaction.
   * @param intents Intents to be included in invocation transaction.
   * @returns Transaction hash.
   */
  public async deactivateIssuer(
    issuerDID: string,
    schemaName: string,
    rotPrivateKey: string,
    gas?: number,
    intents?: tx.TransactionOutput[],
  ): Promise<string> {
    const paramIssuerDID = sc.ContractParam.string(issuerDID);
    const paramSchemaName = sc.ContractParam.string(schemaName);

    const sb = new sc.ScriptBuilder();
    sb.emitAppCall(this.scriptHash, RootOfTrustOperation.DeactivateIssuer, [paramIssuerDID, paramSchemaName], false);

    return this.sendSignedTransaction(sb.str, rotPrivateKey, gas, intents);
  }

  /**
   * Invokes schema registration operation without sending a transaction.
   * @param issuerDID DID of the Issuer.
   * @param schemaName Name of the schema.
   */
  public async registerIssuerTest(issuerDID: string, schemaName: string): Promise<void> {
    const paramIssuerDID = sc.ContractParam.string(issuerDID);
    const paramSchemaName = sc.ContractParam.string(schemaName);

    const res: any = await rpc.Query.invokeFunction(
      this.scriptHash,
      RootOfTrustOperation.RegisterIssuer,
      paramIssuerDID,
      paramSchemaName,
    ).execute(this.networkRpcUrl);
    const seraphResult = this.extractResult(res);

    if (!seraphResult.success) {
      throw new DigitalMEError(seraphResult.error, res.result);
    }
  }

  /**
   * Invokes deactivation operation without sending a transaction.
   * @param issuerDID DID of the Issuer.
   * @param schemaName Name of the schema.
   */
  public async deactivateIssuerTest(issuerDID: string, schemaName: string): Promise<void> {
    const paramIssuerDID = sc.ContractParam.string(issuerDID);
    const paramSchemaName = sc.ContractParam.string(schemaName);

    const res: any = await rpc.Query.invokeFunction(
      this.scriptHash,
      RootOfTrustOperation.DeactivateIssuer,
      paramIssuerDID,
      paramSchemaName,
    ).execute(this.networkRpcUrl);
    const seraphResult = this.extractResult(res);

    if (!seraphResult.success) {
      throw new DigitalMEError(seraphResult.error, res.result);
    }
  }
}
