/**
 * Seraph ID error definition.
 * Used across the library.
 */
export class DigitalMEError extends Error {
  constructor(message?: string, public readonly rpcResult?: any) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
