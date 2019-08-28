/**
 * The claim.
 */
export interface IClaim {
  id: string;
  issuerDID?: string;
  ownerDID: string;
  attributes: {
    [key: string]: any;
  };
  schema: string;
  signature?: string;
  tx?: string;
  validFrom?: Date;
  validTo?: Date;
}
