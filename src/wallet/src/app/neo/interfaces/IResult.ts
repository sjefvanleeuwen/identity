/**
 * Result of Seraph ID smart contract operations invocation.
 * Used in case of errors or operations returning more complex structure.
 */
export interface IResult {
  success: boolean;
  error?: string;
  result?: any;
}
