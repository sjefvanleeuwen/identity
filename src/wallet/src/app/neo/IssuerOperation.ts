/**
 * Operation names in Issuer's smart contract.
 */
export enum IssuerOperation {
  GetSchemaDetails = 'GetSchemaDetails',
  RegisterSchema = 'RegisterSchema',
  InjectClaim = 'InjectClaim',
  RevokeClaim = 'RevokeClaim',
  IsValidClaim = 'IsValidClaim',
  PublicKey = 'PublicKey',
  Name = 'Name'
}
