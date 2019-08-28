import { tx } from '@cityofzion/neon-core';
import { api, rpc, wallet } from '@cityofzion/neon-js';
import { DigitalMEError } from "./DigitalMEError";
import { DIDNetwork } from "./DIDNetwork";
import { IResult } from "./interfaces/IResult";

/**
 * Base class for Seraph ID smart contracts.
 */
export class DigitalMEContractBase {
  /**
   * Default constructor.
   * @param networkRpcUrl URL to NEO RPC.
   * @param neoscanUrl URL to NEOSCAN API
   * @param network Network identifier used for DID
   */
  constructor(protected readonly networkRpcUrl: string, protected readonly neoscanUrl: string, protected readonly network: DIDNetwork) {}

  /**
   * Sents signed transaction to the blockchain.
   * @param gas t Script for invocation.
   * @param privateKey Private key of the transaction signer.
   * @param gas Additional gas to be sent with invocation transaction.
   * @param intents Intents to be included in invocation transaction.
   * @returns Transaction hash.
   */
  protected async sendSignedTransaction(
    script: string,
    privateKey: string,
    gas?: number,
    intents?: tx.TransactionOutput[],
  ): Promise<string> {
    const account = new wallet.Account(privateKey);
    const apiProvider = new api.neoscan.instance(this.neoscanUrl);

    const balance = await apiProvider.getBalance(account.address);
    const txConfig = {
      account,
      api: new api.neoscan.instance(this.networkRpcUrl),
      balance,
      gas,
      intents,
      script,
    };

    const invokeConfig = await api
      .fillSigningFunction(txConfig)
      .then(api.createInvocationTx)
      .then(api.modifyTransactionForEmptyTransaction)
      .then(api.signTx);

    if (invokeConfig.tx) {
      const serializedTx = invokeConfig.tx.serialize();
      const res = await rpc.Query.sendRawTransaction(serializedTx).execute(this.networkRpcUrl);
      if (!res.result) {
        throw new DigitalMEError('Transaction failed: ' + invokeConfig.tx.hash, res);
      }
    } else {
      throw new DigitalMEError('Transaction signing failed!');
    }

    return invokeConfig.tx.hash;
  }

  /**
   * Invokes a smart contract operation that returns a string.
   * @param scriptHash Hash of the smart contract's script.
   * @param operation Operation name of Seraph ID Issuer's contract.
   * @returns Operation's result as a string.
   */
  protected async getStringFromOperation(scriptHash: string, operation: string): Promise<string> {
    const res = await rpc.Query.invokeFunction(scriptHash, operation).execute(this.networkRpcUrl);
    let result: string;

    const seraphResult = this.extractResult(res);
    if (seraphResult.success) {
      result = rpc.StringParser(seraphResult.result);
    } else {
      throw new DigitalMEError(seraphResult.error, res.result);
    }

    return result;
  }

  /**
   * Extracts the result from smart contract and wraps it in ISeraphResult.
   * @param res Smart contract's invocation result.
   * @returns Seraph result.
   */
  protected extractResult(res: any): IResult {
    let result: any | undefined;
    let success = false;
    let error: string | undefined = 'Smart Contract failed!';

    if (res.result.stack != null && res.result.stack.length === 1) {
      const returnObject = res.result.stack[0];
      if (returnObject.type === 'Array') {
        const arr = returnObject.value;
        if (arr != null && arr.length === 2) {
          success = rpc.IntegerParser(arr[0]) === 1;
          error = success ? undefined : rpc.StringParser(arr[1]);
          result = success ? arr[1] : undefined;
        }
      } else {
        success = true;
        result = returnObject;
      }
    }

    const outcome: IResult = {
      error,
      result,
      success,
    };

    return outcome;
  }
}
